import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

/**
 * Tipos para autenticación
 */
export interface AuthUser {
  id: string;
  email: string;
  nombre?: string;
  telefono?: string;
  avatar_url?: string;
  saldo: number;
  referral_code: string | null;
  referred_by: string | null;
  total_referrals: number;
  total_earned: number;
  created_at: string;
  updated_at: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  nombre?: string;
  telefono?: string;
  referralCode?: string; // Código de quien lo refirió
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  session?: Session;
  error?: string;
}

export interface ProfileUpdateInput {
  nombre?: string;
  telefono?: string;
  avatar_url?: string;
}

/**
 * Servicio de Autenticación con Supabase
 * Maneja registro, login, logout y gestión de perfiles
 */
export class AuthService {
  private client: SupabaseClient | null = null;
  private enabled: boolean = false;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    if (url && serviceKey) {
      this.client = createClient(url, serviceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      this.enabled = true;
      console.log('[Auth] Servicio de autenticación inicializado');
    } else {
      console.warn('[Auth] Supabase no configurado. Servicio deshabilitado.');
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // ============================================
  // REGISTRO
  // ============================================

  /**
   * Registrar nuevo usuario
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    if (!this.client) {
      return { success: false, error: 'Servicio de autenticación no disponible' };
    }

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await this.client.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true, // Auto-confirmar email
        user_metadata: {
          nombre: input.nombre || '',
          telefono: input.telefono || '',
        },
      });

      if (authError) {
        console.error('[Auth] Error en registro:', authError);
        
        // Traducir errores comunes
        if (authError.message.includes('already registered')) {
          return { success: false, error: 'Este email ya está registrado' };
        }
        if (authError.message.includes('invalid email')) {
          return { success: false, error: 'Email inválido' };
        }
        if (authError.message.includes('password')) {
          return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
        }
        
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Error al crear usuario' };
      }

      // 2. El trigger en Supabase debería crear el perfil automáticamente
      // Pero lo verificamos y completamos si es necesario
      await this.ensureProfileExists(authData.user.id, input.email, input.nombre, input.telefono);

      // 3. Si viene con código de referido, procesar
      if (input.referralCode) {
        await this.processReferralOnRegister(authData.user.id, input.referralCode);
      }

      // 4. Obtener perfil completo
      const profile = await this.getProfile(authData.user.id);

      console.log('[Auth] Usuario registrado:', input.email);

      return {
        success: true,
        user: profile || undefined,
      };
    } catch (error) {
      console.error('[Auth] Error en registro:', error);
      return { success: false, error: 'Error interno al registrar usuario' };
    }
  }

  // ============================================
  // LOGIN
  // ============================================

  /**
   * Iniciar sesión
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    if (!this.client) {
      return { success: false, error: 'Servicio de autenticación no disponible' };
    }

    try {
      // Usamos signInWithPassword a través del admin client
      const { data, error } = await this.client.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error) {
        console.error('[Auth] Error en login:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Email o contraseña incorrectos' };
        }
        if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'Debes confirmar tu email primero' };
        }
        
        return { success: false, error: error.message };
      }

      if (!data.user || !data.session) {
        return { success: false, error: 'Error al iniciar sesión' };
      }

      // Obtener perfil completo
      const profile = await this.getProfile(data.user.id);

      console.log('[Auth] Login exitoso:', input.email);

      return {
        success: true,
        user: profile || undefined,
        session: data.session,
      };
    } catch (error) {
      console.error('[Auth] Error en login:', error);
      return { success: false, error: 'Error interno al iniciar sesión' };
    }
  }

  // ============================================
  // LOGOUT
  // ============================================

  /**
   * Cerrar sesión (invalida el token en el servidor)
   */
  async logout(accessToken: string): Promise<{ success: boolean; error?: string }> {
    if (!this.client) {
      return { success: false, error: 'Servicio no disponible' };
    }

    try {
      // Obtener usuario del token para invalidar
      const { data: { user }, error: userError } = await this.client.auth.getUser(accessToken);
      
      if (userError || !user) {
        // Token ya inválido o expirado, considerar como logout exitoso
        return { success: true };
      }

      // Invalidar todas las sesiones del usuario (opcional, más seguro)
      await this.client.auth.admin.signOut(accessToken);

      console.log('[Auth] Logout exitoso para usuario:', user.email);
      return { success: true };
    } catch (error) {
      console.error('[Auth] Error en logout:', error);
      // Aún así considerar exitoso ya que el cliente limpiará su estado
      return { success: true };
    }
  }

  // ============================================
  // PERFIL
  // ============================================

  /**
   * Obtener perfil de usuario por ID
   */
  async getProfile(userId: string): Promise<AuthUser | null> {
    if (!this.client) return null;

    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[Auth] Error obteniendo perfil:', error);
        return null;
      }

      return data as AuthUser;
    } catch (error) {
      console.error('[Auth] Error obteniendo perfil:', error);
      return null;
    }
  }

  /**
   * Obtener perfil por email
   */
  async getProfileByEmail(email: string): Promise<AuthUser | null> {
    if (!this.client) return null;

    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No encontrado
          return null;
        }
        console.error('[Auth] Error buscando perfil por email:', error);
        return null;
      }

      return data as AuthUser;
    } catch (error) {
      console.error('[Auth] Error buscando perfil por email:', error);
      return null;
    }
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateProfile(userId: string, input: ProfileUpdateInput): Promise<AuthResponse> {
    if (!this.client) {
      return { success: false, error: 'Servicio no disponible' };
    }

    try {
      const { data, error } = await this.client
        .from('profiles')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('[Auth] Error actualizando perfil:', error);
        return { success: false, error: 'Error al actualizar perfil' };
      }

      return { success: true, user: data as AuthUser };
    } catch (error) {
      console.error('[Auth] Error actualizando perfil:', error);
      return { success: false, error: 'Error interno' };
    }
  }

  // ============================================
  // VERIFICACIÓN DE TOKEN
  // ============================================

  /**
   * Verificar token de acceso y obtener usuario
   */
  async verifyToken(accessToken: string): Promise<{ user: User | null; error?: string }> {
    if (!this.client) {
      return { user: null, error: 'Servicio no disponible' };
    }

    try {
      const { data: { user }, error } = await this.client.auth.getUser(accessToken);

      if (error) {
        return { user: null, error: 'Token inválido o expirado' };
      }

      return { user };
    } catch (error) {
      return { user: null, error: 'Error verificando token' };
    }
  }

  /**
   * Obtener usuario completo (auth + profile) desde token
   */
  async getUserFromToken(accessToken: string): Promise<AuthUser | null> {
    const { user, error } = await this.verifyToken(accessToken);
    
    if (error || !user) {
      return null;
    }

    return this.getProfile(user.id);
  }

  // ============================================
  // RECUPERACIÓN DE CONTRASEÑA
  // ============================================

  /**
   * Enviar email de recuperación de contraseña
   */
  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
    if (!this.client) {
      return { success: false, error: 'Servicio no disponible' };
    }

    try {
      const { error } = await this.client.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL || 'https://secureshop.com.ar'}/reset-password`,
      });

      if (error) {
        console.error('[Auth] Error enviando reset password:', error);
        return { success: false, error: 'Error al enviar email de recuperación' };
      }

      console.log('[Auth] Email de recuperación enviado a:', email);
      return { success: true };
    } catch (error) {
      console.error('[Auth] Error enviando reset password:', error);
      return { success: false, error: 'Error interno' };
    }
  }

  /**
   * Actualizar contraseña (requiere token válido)
   */
  async updatePassword(accessToken: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (!this.client) {
      return { success: false, error: 'Servicio no disponible' };
    }

    try {
      // Verificar token primero
      const { user, error: verifyError } = await this.verifyToken(accessToken);
      
      if (verifyError || !user) {
        return { success: false, error: 'Token inválido' };
      }

      // Actualizar contraseña usando admin
      const { error } = await this.client.auth.admin.updateUserById(user.id, {
        password: newPassword,
      });

      if (error) {
        console.error('[Auth] Error actualizando contraseña:', error);
        return { success: false, error: 'Error al actualizar contraseña' };
      }

      console.log('[Auth] Contraseña actualizada para:', user.email);
      return { success: true };
    } catch (error) {
      console.error('[Auth] Error actualizando contraseña:', error);
      return { success: false, error: 'Error interno' };
    }
  }

  // ============================================
  // HELPERS PRIVADOS
  // ============================================

  /**
   * Asegurar que existe el perfil del usuario
   */
  private async ensureProfileExists(
    userId: string,
    email: string,
    nombre?: string,
    telefono?: string
  ): Promise<void> {
    if (!this.client) return;

    try {
      // Verificar si ya existe
      const { data: existing } = await this.client
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (existing) {
        // Ya existe, actualizar si hay datos nuevos
        if (nombre || telefono) {
          await this.client
            .from('profiles')
            .update({
              ...(nombre && { nombre }),
              ...(telefono && { telefono }),
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
        }
        return;
      }

      // Generar código de referido único
      const referralCode = await this.generateUniqueReferralCode(email);

      // Crear perfil
      await this.client.from('profiles').insert({
        id: userId,
        email: email.toLowerCase(),
        nombre: nombre || null,
        telefono: telefono || null,
        saldo: 0,
        referral_code: referralCode,
        total_referrals: 0,
        total_earned: 0,
      });

      console.log('[Auth] Perfil creado para:', email);
    } catch (error) {
      console.error('[Auth] Error asegurando perfil:', error);
    }
  }

  /**
   * Generar código de referido único
   */
  private async generateUniqueReferralCode(email: string): Promise<string> {
    if (!this.client) return '';

    // Generar código base desde el email
    const baseCode = email
      .split('@')[0]
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .substring(0, 8);

    let code = baseCode;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      // Verificar si el código ya existe
      const { data: existing } = await this.client
        .from('profiles')
        .select('id')
        .eq('referral_code', code)
        .single();

      if (!existing) {
        return code;
      }

      // Agregar números aleatorios
      const random = Math.floor(Math.random() * 1000);
      code = `${baseCode}${random}`;
      attempts++;
    }

    // Fallback: usar timestamp
    return `${baseCode}${Date.now().toString(36).toUpperCase()}`;
  }

  /**
   * Procesar referido al registrarse
   */
  private async processReferralOnRegister(newUserId: string, referralCode: string): Promise<void> {
    if (!this.client) return;

    try {
      // Buscar quién tiene ese código de referido
      const { data: referrer } = await this.client
        .from('profiles')
        .select('id, email')
        .eq('referral_code', referralCode.toUpperCase())
        .single();

      if (!referrer) {
        console.log('[Auth] Código de referido no encontrado:', referralCode);
        return;
      }

      // Actualizar el nuevo usuario con referred_by
      await this.client
        .from('profiles')
        .update({
          referred_by: referrer.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', newUserId);

      // Incrementar contador de referidos del referidor
      await this.client.rpc('increment_referral_count', {
        user_id: referrer.id,
      });

      console.log('[Auth] Referido procesado:', referralCode, '-> nuevo usuario vinculado');
    } catch (error) {
      console.error('[Auth] Error procesando referido:', error);
    }
  }
}

// Singleton para uso global
export const authService = new AuthService();
