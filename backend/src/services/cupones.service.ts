import { Cupon, CrearCuponInput, ValidacionCupon } from '../types';
import { cuponesSupabaseService } from './cupones-supabase.service';

/**
 * Servicio de Cupones - Solo Supabase
 */
export class CuponesService {
  constructor() {
    console.log('[Cupones] ✅ Usando Supabase');
  }

  async crearCupon(input: CrearCuponInput): Promise<Cupon> {
    return cuponesSupabaseService.crearCupon(input);
  }

  /**
   * Obtiene un cupón por ID
   */
  async obtenerCuponPorId(id: number): Promise<Cupon | null> {
    return cuponesSupabaseService.obtenerCuponPorId(id);
  }

  /**
   * Obtiene un cupón por código
   */
  async obtenerCuponPorCodigo(codigo: string): Promise<Cupon | null> {
    return cuponesSupabaseService.obtenerCuponPorCodigo(codigo);
  }

  /**
   * Lista todos los cupones (para admin)
   */
  async listarCupones(): Promise<Cupon[]> {
    return cuponesSupabaseService.listarCupones();
  }

  /**
   * Valida un cupón para aplicarlo a una compra
   */
  async validarCupon(codigo: string, planId?: number, clienteEmail?: string): Promise<ValidacionCupon> {
    return cuponesSupabaseService.validarCupon(codigo, planId, clienteEmail);
  }

  /**
   * Cuenta cuántas veces un usuario ha usado un cupón específico
   */
  async contarUsosDelUsuario(cuponId: number, clienteEmail: string): Promise<number> {
    return cuponesSupabaseService.contarUsosDelUsuario(cuponId, clienteEmail);
  }

  /**
   * Detecta abuso de un cupón
   */
  async detectarAbusoCupon(cuponId: number): Promise<Array<{
    cliente_email: string;
    usos_aprobados: number;
    usos_totales: number;
  }>> {
    const result = await cuponesSupabaseService.detectarAbusoCupon(cuponId);
    return result.map(r => ({ 
      cliente_email: r.cliente_email, 
      usos_aprobados: r.usos, 
      usos_totales: r.usos 
    }));
  }

  /**
   * Aplica un cupón (incrementa contador de usos)
   */
  async aplicarCupon(
    cuponId: number,
    clienteEmail: string,
    pagoId: string,
    montoOriginal: number,
    descuentoAplicado: number
  ): Promise<boolean> {
    return cuponesSupabaseService.aplicarCupon(cuponId, clienteEmail, pagoId, montoOriginal, descuentoAplicado);
  }

  /**
   * Calcula el descuento basado en el precio original
   */
  calcularDescuento(cupon: Cupon, precioOriginal: number): number {
    if (cupon.tipo === 'porcentaje') {
      return Math.round((precioOriginal * cupon.valor / 100) * 100) / 100;
    } else {
      // Para monto fijo, no puede ser mayor al precio original
      return Math.min(cupon.valor, precioOriginal);
    }
  }

  /**
   * Actualiza un cupón
   */
  async actualizarCupon(id: number, updates: Partial<CrearCuponInput & { activo: boolean }>): Promise<Cupon | null> {
    return cuponesSupabaseService.actualizarCupon(id, updates);
  }

  /**
   * Desactiva un cupón
   */
  async desactivarCupon(id: number): Promise<void> {
    return cuponesSupabaseService.desactivarCupon(id);
  }

  /**
   * Elimina un cupón
   */
  async eliminarCupon(id: number): Promise<void> {
    return cuponesSupabaseService.eliminarCupon(id);
  }

  /**
   * Obtiene estadísticas de uso de cupones
   */
  async obtenerEstadisticas(): Promise<{
    total_cupones: number;
    cupones_activos: number;
    usos_totales: number;
    cupones_expirados: number;
  }> {
    return cuponesSupabaseService.obtenerEstadisticas();
  }

  /**
   * Carga cupones desde archivo de configuración JSON
   */
  async cargarCuponesDesdeConfig(): Promise<{
    cargados: number;
    errores: string[];
    existentes: number;
  }> {
    return cuponesSupabaseService.cargarCuponesDesdeConfig();
  }
}

export const cuponesService = new CuponesService();
