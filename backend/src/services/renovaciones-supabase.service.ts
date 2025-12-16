// ============================================
// RENOVACIONES SUPABASE SERVICE
// Maneja todas las operaciones de renovaciones en Supabase
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';

// Tipos para renovaciones
export interface RenovacionData {
  tipo: 'cliente' | 'revendedor';
  servex_id: number;
  servex_username: string;
  operacion: 'renovacion' | 'upgrade';
  dias_agregados?: number;
  datos_anteriores?: any;
  datos_nuevos?: any;
  monto: number;
  metodo_pago?: string;
  cliente_email: string;
  cliente_nombre: string;
  mp_payment_id?: string;
  mp_preference_id?: string;
  estado?: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado';
  cupon_id?: number;
  cupon_codigo?: string;
  descuento_aplicado?: number;
}

export interface Renovacion extends RenovacionData {
  id: number;
  created_at: string;
  updated_at: string;
}

class RenovacionesSupabaseService {
  private supabase: SupabaseClient | null = null;
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const supabaseUrl = (config as any).supabase?.url || process.env.SUPABASE_URL;
    const supabaseKey = (config as any).supabase?.serviceKey || process.env.SUPABASE_SERVICE_KEY;

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      this.initialized = true;
      console.log('✅ RenovacionesSupabaseService inicializado');
    } else {
      console.log('⚠️ RenovacionesSupabaseService: Supabase no configurado, usando fallback');
    }
  }

  isEnabled(): boolean {
    return this.initialized && this.supabase !== null;
  }

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  /**
   * Crear una nueva renovación
   */
  async crearRenovacion(data: RenovacionData): Promise<Renovacion | null> {
    if (!this.supabase) return null;

    try {
      const insertData = {
        tipo: data.tipo,
        servex_id: data.servex_id,
        servex_username: data.servex_username,
        operacion: data.operacion,
        dias_agregados: data.dias_agregados || null,
        datos_anteriores: data.datos_anteriores ? JSON.stringify(data.datos_anteriores) : null,
        datos_nuevos: data.datos_nuevos ? JSON.stringify(data.datos_nuevos) : null,
        monto: data.monto,
        metodo_pago: data.metodo_pago || 'mercadopago',
        cliente_email: data.cliente_email?.toLowerCase(),
        cliente_nombre: data.cliente_nombre,
        mp_payment_id: data.mp_payment_id || null,
        mp_preference_id: data.mp_preference_id || null,
        estado: data.estado || 'pendiente',
        cupon_id: data.cupon_id || null,
        cupon_codigo: data.cupon_codigo || null,
        descuento_aplicado: data.descuento_aplicado || 0
      };

      const { data: renovacion, error } = await this.supabase
        .from('renovaciones')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando renovación en Supabase:', error);
        return null;
      }

      console.log('✅ Renovación creada en Supabase:', renovacion.id);
      return this.parseRenovacion(renovacion);
    } catch (error) {
      console.error('❌ Error en crearRenovacion:', error);
      return null;
    }
  }

  /**
   * Obtener renovación por ID
   */
  async obtenerRenovacionPorId(id: number): Promise<Renovacion | null> {
    if (!this.supabase) return null;

    try {
      const { data, error } = await this.supabase
        .from('renovaciones')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      return this.parseRenovacion(data);
    } catch (error) {
      console.error('❌ Error en obtenerRenovacionPorId:', error);
      return null;
    }
  }

  /**
   * Buscar renovación por MP Preference ID
   */
  async obtenerRenovacionPorPreferenceId(preferenceId: string): Promise<Renovacion | null> {
    if (!this.supabase) return null;

    try {
      const { data, error } = await this.supabase
        .from('renovaciones')
        .select('*')
        .eq('mp_preference_id', preferenceId)
        .single();

      if (error || !data) {
        return null;
      }

      return this.parseRenovacion(data);
    } catch (error) {
      console.error('❌ Error en obtenerRenovacionPorPreferenceId:', error);
      return null;
    }
  }

  /**
   * Buscar renovación por MP Payment ID
   */
  async obtenerRenovacionPorPaymentId(paymentId: string): Promise<Renovacion | null> {
    if (!this.supabase) return null;

    try {
      const { data, error } = await this.supabase
        .from('renovaciones')
        .select('*')
        .eq('mp_payment_id', paymentId)
        .single();

      if (error || !data) {
        return null;
      }

      return this.parseRenovacion(data);
    } catch (error) {
      console.error('❌ Error en obtenerRenovacionPorPaymentId:', error);
      return null;
    }
  }

  /**
   * Buscar renovaciones por email
   */
  async buscarRenovacionesPorEmail(email: string): Promise<Renovacion[]> {
    if (!this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('renovaciones')
        .select('*')
        .eq('cliente_email', email.toLowerCase())
        .order('created_at', { ascending: false });

      if (error || !data) {
        return [];
      }

      return data.map(r => this.parseRenovacion(r));
    } catch (error) {
      console.error('❌ Error en buscarRenovacionesPorEmail:', error);
      return [];
    }
  }

  /**
   * Buscar renovaciones por Servex ID
   */
  async buscarRenovacionesPorServexId(servexId: number): Promise<Renovacion[]> {
    if (!this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('renovaciones')
        .select('*')
        .eq('servex_id', servexId)
        .order('created_at', { ascending: false });

      if (error || !data) {
        return [];
      }

      return data.map(r => this.parseRenovacion(r));
    } catch (error) {
      console.error('❌ Error en buscarRenovacionesPorServexId:', error);
      return [];
    }
  }

  // ============================================
  // UPDATE OPERATIONS
  // ============================================

  /**
   * Actualizar estado de una renovación
   */
  async actualizarEstadoRenovacion(
    id: number, 
    estado: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado',
    mpPaymentId?: string
  ): Promise<boolean> {
    if (!this.supabase) return false;

    try {
      const updateData: any = { estado };
      if (mpPaymentId) {
        updateData.mp_payment_id = mpPaymentId;
      }

      const { error } = await this.supabase
        .from('renovaciones')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('❌ Error actualizando estado de renovación:', error);
        return false;
      }

      console.log(`✅ Estado de renovación ${id} actualizado a: ${estado}`);
      return true;
    } catch (error) {
      console.error('❌ Error en actualizarEstadoRenovacion:', error);
      return false;
    }
  }

  /**
   * Guardar información adicional de la renovación (después del proceso en Servex)
   */
  async guardarInfoRenovacion(
    id: number,
    datosNuevos: any
  ): Promise<boolean> {
    if (!this.supabase) return false;

    try {
      const { error } = await this.supabase
        .from('renovaciones')
        .update({
          datos_nuevos: JSON.stringify(datosNuevos)
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Error guardando info de renovación:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error en guardarInfoRenovacion:', error);
      return false;
    }
  }

  /**
   * Refrescar timestamp de una renovación (para retry logic)
   */
  async refrescarTimestampRenovacion(id: number): Promise<boolean> {
    if (!this.supabase) return false;

    try {
      // El trigger se encarga de actualizar updated_at automáticamente
      const { error } = await this.supabase
        .from('renovaciones')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('❌ Error refrescando timestamp:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error en refrescarTimestampRenovacion:', error);
      return false;
    }
  }

  // ============================================
  // QUERY OPERATIONS
  // ============================================

  /**
   * Obtener renovaciones pendientes antiguas (para procesamiento automático)
   */
  async obtenerRenovacionesPendientes(minutosAntiguedad: number = 5, limite: number = 10): Promise<Renovacion[]> {
    if (!this.supabase) return [];

    try {
      const fechaLimite = new Date(Date.now() - minutosAntiguedad * 60 * 1000).toISOString();

      const { data, error } = await this.supabase
        .from('renovaciones')
        .select('*')
        .eq('estado', 'pendiente')
        .lte('updated_at', fechaLimite)
        .order('updated_at', { ascending: true })
        .limit(limite);

      if (error || !data) {
        return [];
      }

      return data.map(r => this.parseRenovacion(r));
    } catch (error) {
      console.error('❌ Error en obtenerRenovacionesPendientes:', error);
      return [];
    }
  }

  /**
   * Obtener todas las renovaciones (con paginación opcional)
   */
  async obtenerRenovaciones(
    opciones?: {
      tipo?: 'cliente' | 'revendedor';
      estado?: string;
      desde?: Date;
      hasta?: Date;
      limite?: number;
      offset?: number;
    }
  ): Promise<Renovacion[]> {
    if (!this.supabase) return [];

    try {
      let query = this.supabase
        .from('renovaciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (opciones?.tipo) {
        query = query.eq('tipo', opciones.tipo);
      }
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
      if (opciones?.offset) {
        query = query.range(opciones.offset, opciones.offset + (opciones.limite || 50) - 1);
      }

      const { data, error } = await query;

      if (error || !data) {
        return [];
      }

      return data.map(r => this.parseRenovacion(r));
    } catch (error) {
      console.error('❌ Error en obtenerRenovaciones:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas de renovaciones
   */
  async obtenerEstadisticas(desde?: Date, hasta?: Date): Promise<{
    total: number;
    aprobadas: number;
    pendientes: number;
    montoTotal: number;
    montoAprobado: number;
    porTipo: { cliente: number; revendedor: number };
  }> {
    if (!this.supabase) {
      return { total: 0, aprobadas: 0, pendientes: 0, montoTotal: 0, montoAprobado: 0, porTipo: { cliente: 0, revendedor: 0 } };
    }

    try {
      const { data, error } = await this.supabase
        .rpc('renovaciones_estadisticas', {
          p_desde: desde?.toISOString() || null,
          p_hasta: hasta?.toISOString() || null
        });

      if (error || !data || data.length === 0) {
        // Fallback: calcular manualmente
        let query = this.supabase.from('renovaciones').select('*');
        if (desde) query = query.gte('created_at', desde.toISOString());
        if (hasta) query = query.lte('created_at', hasta.toISOString());
        
        const { data: renovaciones } = await query;
        
        if (!renovaciones) {
          return { total: 0, aprobadas: 0, pendientes: 0, montoTotal: 0, montoAprobado: 0, porTipo: { cliente: 0, revendedor: 0 } };
        }

        return {
          total: renovaciones.length,
          aprobadas: renovaciones.filter(r => r.estado === 'aprobado').length,
          pendientes: renovaciones.filter(r => r.estado === 'pendiente').length,
          montoTotal: renovaciones.reduce((sum, r) => sum + (r.monto || 0), 0),
          montoAprobado: renovaciones.filter(r => r.estado === 'aprobado').reduce((sum, r) => sum + (r.monto || 0), 0),
          porTipo: {
            cliente: renovaciones.filter(r => r.tipo === 'cliente').length,
            revendedor: renovaciones.filter(r => r.tipo === 'revendedor').length
          }
        };
      }

      const stats = data[0];
      return {
        total: Number(stats.total_renovaciones) || 0,
        aprobadas: Number(stats.renovaciones_aprobadas) || 0,
        pendientes: Number(stats.renovaciones_pendientes) || 0,
        montoTotal: Number(stats.monto_total) || 0,
        montoAprobado: Number(stats.monto_aprobado) || 0,
        porTipo: stats.por_tipo || { cliente: 0, revendedor: 0 }
      };
    } catch (error) {
      console.error('❌ Error en obtenerEstadisticas:', error);
      return { total: 0, aprobadas: 0, pendientes: 0, montoTotal: 0, montoAprobado: 0, porTipo: { cliente: 0, revendedor: 0 } };
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  private parseRenovacion(data: any): Renovacion {
    return {
      ...data,
      datos_anteriores: data.datos_anteriores 
        ? (typeof data.datos_anteriores === 'string' ? JSON.parse(data.datos_anteriores) : data.datos_anteriores)
        : null,
      datos_nuevos: data.datos_nuevos
        ? (typeof data.datos_nuevos === 'string' ? JSON.parse(data.datos_nuevos) : data.datos_nuevos)
        : null
    };
  }
}

export const renovacionesSupabaseService = new RenovacionesSupabaseService();
