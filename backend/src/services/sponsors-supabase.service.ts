// ============================================
// SPONSORS SUPABASE SERVICE
// Maneja todas las operaciones de sponsors en Supabase
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';

export interface SponsorData {
  nombre: string;
  categoria: 'empresa' | 'persona';
  rol: string;
  mensaje: string;
  avatar_initials: string;
  avatar_class: string;
  avatar_url?: string;
  destacado?: boolean;
  link?: string;
  orden?: number;
}

export interface Sponsor extends SponsorData {
  id: number;
  created_at: string;
  updated_at: string;
}

class SponsorsSupabaseService {
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
      console.log('✅ SponsorsSupabaseService inicializado');
    } else {
      console.log('⚠️ SponsorsSupabaseService: Supabase no configurado, usando fallback');
    }
  }

  isEnabled(): boolean {
    return this.initialized && this.supabase !== null;
  }

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  async obtenerSponsors(): Promise<Sponsor[]> {
    if (!this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('sponsors')
        .select('*')
        .order('orden', { ascending: false });

      if (error || !data) {
        console.error('❌ Error obteniendo sponsors:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('❌ Error en obtenerSponsors:', error);
      return [];
    }
  }

  async crearSponsor(data: SponsorData): Promise<Sponsor | null> {
    if (!this.supabase) return null;

    try {
      const insertData = {
        nombre: data.nombre,
        categoria: data.categoria,
        rol: data.rol,
        mensaje: data.mensaje,
        avatar_initials: data.avatar_initials,
        avatar_class: data.avatar_class,
        avatar_url: data.avatar_url || null,
        destacado: data.destacado || false,
        link: data.link || null,
        orden: data.orden || Date.now()
      };

      const { data: sponsor, error } = await this.supabase
        .from('sponsors')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando sponsor en Supabase:', error);
        return null;
      }

      console.log('✅ Sponsor creado en Supabase:', sponsor.id);
      return sponsor;
    } catch (error) {
      console.error('❌ Error en crearSponsor:', error);
      return null;
    }
  }

  async actualizarSponsor(id: number, data: Partial<SponsorData>): Promise<Sponsor | null> {
    if (!this.supabase) return null;

    try {
      const updateData: any = {};
      
      if (data.nombre !== undefined) updateData.nombre = data.nombre;
      if (data.categoria !== undefined) updateData.categoria = data.categoria;
      if (data.rol !== undefined) updateData.rol = data.rol;
      if (data.mensaje !== undefined) updateData.mensaje = data.mensaje;
      if (data.avatar_initials !== undefined) updateData.avatar_initials = data.avatar_initials;
      if (data.avatar_class !== undefined) updateData.avatar_class = data.avatar_class;
      if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url;
      if (data.destacado !== undefined) updateData.destacado = data.destacado;
      if (data.link !== undefined) updateData.link = data.link;
      if (data.orden !== undefined) updateData.orden = data.orden;

      const { data: sponsor, error } = await this.supabase
        .from('sponsors')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando sponsor en Supabase:', error);
        return null;
      }

      console.log('✅ Sponsor actualizado en Supabase:', sponsor.id);
      return sponsor;
    } catch (error) {
      console.error('❌ Error en actualizarSponsor:', error);
      return null;
    }
  }

  async eliminarSponsor(id: number): Promise<boolean> {
    if (!this.supabase) return false;

    try {
      const { error } = await this.supabase
        .from('sponsors')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error eliminando sponsor en Supabase:', error);
        return false;
      }

      console.log('✅ Sponsor eliminado de Supabase:', id);
      return true;
    } catch (error) {
      console.error('❌ Error en eliminarSponsor:', error);
      return false;
    }
  }

  async obtenerSponsorPorId(id: number): Promise<Sponsor | null> {
    if (!this.supabase) return null;

    try {
      const { data, error } = await this.supabase
        .from('sponsors')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Error en obtenerSponsorPorId:', error);
      return null;
    }
  }
}

export const sponsorsSupabaseService = new SponsorsSupabaseService();
