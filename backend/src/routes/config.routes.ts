import express, { Request, Response } from 'express';
import { configService } from '../services/config.service';

const router = express.Router();

/**
 * POST /api/config/activar-promo
 * Activa la promoción por una duración configurable
 * Body: { duracion_horas: number }
 */
router.post('/activar-promo', async (req: Request, res: Response) => {
  try {
    const { duracion_horas } = req.body;

    if (!duracion_horas || duracion_horas <= 0) {
      return res.status(400).json({
        error: 'duracion_horas debe ser un número mayor a 0',
      });
    }

    // Leer configs actual
    const configPlanes = configService.leerConfigPlanes();
    const configRevendedores = configService.leerConfigRevendedores();

    // Actualizar promo_config en PLANES
    const now = new Date().toISOString();
    if (!configPlanes.promo_config) {
      configPlanes.promo_config = {
        activa: false,
        activada_en: null,
        duracion_horas: 12,
        auto_desactivar: true,
      };
    }
    configPlanes.promo_config.activa = true;
    configPlanes.promo_config.activada_en = now;
    configPlanes.promo_config.duracion_horas = duracion_horas;
    configPlanes.promo_config.auto_desactivar = true;
    configPlanes.ultima_actualizacion = now;

    // Actualizar promo_config en REVENDEDORES
    if (!configRevendedores.promo_config) {
      configRevendedores.promo_config = {
        activa: false,
        activada_en: null,
        duracion_horas: 12,
        auto_desactivar: true,
      };
    }
    configRevendedores.promo_config.activa = true;
    configRevendedores.promo_config.activada_en = now;
    configRevendedores.promo_config.duracion_horas = duracion_horas;
    configRevendedores.promo_config.auto_desactivar = true;
    configRevendedores.ultima_actualizacion = now;

    // Guardar cambios en ambos archivos
    console.log('[CONFIG-ROUTE] 💾 Guardando config de planes...');
    configService.guardarConfigPlanes(configPlanes);
    console.log('[CONFIG-ROUTE] ✅ Config de planes guardada');
    
    console.log('[CONFIG-ROUTE] 💾 Guardando config de revendedores...');
    configService.guardarConfigRevendedores(configRevendedores);
    console.log('[CONFIG-ROUTE] ✅ Config de revendedores guardada');

    // Limpiar ambos cachés para que cambios se apliquen inmediatamente
    configService.limpiarCache();
    console.log('[CONFIG-ROUTE] 🔄 Caché limpiado');

    return res.status(200).json({
      success: true,
      mensaje: `Promoción activada por ${duracion_horas} hora(s) en PLANES y REVENDEDORES`,
      promo_config: configPlanes.promo_config,
      timestamp: now,
    });
  } catch (error) {
    console.error('Error activando promo:', error);
    return res.status(500).json({
      error: 'Error al activar la promoción',
      detalles: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/config/desactivar-promo
 * Desactiva la promoción inmediatamente
 */
router.post('/desactivar-promo', (_req: Request, res: Response) => {
  try {
    const config = configService.leerConfigPlanes();

    if (!config.promo_config) {
      config.promo_config = {
        activa: false,
        activada_en: null,
        duracion_horas: 12,
        auto_desactivar: true,
      };
    }
    config.promo_config.activa = false;
    config.promo_config.activada_en = null;
    config.ultima_actualizacion = new Date().toISOString();

    configService.guardarConfigPlanes(config);
    configService.limpiarCache();

    return res.status(200).json({
      success: true,
      mensaje: 'Promoción desactivada',
      timestamp: config.ultima_actualizacion,
    });
  } catch (error) {
    console.error('Error desactivando promo:', error);
    return res.status(500).json({
      error: 'Error al desactivar la promoción',
      detalles: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/config/promo-status
 * Obtiene el estado actual de la promoción y tiempo restante
 */
router.get('/promo-status', (_req: Request, res: Response) => {
  try {
    const config = configService.leerConfigPlanes();

    return res.status(200).json({
      promo_config: config.promo_config || {
        activa: false,
        activada_en: null,
        duracion_horas: 0,
        auto_desactivar: true,
      },
    });
  } catch (error) {
    console.error('Error obteniendo status promo:', error);
    return res.status(500).json({
      error: 'Error al obtener estado de la promoción',
      detalles: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/config/noticias
 * Obtiene la configuración de noticias
 */
router.get('/noticias', (_req: Request, res: Response) => {
  try {
    const config = configService.obtenerNoticiasActivas();

    return res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Error obteniendo noticias:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener noticias',
      detalles: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/config/noticias
 * Actualiza la configuración de noticias
 */
router.post('/noticias', (req: Request, res: Response) => {
  try {
    const config = req.body;

    if (!config || typeof config !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Configuración de noticias inválida',
      });
    }

    config.ultima_actualizacion = new Date().toISOString();
    configService.guardarConfigNoticias(config);
    configService.limpiarCache();

    return res.status(200).json({
      success: true,
      mensaje: 'Configuración de noticias actualizada',
      timestamp: config.ultima_actualizacion,
    });
  } catch (error) {
    console.error('Error actualizando noticias:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al actualizar noticias',
      detalles: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
