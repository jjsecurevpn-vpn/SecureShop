import { Router, Request, Response } from 'express';
import { referidosService } from '../services/referidos.service';

const router = Router();

// ============================================
// RUTAS PÚBLICAS
// ============================================

/**
 * GET /api/referidos/validar/:codigo
 * Valida un código de referido
 */
router.get('/validar/:codigo', async (req: Request, res: Response) => {
  try {
    const { codigo } = req.params;
    const { email } = req.query;

    if (!codigo) {
      return res.status(400).json({ error: 'Código requerido' });
    }

    const resultado = await referidosService.validarCodigo(
      codigo,
      email as string | undefined
    );

    return res.json(resultado);
  } catch (error: any) {
    console.error('[Referidos Route] Error validando código:', error);
    return res.status(500).json({ error: 'Error validando código' });
  }
});

/**
 * GET /api/referidos/settings
 * Obtiene la configuración pública del programa de referidos
 */
router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const settings = await referidosService.getSettings();
    
    if (!settings) {
      return res.json({
        activo: false,
        porcentaje_recompensa: 0,
        porcentaje_descuento_referido: 0,
        mensaje_promocional: '',
      });
    }

    // Solo enviar datos públicos
    return res.json({
      activo: settings.activo,
      porcentaje_recompensa: settings.porcentaje_recompensa,
      porcentaje_descuento_referido: settings.porcentaje_descuento_referido,
      mensaje_promocional: settings.mensaje_promocional,
    });
  } catch (error: any) {
    console.error('[Referidos Route] Error obteniendo settings:', error);
    return res.status(500).json({ error: 'Error obteniendo configuración' });
  }
});

/**
 * POST /api/referidos/procesar-registro
 * Procesa el código de referido al registrarse un nuevo usuario
 */
router.post('/procesar-registro', async (req: Request, res: Response) => {
  try {
    const { email, codigoReferido } = req.body;

    if (!email || !codigoReferido) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email y código de referido son requeridos' 
      });
    }

    // Validar que el código existe y no es el del mismo usuario
    const validacion = await referidosService.validarCodigo(codigoReferido, email);

    if (!validacion.valido) {
      return res.json({ 
        success: false, 
        error: validacion.mensaje || 'Código inválido' 
      });
    }

    // Vincular el referido al nuevo usuario
    const resultado = await referidosService.vincularReferidoAlRegistro(
      email,
      codigoReferido
    );

    if (!resultado.success) {
      return res.json({ 
        success: false, 
        error: resultado.mensaje || 'Error procesando referido' 
      });
    }

    console.log(`[Referidos] Nuevo usuario ${email} vinculado con referido ${codigoReferido}`);

    return res.json({ 
      success: true, 
      message: 'Referido vinculado correctamente',
      referidor: resultado.referidorEmail,
    });
  } catch (error: any) {
    console.error('[Referidos Route] Error procesando registro:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error procesando referido' 
    });
  }
});

// ============================================
// RUTAS DE USUARIO (requieren email)
// ============================================

/**
 * GET /api/referidos/saldo/:email
 * Obtiene el saldo de un usuario
 */
router.get('/saldo/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    const resultado = await referidosService.getSaldoByEmail(email);

    if (!resultado) {
      return res.json({ saldo: 0, userId: null });
    }

    return res.json(resultado);
  } catch (error: any) {
    console.error('[Referidos Route] Error obteniendo saldo:', error);
    return res.status(500).json({ error: 'Error obteniendo saldo' });
  }
});

/**
 * GET /api/referidos/stats/:userId
 * Obtiene estadísticas de referidos de un usuario
 */
router.get('/stats/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const stats = await referidosService.getStats(userId);

    if (!stats) {
      return res.json({
        referral_code: '',
        total_referrals: 0,
        total_earned: 0,
        saldo_actual: 0,
        referidos: [],
      });
    }

    return res.json(stats);
  } catch (error: any) {
    console.error('[Referidos Route] Error obteniendo stats:', error);
    return res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

/**
 * GET /api/referidos/transacciones/:userId
 * Obtiene historial de transacciones de saldo
 */
router.get('/transacciones/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const transacciones = await referidosService.getTransacciones(userId, limit);

    res.json(transacciones);
  } catch (error: any) {
    console.error('[Referidos Route] Error obteniendo transacciones:', error);
    res.status(500).json({ error: 'Error obteniendo transacciones' });
  }
});

// ============================================
// RUTAS ADMIN
// ============================================

/**
 * GET /api/referidos/admin/settings
 * Obtiene configuración completa (admin)
 */
router.get('/admin/settings', async (_req: Request, res: Response) => {
  try {
    const settings = await referidosService.getSettings();
    res.json(settings || {});
  } catch (error: any) {
    console.error('[Referidos Route] Error obteniendo settings admin:', error);
    res.status(500).json({ error: 'Error obteniendo configuración' });
  }
});

/**
 * PUT /api/referidos/admin/settings
 * Actualiza configuración del programa
 */
router.put('/admin/settings', async (req: Request, res: Response) => {
  try {
    const settings = req.body;

    const success = await referidosService.updateSettings(settings);

    if (!success) {
      return res.status(500).json({ error: 'Error actualizando configuración' });
    }

    return res.json({ success: true, message: 'Configuración actualizada' });
  } catch (error: any) {
    console.error('[Referidos Route] Error actualizando settings:', error);
    return res.status(500).json({ error: 'Error actualizando configuración' });
  }
});

/**
 * GET /api/referidos/admin/all
 * Obtiene todos los referidos del sistema
 */
router.get('/admin/all', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const referidos = await referidosService.getAllReferidos(limit);
    res.json(referidos);
  } catch (error: any) {
    console.error('[Referidos Route] Error obteniendo referidos:', error);
    res.status(500).json({ error: 'Error obteniendo referidos' });
  }
});

/**
 * POST /api/referidos/admin/ajustar-saldo
 * Ajusta el saldo de un usuario manualmente
 */
router.post('/admin/ajustar-saldo', async (req: Request, res: Response) => {
  try {
    const { email, monto, descripcion } = req.body;

    if (!email || monto === undefined) {
      return res.status(400).json({ error: 'Email y monto son requeridos' });
    }

    const resultado = await referidosService.ajustarSaldoAdmin(
      email,
      parseFloat(monto),
      descripcion || ''
    );

    if (!resultado.success) {
      return res.status(400).json({ error: resultado.mensaje });
    }

    return res.json(resultado);
  } catch (error: any) {
    console.error('[Referidos Route] Error ajustando saldo:', error);
    return res.status(500).json({ error: 'Error ajustando saldo' });
  }
});

export default router;
