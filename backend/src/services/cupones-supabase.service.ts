import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Cupon, CrearCuponInput, ValidacionCupon } from '../types';

/**
 * Servicio de Cupones con Supabase
 * Maneja cupones de descuento para la tienda
 */
export class CuponesSupabaseService {
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
      console.log('[Cupones Supabase] Servicio inicializado');
    } else {
      console.warn('[Cupones Supabase] Supabase no configurado. Servicio deshabilitado.');
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // ============================================
  // CRUD BÁSICO
  // ============================================

  /**
   * Crear un nuevo cupón
   */
  async crearCupon(input: CrearCuponInput): Promise<Cupon> {
    if (!this.client) {
      throw new Error('Servicio no disponible');
    }

    // Verificar que el código no exista
    const existente = await this.obtenerCuponPorCodigo(input.codigo);
    if (existente) {
      throw new Error('El código de cupón ya existe');
    }

    // Validaciones
    if (input.tipo === 'porcentaje' && (input.valor <= 0 || input.valor > 100)) {
      throw new Error('El porcentaje debe estar entre 1 y 100');
    }

    if (input.tipo === 'monto_fijo' && input.valor <= 0) {
      throw new Error('El monto fijo debe ser mayor a 0');
    }

    const { data, error } = await this.client
      .from('cupones')
      .insert({
        codigo: input.codigo.toUpperCase(),
        tipo: input.tipo,
        valor: input.valor,
        limite_uso: input.limite_uso || null,
        fecha_expiracion: input.fecha_expiracion?.toISOString() || null,
        planes_aplicables: input.planes_aplicables || null,
        activo: input.activo !== undefined ? input.activo : true,
        descripcion: input.descripcion || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[Cupones Supabase] Error creando cupón:', error);
      throw new Error('Error al crear cupón');
    }

    console.log(`[Cupones Supabase] ✅ Cupón ${input.codigo} creado`);
    return this.mapRowToCupon(data);
  }

  /**
   * Obtener cupón por ID
   */
  async obtenerCuponPorId(id: number): Promise<Cupon | null> {
    if (!this.client) return null;

    const { data, error } = await this.client
      .from('cupones')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('[Cupones Supabase] Error obteniendo cupón:', error);
      return null;
    }

    return this.mapRowToCupon(data);
  }

  /**
   * Obtener cupón por código
   */
  async obtenerCuponPorCodigo(codigo: string): Promise<Cupon | null> {
    if (!this.client) return null;

    const { data, error } = await this.client
      .from('cupones')
      .select('*')
      .eq('codigo', codigo.toUpperCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('[Cupones Supabase] Error buscando cupón:', error);
      return null;
    }

    return this.mapRowToCupon(data);
  }

  /**
   * Listar todos los cupones
   */
  async listarCupones(): Promise<Cupon[]> {
    if (!this.client) return [];

    const { data, error } = await this.client
      .from('cupones')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Cupones Supabase] Error listando cupones:', error);
      return [];
    }

    return data.map((row: any) => this.mapRowToCupon(row));
  }

  // ============================================
  // VALIDACIÓN
  // ============================================

  /**
   * Validar un cupón
   */
  async validarCupon(codigo: string, planId?: number, clienteEmail?: string): Promise<ValidacionCupon> {
    if (!this.client) {
      return { valido: false, mensaje_error: 'Servicio no disponible' };
    }

    try {
      const { data, error } = await this.client.rpc('validar_cupon', {
        p_codigo: codigo,
        p_plan_id: planId || null,
        p_cliente_email: clienteEmail || null,
      });

      if (error) {
        console.error('[Cupones Supabase] Error validando cupón:', error);
        return { valido: false, mensaje_error: 'Error validando cupón' };
      }

      const result = data?.[0];
      if (!result) {
        return { valido: false, mensaje_error: 'Error en validación' };
      }

      if (!result.valido) {
        return { valido: false, mensaje_error: result.mensaje };
      }

      // Obtener cupón completo
      const cupon = await this.obtenerCuponPorId(result.cupon_id);

      return {
        valido: true,
        cupon: cupon || undefined,
        tipo_descuento: result.tipo,
        descuento: 0, // Se calcula en el servicio de tienda
      };
    } catch (error) {
      console.error('[Cupones Supabase] Error:', error);
      return { valido: false, mensaje_error: 'Error interno' };
    }
  }

  // ============================================
  // APLICAR CUPÓN
  // ============================================

  /**
   * Aplicar cupón (incrementa uso y registra)
   */
  async aplicarCupon(
    cuponId: number,
    clienteEmail: string,
    pagoId: string,
    montoOriginal: number,
    descuentoAplicado: number
  ): Promise<boolean> {
    if (!this.client) return false;

    try {
      const { data, error } = await this.client.rpc('aplicar_cupon', {
        p_cupon_id: cuponId,
        p_usuario_email: clienteEmail,
        p_pago_id: pagoId,
        p_monto_original: montoOriginal,
        p_descuento_aplicado: descuentoAplicado,
      });

      if (error) {
        console.error('[Cupones Supabase] Error aplicando cupón:', error);
        return false;
      }

      console.log(`[Cupones Supabase] ✅ Cupón ${cuponId} aplicado para ${clienteEmail}`);
      return data === true;
    } catch (error) {
      console.error('[Cupones Supabase] Error:', error);
      return false;
    }
  }

  /**
   * Calcular descuento
   */
  calcularDescuento(cupon: Cupon, precioOriginal: number): number {
    if (cupon.tipo === 'porcentaje') {
      return Math.round((precioOriginal * cupon.valor / 100) * 100) / 100;
    } else {
      return Math.min(cupon.valor, precioOriginal);
    }
  }

  // ============================================
  // ACTUALIZAR / ELIMINAR
  // ============================================

  /**
   * Actualizar cupón
   */
  async actualizarCupon(id: number, updates: Partial<CrearCuponInput & { activo: boolean }>): Promise<Cupon | null> {
    if (!this.client) return null;

    const updateData: any = { updated_at: new Date().toISOString() };

    if (updates.codigo !== undefined) updateData.codigo = updates.codigo.toUpperCase();
    if (updates.tipo !== undefined) updateData.tipo = updates.tipo;
    if (updates.valor !== undefined) updateData.valor = updates.valor;
    if (updates.limite_uso !== undefined) updateData.limite_uso = updates.limite_uso;
    if (updates.fecha_expiracion !== undefined) updateData.fecha_expiracion = updates.fecha_expiracion.toISOString();
    if (updates.planes_aplicables !== undefined) updateData.planes_aplicables = updates.planes_aplicables;
    if (updates.activo !== undefined) updateData.activo = updates.activo;
    if (updates.descripcion !== undefined) updateData.descripcion = updates.descripcion;

    const { data, error } = await this.client
      .from('cupones')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Cupones Supabase] Error actualizando:', error);
      return null;
    }

    return this.mapRowToCupon(data);
  }

  /**
   * Desactivar cupón
   */
  async desactivarCupon(id: number): Promise<void> {
    if (!this.client) return;

    await this.client
      .from('cupones')
      .update({ activo: false, updated_at: new Date().toISOString() })
      .eq('id', id);
  }

  /**
   * Eliminar cupón
   */
  async eliminarCupon(id: number): Promise<void> {
    if (!this.client) throw new Error('Servicio no disponible');

    // Primero eliminar usos
    await this.client.from('cupon_usos').delete().eq('cupon_id', id);

    // Luego eliminar cupón
    const { error } = await this.client.from('cupones').delete().eq('id', id);

    if (error) {
      console.error('[Cupones Supabase] Error eliminando:', error);
      throw new Error('Error al eliminar cupón');
    }

    console.log(`[Cupones Supabase] ✅ Cupón ${id} eliminado`);
  }

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  /**
   * Obtener estadísticas de cupones
   */
  async obtenerEstadisticas(): Promise<{
    total_cupones: number;
    cupones_activos: number;
    usos_totales: number;
    cupones_expirados: number;
  }> {
    if (!this.client) {
      return { total_cupones: 0, cupones_activos: 0, usos_totales: 0, cupones_expirados: 0 };
    }

    const { data, error } = await this.client.rpc('cupones_estadisticas');

    if (error) {
      console.error('[Cupones Supabase] Error estadísticas:', error);
      return { total_cupones: 0, cupones_activos: 0, usos_totales: 0, cupones_expirados: 0 };
    }

    const result = data?.[0];
    return {
      total_cupones: result?.total_cupones || 0,
      cupones_activos: result?.cupones_activos || 0,
      usos_totales: result?.usos_totales || 0,
      cupones_expirados: result?.cupones_expirados || 0,
    };
  }

  /**
   * Contar usos del usuario
   */
  async contarUsosDelUsuario(cuponId: number, clienteEmail: string): Promise<number> {
    if (!this.client) return 0;

    const { count, error } = await this.client
      .from('cupon_usos')
      .select('*', { count: 'exact', head: true })
      .eq('cupon_id', cuponId)
      .ilike('usuario_email', clienteEmail);

    if (error) {
      console.error('[Cupones Supabase] Error contando usos:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Detectar abuso de cupón
   */
  async detectarAbusoCupon(cuponId: number): Promise<Array<{
    cliente_email: string;
    usos: number;
  }>> {
    if (!this.client) return [];

    const { data, error } = await this.client
      .from('cupon_usos')
      .select('usuario_email')
      .eq('cupon_id', cuponId);

    if (error) {
      console.error('[Cupones Supabase] Error detectando abuso:', error);
      return [];
    }

    // Agrupar por email
    const conteo = new Map<string, number>();
    for (const row of data) {
      const email = row.usuario_email;
      conteo.set(email, (conteo.get(email) || 0) + 1);
    }

    // Filtrar los que tienen más de 1 uso
    return Array.from(conteo.entries())
      .filter(([_, usos]) => usos > 1)
      .map(([email, usos]) => ({ cliente_email: email, usos }))
      .sort((a, b) => b.usos - a.usos);
  }

  // ============================================
  // CARGAR DESDE CONFIG
  // ============================================

  /**
   * Cargar cupones desde archivo JSON
   */
  async cargarCuponesDesdeConfig(): Promise<{
    cargados: number;
    errores: string[];
    existentes: number;
  }> {
    try {
      const fs = require('fs');
      const path = require('path');

      const configPath = path.join(__dirname, '../../public/config/cupones.config.json');

      if (!fs.existsSync(configPath)) {
        return { cargados: 0, errores: ['Archivo no encontrado'], existentes: 0 };
      }

      const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      if (!configData.enabled || !configData.cupones || !Array.isArray(configData.cupones)) {
        return { cargados: 0, errores: [], existentes: 0 };
      }

      let cargados = 0;
      let existentes = 0;
      const errores: string[] = [];

      for (const cuponConfig of configData.cupones) {
        try {
          const existente = await this.obtenerCuponPorCodigo(cuponConfig.codigo);
          if (existente) {
            existentes++;
            if (configData.configuracion?.sobrescribir_existentes) {
              await this.actualizarCupon(existente.id!, {
                tipo: cuponConfig.tipo,
                valor: cuponConfig.valor,
                limite_uso: cuponConfig.limite_uso,
                fecha_expiracion: cuponConfig.fecha_expiracion ? new Date(cuponConfig.fecha_expiracion) : undefined,
                activo: cuponConfig.activo,
              });
            }
            continue;
          }

          await this.crearCupon({
            codigo: cuponConfig.codigo,
            tipo: cuponConfig.tipo,
            valor: cuponConfig.valor,
            limite_uso: cuponConfig.limite_uso,
            fecha_expiracion: cuponConfig.fecha_expiracion ? new Date(cuponConfig.fecha_expiracion) : undefined,
            activo: cuponConfig.activo,
          });

          cargados++;
          console.log(`[Cupones Supabase] ✅ Cupón ${cuponConfig.codigo} cargado`);
        } catch (error: any) {
          errores.push(`${cuponConfig.codigo}: ${error.message}`);
        }
      }

      return { cargados, errores, existentes };
    } catch (error: any) {
      return { cargados: 0, errores: [error.message], existentes: 0 };
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  private mapRowToCupon(row: any): Cupon {
    return {
      id: row.id,
      codigo: row.codigo,
      tipo: row.tipo,
      valor: parseFloat(row.valor),
      limite_uso: row.limite_uso || undefined,
      usos_actuales: row.usos_actuales || 0,
      fecha_expiracion: row.fecha_expiracion ? new Date(row.fecha_expiracion) : undefined,
      activo: row.activo,
      planes_aplicables: row.planes_aplicables || undefined,
      descripcion: row.descripcion || undefined,
      creado_en: new Date(row.created_at),
      actualizado_en: new Date(row.updated_at),
    };
  }
}

// Singleton
export const cuponesSupabaseService = new CuponesSupabaseService();
