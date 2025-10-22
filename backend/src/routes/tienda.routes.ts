import { Router, Request, Response } from 'express';
import { TiendaService } from '../services/tienda.service';
import { ApiResponse, CrearPagoInput } from '../types';

export function crearRutasTienda(tiendaService: TiendaService): Router {
  const router = Router();

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

  return router;
}
