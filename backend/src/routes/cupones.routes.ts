import { Router } from 'express';
import { cuponesService } from '../services/cupones.service';
import { z } from 'zod';

const router = Router();

// ============================================
// VALIDACIÓN DE CUPONES
// ============================================

/**
 * POST /api/cupones/validar
 * Valida un cupón para aplicarlo a una compra
 */
router.post('/validar', async (req, res) => {
  try {
    console.log('[Cupones] Validando cupón:', req.body);
    const schema = z.object({
      codigo: z.string().trim().min(1, 'Código de cupón requerido'),
      planId: z.union([z.number(), z.string()]).optional(),
      precioPlan: z.union([z.number(), z.string()]).optional(),
      clienteEmail: z.union([z.string().trim().email(), z.literal('')]).optional()
    });

    const parsed = schema.parse(req.body);

    const codigo = parsed.codigo.trim();
    const planId = parsed.planId !== undefined && parsed.planId !== '' ? Number(parsed.planId) : undefined;
    const precioPlan = parsed.precioPlan !== undefined && parsed.precioPlan !== '' ? Number(parsed.precioPlan) : undefined;
    const clienteEmail = parsed.clienteEmail && parsed.clienteEmail.trim().length > 0
      ? parsed.clienteEmail.trim()
      : undefined;

    if (planId !== undefined && Number.isNaN(planId)) {
      return res.status(400).json({ success: false, error: 'planId inválido' });
    }

    if (precioPlan !== undefined && Number.isNaN(precioPlan)) {
      return res.status(400).json({ success: false, error: 'precioPlan inválido' });
    }

    console.log('[Cupones] Parámetros validados:', { codigo, planId, precioPlan, clienteEmail });

    const resultado = await cuponesService.validarCupon(codigo, planId, clienteEmail);
    console.log('[Cupones] Resultado validación:', resultado);

    if (!resultado.valido) {
      return res.status(400).json({
        success: false,
        error: resultado.mensaje_error
      });
    }

    // Calcular descuento si tenemos el precio del plan
    let descuento = 0;
    if (precioPlan && resultado.cupon) {
      descuento = cuponesService.calcularDescuento(resultado.cupon, precioPlan);
    }

    return res.json({
      success: true,
      data: {
        cupon: resultado.cupon,
        tipo_descuento: resultado.tipo_descuento,
        descuento: descuento,
        precio_final: precioPlan ? precioPlan - descuento : undefined
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[Cupones] Datos inválidos:', error.flatten().fieldErrors);
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos'
      });
    }

    console.error('Error validando cupón:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/cupones/aplicar
 * Aplica un cupón (incrementa contador de usos)
 * Solo para uso interno después de una compra exitosa
 */
router.post('/aplicar/:cuponId', async (req, res) => {
  try {
    const cuponId = parseInt(req.params.cuponId);
    const { clienteEmail, pagoId, montoOriginal, descuentoAplicado } = req.body;

    if (isNaN(cuponId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de cupón inválido'
      });
    }

    if (!clienteEmail || !pagoId) {
      return res.status(400).json({
        success: false,
        error: 'Se requieren clienteEmail y pagoId'
      });
    }

    await cuponesService.aplicarCupon(
      cuponId,
      clienteEmail,
      pagoId,
      montoOriginal || 0,
      descuentoAplicado || 0
    );

    return res.json({
      success: true,
      message: 'Cupón aplicado exitosamente'
    });

  } catch (error) {
    console.error('Error aplicando cupón:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// ============================================
// GESTIÓN DE CUPONES (ADMIN)
// ============================================

/**
 * GET /api/cupones
 * Lista todos los cupones (para admin)
 */
router.get('/', async (_req, res) => {
  try {
    const cupones = await cuponesService.listarCupones();

    return res.json({
      success: true,
      data: cupones
    });

  } catch (error) {
    console.error('Error listando cupones:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/cupones/listar
 * Lista todos los cupones activos (público - para mostrar en header)
 */
router.get('/listar', async (_req, res) => {
  try {
    const cupones = await cuponesService.listarCupones();

    return res.json({
      success: true,
      data: cupones
    });

  } catch (error) {
    console.error('Error listando cupones:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/cupones/:id
 * Obtiene un cupón por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de cupón inválido'
      });
    }

    const cupon = await cuponesService.obtenerCuponPorId(id);

    if (!cupon) {
      return res.status(404).json({
        success: false,
        error: 'Cupón no encontrado'
      });
    }

    return res.json({
      success: true,
      data: cupon
    });

  } catch (error) {
    console.error('Error obteniendo cupón:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/cupones
 * Crea un nuevo cupón
 */
router.post('/', async (req, res) => {
  try {
    const schema = z.object({
      codigo: z.string().min(1, 'Código requerido').max(50, 'Código demasiado largo'),
      tipo: z.enum(['porcentaje', 'monto_fijo'], {
        errorMap: () => ({ message: 'Tipo debe ser "porcentaje" o "monto_fijo"' })
      }),
      valor: z.number().positive('Valor debe ser positivo'),
      limite_uso: z.number().int().positive().optional(),
      fecha_expiracion: z.string().datetime().optional(),
      planes_aplicables: z.array(z.number()).optional()
    });

    const data = schema.parse(req.body);

    // Convertir fecha si existe
    const cuponData = {
      ...data,
      fecha_expiracion: data.fecha_expiracion ? new Date(data.fecha_expiracion) : undefined
    };

    const cupon = await cuponesService.crearCupon(cuponData);

    return res.status(201).json({
      success: true,
      data: cupon,
      message: 'Cupón creado exitosamente'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: error.errors
      });
    }

    console.error('Error creando cupón:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * PUT /api/cupones/:id
 * Actualiza un cupón
 */
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de cupón inválido'
      });
    }

    const schema = z.object({
      codigo: z.string().min(1).max(50).optional(),
      tipo: z.enum(['porcentaje', 'monto_fijo']).optional(),
      valor: z.number().positive().optional(),
      limite_uso: z.number().int().positive().optional(),
      fecha_expiracion: z.string().datetime().optional(),
      activo: z.boolean().optional(),
      planes_aplicables: z.array(z.number()).optional()
    });

    const updates = schema.parse(req.body);

    // Convertir fecha si existe
    const updateData = {
      ...updates,
      fecha_expiracion: updates.fecha_expiracion ? new Date(updates.fecha_expiracion) : undefined
    };

    const cupon = await cuponesService.actualizarCupon(id, updateData);

    if (!cupon) {
      return res.status(404).json({
        success: false,
        error: 'Cupón no encontrado'
      });
    }

    return res.json({
      success: true,
      data: cupon,
      message: 'Cupón actualizado exitosamente'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: error.errors
      });
    }

    console.error('Error actualizando cupón:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * DELETE /api/cupones/:id
 * Desactiva un cupón
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de cupón inválido'
      });
    }

    await cuponesService.desactivarCupon(id);

    return res.json({
      success: true,
      message: 'Cupón desactivado exitosamente'
    });

  } catch (error) {
    console.error('Error desactivando cupón:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * DELETE /api/cupones/:id/eliminar
 * Elimina permanentemente un cupón
 */
router.delete('/:id/eliminar', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de cupón inválido'
      });
    }

    await cuponesService.eliminarCupon(id);

    return res.status(200).json({
      success: true,
      message: 'Cupón eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando cupón:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al eliminar el cupón'
    });
  }
});

/**
 * GET /api/cupones/stats/resumen
 * Obtiene estadísticas de uso de cupones
 */
router.get('/stats/resumen', async (_req, res) => {
  try {
    const stats = await cuponesService.obtenerEstadisticas();

    return res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/cupones/recargar-config
 * Recarga cupones desde el archivo de configuración JSON
 */
router.post('/recargar-config', async (_req, res) => {
  try {
    const resultado = await cuponesService.cargarCuponesDesdeConfig();

    return res.json({
      success: true,
      data: resultado,
      message: `Cupones recargados: ${resultado.cargados} nuevos, ${resultado.existentes} existentes`
    });

  } catch (error) {
    console.error('Error recargando cupones desde configuración:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/cupones/:id/sincronizar
 * Sincroniza el contador de usos de un cupón basado en pagos aprobados reales
 * ADMIN ONLY
 */
router.post('/:id/sincronizar', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de cupón inválido'
      });
    }

    const cupon = await cuponesService.obtenerCuponPorId(id);
    if (!cupon) {
      return res.status(404).json({
        success: false,
        error: 'Cupón no encontrado'
      });
    }

    // Obtener la BD para contar pagos aprobados reales
    const Database = require('better-sqlite3');
    const { config } = require('../config');
    const db = new Database(config.database.path);
    
    const stmt = db.prepare(`
      SELECT COUNT(*) as total FROM pagos 
      WHERE cupon_id = ? AND estado = 'aprobado'
    `);
    const result = stmt.get(id) as any;
    const usosReales = result?.total || 0;

    // Actualizar el contador
    const updateStmt = db.prepare(`
      UPDATE cupones SET usos_actuales = ?, actualizado_en = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    updateStmt.run(usosReales, id);
    db.close();

    // Verificar si debe desactivarse
    const cuponActualizado = await cuponesService.obtenerCuponPorId(id);
    let desactivado = false;
    if (cuponActualizado && cuponActualizado.limite_uso && usosReales >= cuponActualizado.limite_uso) {
      await cuponesService.desactivarCupon(id);
      desactivado = true;
    }

    return res.json({
      success: true,
      data: {
        cupon_codigo: cupon.codigo,
        usos_anteriores: cupon.usos_actuales,
        usos_actuales: usosReales,
        limite_uso: cupon.limite_uso,
        desactivado: desactivado,
        mensaje: desactivado ? `Cupón desactivado tras alcanzar límite de ${cupon.limite_uso} usos` : 'Sincronizado exitosamente'
      }
    });

  } catch (error) {
    console.error('Error sincronizando cupón:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/cupones/:id/abuso
 * Detecta posible abuso de un cupón (usuarios que lo usan múltiples veces)
 * ADMIN ONLY
 */
router.get('/:id/abuso', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de cupón inválido'
      });
    }

    const cupon = await cuponesService.obtenerCuponPorId(id);
    if (!cupon) {
      return res.status(404).json({
        success: false,
        error: 'Cupón no encontrado'
      });
    }

    const abusadores = await cuponesService.detectarAbusoCupon(id);

    return res.json({
      success: true,
      data: {
        cupon_codigo: cupon.codigo,
        total_usuarios_abusando: abusadores.length,
        abusadores: abusadores.map(a => ({
          email: a.cliente_email,
          usos_aprobados: a.usos_aprobados,
          usos_totales: a.usos_totales,
          estado: a.usos_aprobados > 1 ? '⚠️ ABUSO DETECTADO' : '⚠️ Intentos de abuso'
        }))
      }
    });

  } catch (error) {
    console.error('Error detectando abuso:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;