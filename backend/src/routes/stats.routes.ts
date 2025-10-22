import { Router, Request, Response } from 'express';
import { WebSocketService } from '../services/websocket.service';

export function crearRutasStats(wsService: WebSocketService): Router {
  const router = Router();

  /**
   * GET /api/stats/servidores
   * Obtiene estadísticas en tiempo real de los servidores
   */
  router.get('/servidores', async (_req: Request, res: Response) => {
    try {
      const stats = wsService.obtenerEstadisticas();
      
      return res.json({
        servidores: stats,
        ultimaActualizacion: new Date(),
        nota: 'Datos en tiempo real de usuarios conectados a través de nuestro panel'
      });
    } catch (error: any) {
      console.error('[Stats API] Error obteniendo estadísticas:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  return router;
}
