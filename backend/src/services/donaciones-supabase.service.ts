// ============================================
// DONACIONES SUPABASE SERVICE
// Maneja todas las operaciones de donaciones en Supabase
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';

export interface DonacionData {
  id: string;
  monto: number;
  estado?: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado';
  metodo_pago?: string;
  donante_email?: string;
  donante_nombre?: string;
  mensaje?: string;
  mp_payment_id?: string;
  mp_preference_id?: string;
  agradecimiento_enviado?: boolean;
}

export interface Donacion extends DonacionData {
  created_at: string;
  updated_at: string;
}

class DonacionesSupabaseService {
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
      console.log('✅ DonacionesSupabaseService inicializado');
    } else {
      console.log('⚠️ DonacionesSupabaseService: Supabase no configurado, usando fallback');
    }
  }

  isEnabled(): boolean {
    return this.initialized && this.supabase !== null;
  }

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  async crearDonacion(data: DonacionData): Promise<Donacion | null> {
    if (!this.supabase) return null;

    try {
      const insertData = {
        id: data.id,
        monto: data.monto,
        estado: data.estado || 'pendiente',
        metodo_pago: data.metodo_pago || 'mercadopago',
        donante_email: data.donante_email?.toLowerCase() || null,
        donante_nombre: data.donante_nombre || null,
        mensaje: data.mensaje || null,
        mp_payment_id: data.mp_payment_id || null,
        mp_preference_id: data.mp_preference_id || null,
        agradecimiento_enviado: data.agradecimiento_enviado || false
      };

      const { data: donacion, error } = await this.supabase
        .from('donaciones')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando donación en Supabase:', error);
        return null;
      }

      console.log('✅ Donación creada en Supabase:', donacion.id);
      return donacion;
    } catch (error) {
      console.error('❌ Error en crearDonacion:', error);
      return null;
    }
  }

  async obtenerDonacionPorId(id: string): Promise<Donacion | null> {
    if (!this.supabase) return null;

    try {
      const { data, error } = await this.supabase
        .from('donaciones')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Error en obtenerDonacionPorId:', error);
      return null;
    }
  }

  async actualizarEstadoDonacion(
    id: string, 
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
        .from('donaciones')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('❌ Error actualizando estado de donación:', error);
        return false;
      }

      console.log(`✅ Estado de donación ${id} actualizado a: ${estado}`);
      return true;
    } catch (error) {
      console.error('❌ Error en actualizarEstadoDonacion:', error);
      return false;
    }
  }

  async actualizarPreferenciaDonacion(id: string, preferenceId: string): Promise<boolean> {
    if (!this.supabase) return false;

    try {
      const { error } = await this.supabase
        .from('donaciones')
        .update({ mp_preference_id: preferenceId })
        .eq('id', id);

      if (error) {
        console.error('❌ Error actualizando preferencia de donación:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error en actualizarPreferenciaDonacion:', error);
      return false;
    }
  }

  async marcarAgradecimientoEnviado(id: string): Promise<boolean> {
    if (!this.supabase) return false;

    try {
      const { error } = await this.supabase
        .from('donaciones')
        .update({ agradecimiento_enviado: true })
        .eq('id', id);

      if (error) {
        console.error('❌ Error marcando agradecimiento:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error en marcarAgradecimientoEnviado:', error);
      return false;
    }
  }

  async obtenerDonaciones(opciones?: {
    estado?: string;
    limite?: number;
    offset?: number;
  }): Promise<Donacion[]> {
    if (!this.supabase) return [];

    try {
      let query = this.supabase
        .from('donaciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (opciones?.estado) {
        query = query.eq('estado', opciones.estado);
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

      return data;
    } catch (error) {
      console.error('❌ Error en obtenerDonaciones:', error);
      return [];
    }
  }

  async obtenerEstadisticas(): Promise<{
    total: number;
    aprobadas: number;
    montoTotal: number;
    montoAprobado: number;
  }> {
    if (!this.supabase) {
      return { total: 0, aprobadas: 0, montoTotal: 0, montoAprobado: 0 };
    }

    try {
      const { data, error } = await this.supabase
        .from('donaciones')
        .select('monto, estado');

      if (error || !data) {
        return { total: 0, aprobadas: 0, montoTotal: 0, montoAprobado: 0 };
      }

      return {
        total: data.length,
        aprobadas: data.filter(d => d.estado === 'aprobado').length,
        montoTotal: data.reduce((sum, d) => sum + (d.monto || 0), 0),
        montoAprobado: data.filter(d => d.estado === 'aprobado').reduce((sum, d) => sum + (d.monto || 0), 0)
      };
    } catch (error) {
      console.error('❌ Error en obtenerEstadisticas:', error);
      return { total: 0, aprobadas: 0, montoTotal: 0, montoAprobado: 0 };
    }
  }
}

export const donacionesSupabaseService = new DonacionesSupabaseService();
