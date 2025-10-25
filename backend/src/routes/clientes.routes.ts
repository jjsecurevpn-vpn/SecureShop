import { Router, Request, Response } from 'express';
import { ServexService } from '../services/servex.service';
import { ApiResponse } from '../types';

export function crearRutasClientes(servexService: ServexService): Router {
  const router = Router();

  /**
   * GET /api/clients
   * Obtiene la lista de clientes con filtros opcionales
   */
  router.get('/clients', async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        scope = 'meus',
        resellerId
      } = req.query;

      // Convertir parámetros a tipos correctos
      const params = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        search: search as string,
        status: status as string,
        scope: scope as string,
        resellerId: resellerId ? parseInt(resellerId as string, 10) : undefined
      };

      console.log('[Rutas Clientes] Parámetros:', params);

      const clientes = await servexService.obtenerClientes(params);

      const response: ApiResponse = {
        success: true,
        data: clientes,
      };

      res.json(response);
    } catch (error: any) {
      console.error('[Rutas Clientes] Error obteniendo clientes:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error obteniendo clientes',
      } as ApiResponse);
    }
  });

  return router;
}