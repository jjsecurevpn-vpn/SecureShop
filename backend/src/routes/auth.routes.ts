import { Router, Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

const router = Router();

/**
 * Middleware para extraer token de Authorization header
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Middleware de autenticación
 */
async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = extractToken(req);
  
  if (!token) {
    res.status(401).json({ 
      success: false, 
      error: 'Token de acceso requerido' 
    });
    return;
  }

  const user = await authService.getUserFromToken(token);
  
  if (!user) {
    res.status(401).json({ 
      success: false, 
      error: 'Token inválido o expirado' 
    });
    return;
  }

  // Adjuntar usuario al request
  (req as any).user = user;
  (req as any).token = token;
  next();
}

// ============================================
// RUTAS PÚBLICAS
// ============================================

/**
 * POST /auth/register
 * Registrar nuevo usuario
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, nombre, telefono, referralCode } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres',
      });
      return;
    }

    const result = await authService.register({
      email,
      password,
      nombre,
      telefono,
      referralCode,
    });

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('[Auth Routes] Error en registro:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
});

/**
 * POST /auth/login
 * Iniciar sesión
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos',
      });
      return;
    }

    const result = await authService.login({ email, password });

    if (!result.success) {
      res.status(401).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('[Auth Routes] Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
});

/**
 * POST /auth/logout
 * Cerrar sesión
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (token) {
      await authService.logout(token);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[Auth Routes] Error en logout:', error);
    // Aún así responder exitosamente
    res.json({ success: true });
  }
});

/**
 * POST /auth/forgot-password
 * Solicitar recuperación de contraseña
 */
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Email es requerido',
      });
      return;
    }

    await authService.sendPasswordResetEmail(email);

    // Siempre responder exitosamente para no revelar si el email existe
    res.json({ 
      success: true,
      message: 'Si el email existe, recibirás un enlace de recuperación',
    });
  } catch (error) {
    console.error('[Auth Routes] Error en forgot-password:', error);
    res.json({ 
      success: true,
      message: 'Si el email existe, recibirás un enlace de recuperación',
    });
  }
});

/**
 * POST /auth/reset-password
 * Actualizar contraseña (con token)
 */
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const token = extractToken(req);
    const { password } = req.body;

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token de acceso requerido',
      });
      return;
    }

    if (!password || password.length < 6) {
      res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres',
      });
      return;
    }

    const result = await authService.updatePassword(token, password);

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('[Auth Routes] Error en reset-password:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
});

// ============================================
// RUTAS PROTEGIDAS
// ============================================

/**
 * GET /auth/me
 * Obtener usuario actual
 */
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    res.json({ success: true, user });
  } catch (error) {
    console.error('[Auth Routes] Error en /me:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
});

/**
 * PUT /auth/profile
 * Actualizar perfil del usuario
 */
router.put('/profile', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { nombre, telefono, avatar_url } = req.body;

    const result = await authService.updateProfile(user.id, {
      nombre,
      telefono,
      avatar_url,
    });

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('[Auth Routes] Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
});

/**
 * GET /auth/verify
 * Verificar si el token es válido
 */
router.get('/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      res.json({ valid: false });
      return;
    }

    const user = await authService.getUserFromToken(token);
    
    res.json({ 
      valid: !!user,
      user: user || undefined,
    });
  } catch (error) {
    res.json({ valid: false });
  }
});

/**
 * GET /auth/profile/:email
 * Obtener perfil por email (para verificar si existe)
 */
router.get('/profile/:email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.params;
    
    const profile = await authService.getProfileByEmail(email);
    
    if (!profile) {
      res.status(404).json({
        success: false,
        exists: false,
        error: 'Usuario no encontrado',
      });
      return;
    }

    // Solo devolver información pública
    res.json({
      success: true,
      exists: true,
      profile: {
        nombre: profile.nombre,
        referral_code: profile.referral_code,
        saldo: profile.saldo,
        total_referrals: profile.total_referrals,
      },
    });
  } catch (error) {
    console.error('[Auth Routes] Error buscando perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
});

export default router;
export { requireAuth, extractToken };
