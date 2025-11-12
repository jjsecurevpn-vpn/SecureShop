import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { VisitorsService } from '../services/visitors.service';

// Factory para crear rutas con DB
export function crearRutasVisitantes(db: Database.Database) {
  const router = Router();
  const visitorsService = new VisitorsService(db);

  /**
   * GET /api/visitors/register
   * Registra un nuevo visitante por IP
   * - Si IP nueva: incrementa visitantes totales
   * - Si IP existente: solo actualiza (sin incrementar)
   */
  router.get('/register', (req: Request, res: Response) => {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress || '0.0.0.0';
      const userAgent = req.get('user-agent');
      
      const stats = visitorsService.registrarVisitante(ipAddress, userAgent);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('[Visitors] Error registrando visitante:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/visitors/stats
   * Obtiene las estadísticas actuales
   */
  router.get('/stats', (_req: Request, res: Response) => {
    try {
      const stats = visitorsService.obtenerEstadisticas();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('[Visitors] Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * POST /api/visitors/online
   * Registra que un usuario (IP) se conectó
   */
  router.post('/online', (req: Request, res: Response) => {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress || '0.0.0.0';
      const stats = visitorsService.registrarUsuarioOnline(ipAddress);
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('[Visitors] Error registrando usuario online:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * POST /api/visitors/offline
   * Registra que un usuario (IP) se desconectó
   */
  router.post('/offline', (req: Request, res: Response) => {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress || '0.0.0.0';
      const stats = visitorsService.desconectarUsuario(ipAddress);
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('[Visitors] Error desconectando usuario:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/visitors/analytics
   * Datos analíticos detallados con timestamp
   */
  router.get('/analytics', (_req: Request, res: Response) => {
    try {
      const stats = visitorsService.obtenerEstadisticas();
      res.json({
        success: true,
        data: {
          ...stats,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      console.error('[Visitors] Error obteniendo analytics:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Limpieza periódica de sesiones inactivas cada 5 minutos
  setInterval(() => {
    visitorsService.limpiarSesionesInactivas();
  }, 5 * 60 * 1000);

  // Sincronización cada hora
  setInterval(() => {
    visitorsService.sincronizar();
  }, 60 * 60 * 1000);

  return router;
}

export default crearRutasVisitantes;
