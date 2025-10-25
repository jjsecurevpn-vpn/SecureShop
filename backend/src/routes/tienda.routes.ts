import { Router, Request, Response } from 'express';
import { TiendaService } from '../services/tienda.service';
import { configService } from '../services/config.service';
import { ApiResponse, CrearPagoInput } from '../types';

export function crearRutasTienda(tiendaService: TiendaService): Router {
  const router = Router();
  console.log('[crearRutasTienda] 🚀 INICIALIZANDO RUTAS DE TIENDA...');

  /**
   * GET /api/planes
   * Obtiene la lista de planes disponibles
   */
  router.get('/planes', async (_req: Request, res: Response) => {
    try {
      const planes = tiendaService.obtenerPlanes();

      const response: ApiResponse = {
        success: true,
        data: planes,
      };

      res.json(response);
    } catch (error: any) {
      console.error('[Rutas] Error obteniendo planes:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error obteniendo planes',
      } as ApiResponse);
    }
  });

  /**
   * POST /api/comprar
   * Inicia el proceso de compra
   */
  router.post('/comprar', async (req: Request, res: Response) => {
    try {
      const { planId, clienteEmail, clienteNombre } = req.body as CrearPagoInput;

      // Validaciones
      if (!planId || !clienteEmail || !clienteNombre) {
        res.status(400).json({
          success: false,
          error: 'Faltan datos requeridos: planId, clienteEmail, clienteNombre',
        } as ApiResponse);
        return;
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clienteEmail)) {
        res.status(400).json({
          success: false,
          error: 'Email inválido',
        } as ApiResponse);
        return;
      }

      // Procesar compra
      const resultado = await tiendaService.procesarCompra({
        planId,
        clienteEmail,
        clienteNombre,
      });

      const response: ApiResponse = {
        success: true,
        data: resultado,
        message: 'Pago creado exitosamente',
      };

      res.json(response);
    } catch (error: any) {
      console.error('[Rutas] Error procesando compra:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error procesando compra',
      } as ApiResponse);
    }
  });

  /**
   * POST /api/webhook
   * Webhook de MercadoPago para notificaciones de pago
   */
  router.post('/webhook', async (req: Request, res: Response) => {
    try {
      console.log('[Webhook] Recibido:', JSON.stringify(req.body, null, 2));

      // Procesar webhook de forma asíncrona
      tiendaService.procesarWebhook(req.body).catch((error) => {
        console.error('[Webhook] Error procesando:', error);
      });

      // Responder inmediatamente a MercadoPago
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('[Webhook] Error:', error);
      // Aún así responder 200 para evitar reintentos de MercadoPago
      res.status(200).json({ success: false });
    }
  });

  /**
   * GET /api/pago/success
   * Página de éxito después del pago
   */
  router.get('/pago/success', (req: Request, res: Response) => {
    const { payment_id, external_reference, tipo } = req.query;

    // Redirigir al frontend con los parámetros
    res.redirect(
      `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/success?status=approved&payment_id=${payment_id}&pago_id=${external_reference}&tipo=${tipo || 'cliente'}`
    );
  });

  /**
   * GET /api/pago/failure
   * Página de fallo después del pago
   */
  router.get('/pago/failure', (req: Request, res: Response) => {
    const { external_reference, tipo } = req.query;
    res.redirect(
      `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/?status=rejected&pago_id=${external_reference}&tipo=${tipo || 'cliente'}`
    );
  });

  /**
   * GET /api/pago/pending
   * Página de pago pendiente
   */
  router.get('/pago/pending', (req: Request, res: Response) => {
    const { external_reference, tipo } = req.query;

    res.redirect(
      `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/?status=pending&pago_id=${external_reference}&tipo=${tipo || 'cliente'}`
    );
  });

  /**
   * GET /api/pago/:id
   * Obtiene información de un pago y verifica su estado
   */
  router.get('/pago/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Verificar y procesar el pago
      const pago = await tiendaService.verificarYProcesarPago(id);

      if (!pago) {
        res.status(404).json({
          success: false,
          error: 'Pago no encontrado',
        } as ApiResponse);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: pago,
      };

      res.json(response);
    } catch (error: any) {
      console.error('[Rutas] Error obteniendo pago:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error obteniendo pago',
      } as ApiResponse);
    }
  });

  /**
   * GET /api/config/info
   * Obtiene información sobre la configuración de planes
   */
  router.get('/config/info', (_req: Request, res: Response) => {
    try {
      const info = configService.obtenerInfoConfig();

      const response: ApiResponse = {
        success: true,
        data: info,
        message: 'Información de configuración',
      };

      res.json(response);
    } catch (error: any) {
      console.error('[Rutas] Error obteniendo info de config:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error obteniendo configuración',
      } as ApiResponse);
    }
  });

  /**
   * GET /api/config/hero
   * Obtiene la configuración del hero (promociones, título, etc)
   */
  router.get('/config/hero', (_req: Request, res: Response) => {
    try {
      const heroConfig = configService.obtenerConfigHero();

      const response: ApiResponse = {
        success: true,
        data: heroConfig,
        message: 'Configuración del hero',
      };

      res.json(response);
    } catch (error: any) {
      console.error('[Rutas] Error obteniendo config del hero:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error obteniendo configuración',
      } as ApiResponse);
    }
  });

  /**
   * POST /api/config/reload
   * Recarga la configuración desde el archivo (limpia caché)
   */
  router.post('/config/reload', (_req: Request, res: Response) => {
    try {
      configService.limpiarCache();

      const response: ApiResponse = {
        success: true,
        message: 'Configuración recargada exitosamente',
        data: configService.obtenerInfoConfig(),
      };

      res.json(response);
    } catch (error: any) {
      console.error('[Rutas] Error recargando config:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error recargando configuración',
      } as ApiResponse);
    }
  });

  /**
   * POST /api/config/crear-default
   * Crea un archivo de configuración por defecto
   */
  router.post('/config/crear-default', (_req: Request, res: Response) => {
    try {
      configService.crearConfigPorDefecto();

      const response: ApiResponse = {
        success: true,
        message: 'Archivo de configuración por defecto creado',
        data: configService.obtenerInfoConfig(),
      };

      res.json(response);
    } catch (error: any) {
      console.error('[Rutas] Error creando config default:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error creando configuración',
      } as ApiResponse);
    }
  });

  return router;
}
