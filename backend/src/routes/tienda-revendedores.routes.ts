import { Router, Request, Response } from 'express';
import { TiendaRevendedoresService } from '../services/tienda-revendedores.service';
import { configService } from '../services/config.service';
import { CrearPagoRevendedorInput, ApiResponse } from '../types';

export function crearRutasRevendedores(tiendaRevendedores: TiendaRevendedoresService): Router {
  const router = Router();
  console.log('[crearRutasRevendedores] 🎯 Registrando rutas de revendedores...');

  /**
   * GET /api/planes-revendedores
   * Obtiene todos los planes de revendedores activos con descuentos del 15% aplicados
   */
  router.get('/planes-revendedores', async (_req: Request, res: Response) => {
    console.log('[PLANES-REVENDEDORES ROUTE] 🎯 Route handler BEING EXECUTED!');
    try {
      console.log('[PLANES-REVENDEDORES ROUTE] Getting revendedor plans...');
      const planes = tiendaRevendedores.obtenerPlanesRevendedores();
      console.log('[PLANES-REVENDEDORES ROUTE] Got', planes.length, 'revendedor plans');

      const response: ApiResponse = {
        success: true,
        data: planes,
      };

      res.json(response);
    } catch (error: any) {
      console.error('[PLANES-REVENDEDORES ROUTE] Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error obteniendo planes de revendedores',
      } as ApiResponse);
    }
  });

  /**
   * POST /api/comprar-revendedor
   * Crea una nueva compra de plan de revendedor
   */
  router.post('/comprar-revendedor', async (req: Request, res: Response): Promise<void> => {
    try {
      const input: CrearPagoRevendedorInput = req.body;

      // Validar datos de entrada
      if (!input.planRevendedorId || !input.clienteEmail || !input.clienteNombre) {
        res.status(400).json({
          success: false,
          error: 'Faltan datos requeridos: planRevendedorId, clienteEmail, clienteNombre',
        });
        return;
      }

      const resultado = await tiendaRevendedores.procesarCompra(input);

      res.json({
        success: true,
        data: resultado,
      });
    } catch (error: any) {
      console.error('[API] Error procesando compra de revendedor:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al procesar la compra',
      });
    }
  });

  /**
   * GET /api/config/hero-revendedores
   * Obtiene la configuración del hero para revendedores (promociones, título, etc)
   */
  router.get('/config/hero-revendedores', (_req: Request, res: Response) => {
    try {
      const heroConfig = configService.obtenerConfigHeroRevendedores();

      const response: ApiResponse = {
        success: true,
        data: heroConfig,
        message: 'Configuración del hero de revendedores',
      };

      res.json(response);
    } catch (error: any) {
      console.error('[Rutas Revendedores] Error obteniendo config del hero:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error obteniendo configuración',
      } as ApiResponse);
    }
  });

  /**
   * GET /api/pago-revendedor/:id
   * Obtiene información de un pago de revendedor y verifica su estado
   */
  router.get('/pago-revendedor/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const pagoId = req.params.id;

      const pago = await tiendaRevendedores.verificarYProcesarPago(pagoId);

      if (!pago) {
        res.status(404).json({
          success: false,
          error: 'Pago no encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: pago,
      });
    } catch (error: any) {
      console.error('[API] Error obteniendo pago de revendedor:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener el pago',
      });
    }
  });

  return router;
}
