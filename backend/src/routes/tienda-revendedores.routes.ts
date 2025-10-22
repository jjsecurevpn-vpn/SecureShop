import { Router, Request, Response } from 'express';
import { TiendaRevendedoresService } from '../services/tienda-revendedores.service';
import { CrearPagoRevendedorInput } from '../types';

export function crearRutasRevendedores(tiendaRevendedores: TiendaRevendedoresService): Router {
  const router = Router();

  /**
   * GET /api/planes-revendedores
   * Obtiene todos los planes de revendedores activos
   */
  router.get('/planes-revendedores', async (_req: Request, res: Response) => {
    try {
      const planes = tiendaRevendedores.obtenerPlanesRevendedores();
      res.json({
        success: true,
        data: planes,
      });
    } catch (error: any) {
      console.error('[API] Error obteniendo planes de revendedores:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener los planes de revendedores',
      });
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
