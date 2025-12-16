import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Pago } from '../types';

/**
 * Interfaz para crear un pago en Supabase
 */
interface CrearPagoSupabaseInput {
  id: string;
  plan_id: number;
  monto: number;
  estado?: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado';
  metodo_pago?: string;
  cliente_email: string;
  cliente_nombre: string;
  mp_payment_id?: string;
  mp_preference_id?: string;
  cupon_id?: number;
  cupon_codigo?: string;
  descuento_aplicado?: number;
  referido_codigo?: string;
  referido_descuento?: number;
  saldo_usado?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Servicio de Pagos con Supabase
 * Maneja todas las operaciones de pagos en Supabase
 */
export class PagosSupabaseService {
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
      console.log('[Pagos Supabase] Servicio inicializado');
    } else {
      console.warn('[Pagos Supabase] Supabase no configurado. Servicio deshabilitado.');
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // ============================================
  // CRUD BÁSICO
  // ============================================

  /**
   * Crear un nuevo pago
   */
  async crearPago(input: CrearPagoSupabaseInput): Promise<Pago> {
    if (!this.client) {
      throw new Error('Servicio no disponible');
    }

    const { data, error } = await this.client
      .from('pagos')
      .insert({
        id: input.id,
        plan_id: input.plan_id,
        monto: input.monto,
        estado: input.estado || 'pendiente',
        metodo_pago: input.metodo_pago || 'mercadopago',
        cliente_email: input.cliente_email.toLowerCase(),
        cliente_nombre: input.cliente_nombre,
        mp_payment_id: input.mp_payment_id || null,
        mp_preference_id: input.mp_preference_id || null,
        cupon_id: input.cupon_id || null,
        cupon_codigo: input.cupon_codigo || null,
        descuento_aplicado: input.descuento_aplicado || 0,
        referido_codigo: input.referido_codigo || null,
        referido_descuento: input.referido_descuento || 0,
        saldo_usado: input.saldo_usado || 0,
        metadata: input.metadata || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[Pagos Supabase] Error creando pago:', error);
      throw new Error(`Error al crear pago: ${error.message}`);
    }

    console.log(`[Pagos Supabase] ✅ Pago ${input.id} creado`);
    return this.mapRowToPago(data);
  }

  /**
   * Obtener pago por ID
   */
  async obtenerPagoPorId(id: string): Promise<Pago | null> {
    if (!this.client) return null;

    const { data, error } = await this.client
      .from('pagos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('[Pagos Supabase] Error obteniendo pago:', error);
      return null;
    }

    return this.mapRowToPago(data);
  }

  /**
   * Obtener pago por MP Payment ID
   */
  async obtenerPagoPorMpPaymentId(mpPaymentId: string): Promise<Pago | null> {
    if (!this.client) return null;

    const { data, error } = await this.client
      .from('pagos')
      .select('*')
      .eq('mp_payment_id', mpPaymentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('[Pagos Supabase] Error obteniendo pago por MP ID:', error);
      return null;
    }

    return this.mapRowToPago(data);
  }

  /**
   * Obtener pago por MP Preference ID
   */
  async obtenerPagoPorPreferenceId(preferenceId: string): Promise<Pago | null> {
    if (!this.client) return null;

    const { data, error } = await this.client
      .from('pagos')
      .select('*')
      .eq('mp_preference_id', preferenceId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('[Pagos Supabase] Error obteniendo pago por preference:', error);
      return null;
    }

    return this.mapRowToPago(data);
  }

  /**
   * Actualizar estado de un pago
   */
  async actualizarEstadoPago(
    pagoId: string,
    estado: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado',
    mpPaymentId?: string
  ): Promise<boolean> {
    if (!this.client) return false;

    const updateData: Record<string, unknown> = { estado };
    if (mpPaymentId) {
      updateData.mp_payment_id = mpPaymentId;
    }

    const { error } = await this.client
      .from('pagos')
      .update(updateData)
      .eq('id', pagoId);

    if (error) {
      console.error('[Pagos Supabase] Error actualizando estado:', error);
      return false;
    }

    console.log(`[Pagos Supabase] ✅ Pago ${pagoId} actualizado a ${estado}`);
    return true;
  }

  /**
   * Actualizar datos de Servex en un pago
   */
  async actualizarDatosServex(
    pagoId: string,
    datos: {
      servex_cuenta_id?: number;
      servex_username?: string;
      servex_password?: string;
      servex_categoria?: string;
      servex_expiracion?: string;
      servex_connection_limit?: number;
    }
  ): Promise<boolean> {
    if (!this.client) return false;

    const { error } = await this.client
      .from('pagos')
      .update({
        servex_cuenta_id: datos.servex_cuenta_id,
        servex_username: datos.servex_username,
        servex_password: datos.servex_password,
        servex_categoria: datos.servex_categoria,
        servex_expiracion: datos.servex_expiracion,
        servex_connection_limit: datos.servex_connection_limit,
      })
      .eq('id', pagoId);

    if (error) {
      console.error('[Pagos Supabase] Error actualizando datos Servex:', error);
      return false;
    }

    console.log(`[Pagos Supabase] ✅ Datos Servex actualizados para pago ${pagoId}`);
    return true;
  }

  /**
   * Guardar preference ID de MercadoPago
   */
  async guardarPreferenceId(pagoId: string, preferenceId: string): Promise<boolean> {
    if (!this.client) return false;

    const { error } = await this.client
      .from('pagos')
      .update({ mp_preference_id: preferenceId })
      .eq('id', pagoId);

    if (error) {
      console.error('[Pagos Supabase] Error guardando preference ID:', error);
      return false;
    }

    return true;
  }

  /**
   * Obtener pagos por email del cliente
   */
  async obtenerPagosPorEmail(email: string): Promise<Pago[]> {
    if (!this.client) return [];

    const { data, error } = await this.client
      .from('pagos')
      .select('*')
      .eq('cliente_email', email.toLowerCase())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Pagos Supabase] Error obteniendo pagos por email:', error);
      return [];
    }

    return (data || []).map((row) => this.mapRowToPago(row));
  }

  /**
   * Obtener pagos pendientes
   */
  async obtenerPagosPendientes(): Promise<Pago[]> {
    if (!this.client) return [];

    const { data, error } = await this.client
      .from('pagos')
      .select('*')
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Pagos Supabase] Error obteniendo pagos pendientes:', error);
      return [];
    }

    return (data || []).map((row) => this.mapRowToPago(row));
  }

  /**
   * Obtener todos los pagos con filtros opcionales
   */
  async obtenerPagos(opciones?: {
    estado?: string;
    desde?: Date;
    hasta?: Date;
    limite?: number;
  }): Promise<Pago[]> {
    if (!this.client) return [];

    let query = this.client
      .from('pagos')
      .select('*')
      .order('created_at', { ascending: false });

    if (opciones?.estado) {
      query = query.eq('estado', opciones.estado);
    }
    if (opciones?.desde) {
      query = query.gte('created_at', opciones.desde.toISOString());
    }
    if (opciones?.hasta) {
      query = query.lte('created_at', opciones.hasta.toISOString());
    }
    if (opciones?.limite) {
      query = query.limit(opciones.limite);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Pagos Supabase] Error obteniendo pagos:', error);
      return [];
    }

    return (data || []).map((row) => this.mapRowToPago(row));
  }

  /**
   * Actualizar metadata de un pago
   */
  async actualizarMetadata(pagoId: string, metadata: Record<string, unknown>): Promise<boolean> {
    if (!this.client) return false;

    // Obtener metadata actual y mergear
    const pago = await this.obtenerPagoPorId(pagoId);
    if (!pago) return false;

    const { error } = await this.client
      .from('pagos')
      .update({ 
        metadata: { 
          ...(typeof (pago as unknown as { metadata?: Record<string, unknown> }).metadata === 'object' 
            ? (pago as unknown as { metadata?: Record<string, unknown> }).metadata 
            : {}), 
          ...metadata 
        } 
      })
      .eq('id', pagoId);

    if (error) {
      console.error('[Pagos Supabase] Error actualizando metadata:', error);
      return false;
    }

    return true;
  }

  // ============================================
  // PLANES
  // ============================================

  /**
   * Obtener plan por ID
   */
  async obtenerPlanPorId(id: number): Promise<{
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    dias: number;
    connection_limit: number;
    activo: boolean;
  } | null> {
    if (!this.client) return null;

    const { data, error } = await this.client
      .from('planes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('[Pagos Supabase] Error obteniendo plan:', error);
      return null;
    }

    return {
      id: data.id,
      nombre: data.nombre,
      descripcion: data.descripcion || '',
      precio: Number(data.precio),
      dias: data.dias,
      connection_limit: data.connection_limit,
      activo: data.activo,
    };
  }

  /**
   * Obtener todos los planes activos
   */
  async obtenerPlanes(): Promise<Array<{
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    dias: number;
    connection_limit: number;
    activo: boolean;
  }>> {
    if (!this.client) return [];

    const { data, error } = await this.client
      .from('planes')
      .select('*')
      .eq('activo', true)
      .order('dias', { ascending: true })
      .order('connection_limit', { ascending: true });

    if (error) {
      console.error('[Pagos Supabase] Error obteniendo planes:', error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion || '',
      precio: Number(row.precio),
      dias: row.dias,
      connection_limit: row.connection_limit,
      activo: row.activo,
    }));
  }

  // ============================================
  // MAPEO DE DATOS
  // ============================================

  private mapRowToPago(row: Record<string, unknown>): Pago {
    return {
      id: row.id as string,
      plan_id: row.plan_id as number,
      monto: Number(row.monto),
      estado: row.estado as 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado',
      metodo_pago: row.metodo_pago as string,
      cliente_email: row.cliente_email as string,
      cliente_nombre: row.cliente_nombre as string,
      mp_payment_id: row.mp_payment_id as string | undefined,
      mp_preference_id: row.mp_preference_id as string | undefined,
      servex_cuenta_id: row.servex_cuenta_id as number | undefined,
      servex_username: row.servex_username as string | undefined,
      servex_password: row.servex_password as string | undefined,
      servex_categoria: row.servex_categoria as string | undefined,
      servex_expiracion: row.servex_expiracion as string | undefined,
      servex_connection_limit: row.servex_connection_limit as number | undefined,
      cupon_id: row.cupon_id as number | undefined,
      descuento_aplicado: row.descuento_aplicado ? Number(row.descuento_aplicado) : undefined,
      fecha_creacion: new Date(row.created_at as string),
      fecha_actualizacion: new Date(row.updated_at as string),
    };
  }
}

// Singleton
export const pagosSupabaseService = new PagosSupabaseService();
