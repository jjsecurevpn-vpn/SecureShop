import Database from 'better-sqlite3';
import { config } from '../config';
import { Cupon, CuponRow, CrearCuponInput, ValidacionCupon } from '../types';

export class CuponesService {
  private db: Database.Database;

  constructor() {
    this.db = new Database(config.database.path);
  }
  async crearCupon(input: CrearCuponInput): Promise<Cupon> {
    // Verificar que el código no exista
    const existente = await this.obtenerCuponPorCodigo(input.codigo);
    if (existente) {
      throw new Error('El código de cupón ya existe');
    }

    // Validar tipo y valor
    if (input.tipo === 'porcentaje' && (input.valor <= 0 || input.valor > 100)) {
      throw new Error('El porcentaje debe estar entre 1 y 100');
    }

    if (input.tipo === 'monto_fijo' && input.valor <= 0) {
      throw new Error('El monto fijo debe ser mayor a 0');
    }

    const stmt = this.db.prepare(`
      INSERT INTO cupones (
        codigo, tipo, valor, limite_uso, fecha_expiracion, planes_aplicables, activo
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      input.codigo.toUpperCase(),
      input.tipo,
      input.valor,
      input.limite_uso || null,
      input.fecha_expiracion ? input.fecha_expiracion.toISOString() : null,
      input.planes_aplicables ? JSON.stringify(input.planes_aplicables) : null,
      input.activo !== undefined ? (input.activo ? 1 : 0) : 1
    );

    const cupon = await this.obtenerCuponPorId(result.lastInsertRowid as number);
    if (!cupon) {
      throw new Error('Error al crear el cupón');
    }

    return cupon;
  }

  /**
   * Obtiene un cupón por ID
   */
  async obtenerCuponPorId(id: number): Promise<Cupon | null> {
    const stmt = this.db.prepare('SELECT * FROM cupones WHERE id = ?');
    const row = stmt.get(id) as CuponRow | undefined;

    if (!row) return null;

    return this.mapRowToCupon(row);
  }

  /**
   * Obtiene un cupón por código
   */
  async obtenerCuponPorCodigo(codigo: string): Promise<Cupon | null> {
    const stmt = this.db.prepare('SELECT * FROM cupones WHERE codigo = ?');
    const row = stmt.get(codigo.toUpperCase()) as CuponRow | undefined;

    if (!row) return null;

    return this.mapRowToCupon(row);
  }

  /**
   * Lista todos los cupones (para admin)
   */
  async listarCupones(): Promise<Cupon[]> {
    const stmt = this.db.prepare('SELECT * FROM cupones ORDER BY creado_en DESC');
    const rows = stmt.all() as CuponRow[];

    return rows.map(row => this.mapRowToCupon(row));
  }

  /**
   * Valida un cupón para aplicarlo a una compra
   */
  async validarCupon(codigo: string, planId?: number): Promise<ValidacionCupon> {
    try {
      const cupon = await this.obtenerCuponPorCodigo(codigo);
      if (!cupon) {
        return { valido: false, mensaje_error: 'Cupón no encontrado' };
      }

      // Verificar si está activo
      if (!cupon.activo) {
        return { valido: false, mensaje_error: 'Cupón inactivo' };
      }

      // Verificar expiración
      if (cupon.fecha_expiracion && new Date() > cupon.fecha_expiracion) {
        return { valido: false, mensaje_error: 'Cupón expirado' };
      }

      // Verificar límite de uso
      if (cupon.limite_uso && (cupon.usos_actuales || 0) >= cupon.limite_uso) {
        return { valido: false, mensaje_error: 'Cupón agotado' };
      }

      // Verificar aplicabilidad a plan
      if (cupon.planes_aplicables && cupon.planes_aplicables.length > 0 && planId) {
        if (!cupon.planes_aplicables.includes(planId)) {
          return { valido: false, mensaje_error: 'Cupón no aplicable a este plan' };
        }
      }

      // Calcular descuento (se calcula en el momento de aplicar)
      // NOTA: El descuento se calcula en el backend con el precio real en el momento de la compra
      // Por ahora retornamos el cupón válido sin descuento precalculado (se calcula después)
      return {
        valido: true,
        cupon,
        tipo_descuento: cupon.tipo,
        descuento: 0 // Descuento será calculado en el servicio de tienda
      };

    } catch (error) {
      console.error('Error validando cupón:', error);
      return { valido: false, mensaje_error: 'Error interno del servidor' };
    }
  }

  /**
   * Aplica un cupón (incrementa contador de usos)
   * Si el cupón alcanza su límite de uso, se desactiva automáticamente
   */
  async aplicarCupon(cuponId: number): Promise<void> {
    try {
      // Obtener cupón actual
      const cupon = await this.obtenerCuponPorId(cuponId);
      if (!cupon) {
        throw new Error('Cupón no encontrado');
      }

      const nuevosUsos = (cupon.usos_actuales || 0) + 1;
      const shouldDeactivate = cupon.limite_uso && nuevosUsos >= cupon.limite_uso;

      // Actualizar usos y desactivar si es necesario
      if (shouldDeactivate) {
        const stmt = this.db.prepare(`
          UPDATE cupones
          SET usos_actuales = ?, activo = 0, actualizado_en = CURRENT_TIMESTAMP
          WHERE id = ?
        `);
        stmt.run(nuevosUsos, cuponId);
        console.log(`[Cupones] ✅ Cupón ${cupon.codigo} utilizado. Usos: ${nuevosUsos}/${cupon.limite_uso}. Desactivado por agotamiento.`);
      } else {
        const stmt = this.db.prepare(`
          UPDATE cupones
          SET usos_actuales = ?, actualizado_en = CURRENT_TIMESTAMP
          WHERE id = ?
        `);
        stmt.run(nuevosUsos, cuponId);
        const usosRestantes = (cupon.limite_uso || 0) - nuevosUsos;
        console.log(`[Cupones] ✅ Cupón ${cupon.codigo} utilizado. Usos restantes: ${Math.max(0, usosRestantes)}`);
      }
    } catch (error) {
      console.error('[Cupones] Error aplicando cupón:', error);
      throw error;
    }
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
    const campos: string[] = [];
    const valores: any[] = [];

    if (updates.codigo !== undefined) {
      campos.push('codigo = ?');
      valores.push(updates.codigo.toUpperCase());
    }

    if (updates.tipo !== undefined) {
      campos.push('tipo = ?');
      valores.push(updates.tipo);
    }

    if (updates.valor !== undefined) {
      campos.push('valor = ?');
      valores.push(updates.valor);
    }

    if (updates.limite_uso !== undefined) {
      campos.push('limite_uso = ?');
      valores.push(updates.limite_uso);
    }

    if (updates.fecha_expiracion !== undefined) {
      campos.push('fecha_expiracion = ?');
      valores.push(updates.fecha_expiracion.toISOString());
    }

    if (updates.planes_aplicables !== undefined) {
      campos.push('planes_aplicables = ?');
      valores.push(JSON.stringify(updates.planes_aplicables));
    }

    if (updates.activo !== undefined) {
      campos.push('activo = ?');
      valores.push(updates.activo ? 1 : 0);
    }

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    campos.push('actualizado_en = CURRENT_TIMESTAMP');

    const stmt = this.db.prepare(`
      UPDATE cupones SET ${campos.join(', ')} WHERE id = ?
    `);

    valores.push(id);
    stmt.run(...valores);

    return this.obtenerCuponPorId(id);
  }

  /**
   * Desactiva un cupón
   */
  async desactivarCupon(id: number): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE cupones SET activo = 0, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?
    `);
    stmt.run(id);
  }

  /**
   * Elimina un cupón (solo si nunca se usó)
   */
  async eliminarCupon(id: number): Promise<void> {
    const cupon = await this.obtenerCuponPorId(id);
    if (!cupon) {
      throw new Error('Cupón no encontrado');
    }

    if ((cupon.usos_actuales || 0) > 0) {
      throw new Error('No se puede eliminar un cupón que ya fue usado');
    }

    const stmt = this.db.prepare('DELETE FROM cupones WHERE id = ?');
    stmt.run(id);
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
    const stmt = this.db.prepare(`
      SELECT
        COUNT(*) as total_cupones,
        SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as cupones_activos,
        SUM(usos_actuales) as usos_totales,
        SUM(CASE WHEN fecha_expiracion < CURRENT_TIMESTAMP AND activo = 1 THEN 1 ELSE 0 END) as cupones_expirados
      FROM cupones
    `);

    const result = stmt.get() as any;

    return {
      total_cupones: result.total_cupones || 0,
      cupones_activos: result.cupones_activos || 0,
      usos_totales: result.usos_totales || 0,
      cupones_expirados: result.cupones_expirados || 0,
    };
  }

  /**
   * Carga cupones desde archivo de configuración JSON
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

      // Verificar si el archivo existe
      if (!fs.existsSync(configPath)) {
        return {
          cargados: 0,
          errores: ['Archivo de configuración cupones.config.json no encontrado'],
          existentes: 0
        };
      }

      // Leer y parsear el archivo
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      if (!configData.enabled || !configData.cupones || !Array.isArray(configData.cupones)) {
        return {
          cargados: 0,
          errores: ['Configuración inválida en cupones.config.json'],
          existentes: 0
        };
      }

      let cargados = 0;
      let existentes = 0;
      const errores: string[] = [];

      for (const cuponConfig of configData.cupones) {
        try {
          // Verificar si ya existe
          const existente = await this.obtenerCuponPorCodigo(cuponConfig.codigo);
          if (existente) {
            existentes++;
            if (!configData.configuracion?.sobrescribir_existentes) {
              continue; // Saltar si no se debe sobrescribir
            }
            // Si se debe sobrescribir, actualizar
            await this.actualizarCupon(existente.id!, {
              tipo: cuponConfig.tipo,
              valor: cuponConfig.valor,
              limite_uso: cuponConfig.limite_uso,
              fecha_expiracion: cuponConfig.fecha_expiracion ? new Date(cuponConfig.fecha_expiracion) : undefined,
              activo: cuponConfig.activo
            });
            continue;
          }

          // Crear nuevo cupón
          await this.crearCupon({
            codigo: cuponConfig.codigo,
            tipo: cuponConfig.tipo,
            valor: cuponConfig.valor,
            limite_uso: cuponConfig.limite_uso,
            fecha_expiracion: cuponConfig.fecha_expiracion ? new Date(cuponConfig.fecha_expiracion) : undefined,
            activo: cuponConfig.activo
          });

          cargados++;
          console.log(`[Cupones] ✅ Cupón ${cuponConfig.codigo} cargado desde configuración`);

        } catch (error: any) {
          errores.push(`Error con cupón ${cuponConfig.codigo}: ${error.message}`);
          console.error(`[Cupones] ❌ Error cargando cupón ${cuponConfig.codigo}:`, error);
        }
      }

      return { cargados, errores, existentes };

    } catch (error: any) {
      console.error('[Cupones] Error cargando configuración:', error);
      return {
        cargados: 0,
        errores: [`Error general: ${error.message}`],
        existentes: 0
      };
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  private mapRowToCupon(row: CuponRow): Cupon {
    return {
      id: row.id,
      codigo: row.codigo,
      tipo: row.tipo,
      valor: row.valor,
      limite_uso: row.limite_uso || undefined,
      usos_actuales: row.usos_actuales || 0,
      fecha_expiracion: row.fecha_expiracion ? new Date(row.fecha_expiracion) : undefined,
      activo: row.activo === 1,
      planes_aplicables: row.planes_aplicables ? JSON.parse(row.planes_aplicables) : undefined,
      creado_en: new Date(row.creado_en),
      actualizado_en: new Date(row.actualizado_en),
    };
  }
}

export const cuponesService = new CuponesService();