import { Router, Request, Response } from 'express';
import { RenovacionService } from '../services/renovacion.service';

export function crearRutasRenovacion(renovacionService: RenovacionService): Router {
  const router = Router();

  /**
   * POST /api/renovacion/buscar
   * Busca un cliente o revendedor por email o username
   * Query param: tipo=cliente (solo busca clientes), tipo=revendedor (busca ambos)
   */
  router.post('/buscar', async (req: Request, res: Response) => {
    try {
      const { busqueda } = req.body;
      const tipo = req.query.tipo as string | undefined;

      if (!busqueda || typeof busqueda !== 'string' || busqueda.trim().length === 0) {
        return res.status(400).json({
          error: 'El campo "busqueda" es requerido y debe ser un email o username'
        });
      }

      // Si tipo=cliente, solo busca clientes
      const soloClientes = tipo === 'cliente';
      const resultado = await renovacionService.buscarCliente(busqueda.trim(), soloClientes);

      return res.json(resultado);
    } catch (error: any) {
      console.error('[Renovacion API] Error en búsqueda:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/renovacion/cliente
   * Procesa una renovación de cliente
   */
  router.post('/cliente', async (req: Request, res: Response) => {
    try {
      const { busqueda, dias, clienteEmail, clienteNombre, nuevoConnectionLimit } = req.body;

      // Validaciones
      if (!busqueda || typeof busqueda !== 'string') {
        return res.status(400).json({ error: 'El campo "busqueda" es requerido' });
      }
      if (!dias || typeof dias !== 'number' || dias <= 0) {
        return res.status(400).json({ error: 'El campo "dias" debe ser un número mayor a 0' });
      }
      if (!clienteEmail || typeof clienteEmail !== 'string') {
        return res.status(400).json({ error: 'El campo "clienteEmail" es requerido' });
      }
      if (!clienteNombre || typeof clienteNombre !== 'string') {
        return res.status(400).json({ error: 'El campo "clienteNombre" es requerido' });
      }

      const resultado = await renovacionService.procesarRenovacionCliente({
        busqueda: busqueda.trim(),
        dias,
        clienteEmail: clienteEmail.trim(),
        clienteNombre: clienteNombre.trim(),
        nuevoConnectionLimit: nuevoConnectionLimit ? Number(nuevoConnectionLimit) : undefined
      });

      return res.json(resultado);
    } catch (error: any) {
      console.error('[Renovacion API] Error en renovación de cliente:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/renovacion/revendedor
   * Procesa una renovación de revendedor
   */
  router.post('/revendedor', async (req: Request, res: Response) => {
    try {
      const { busqueda, dias, clienteEmail, clienteNombre, tipoRenovacion, cantidadSeleccionada } = req.body;

      // Validaciones
      if (!busqueda || typeof busqueda !== 'string') {
        return res.status(400).json({ error: 'El campo "busqueda" es requerido' });
      }
      if (!dias || typeof dias !== 'number' || dias <= 0) {
        return res.status(400).json({ error: 'El campo "dias" debe ser un número mayor a 0' });
      }
      if (!clienteEmail || typeof clienteEmail !== 'string') {
        return res.status(400).json({ error: 'El campo "clienteEmail" es requerido' });
      }
      if (!clienteNombre || typeof clienteNombre !== 'string') {
        return res.status(400).json({ error: 'El campo "clienteNombre" es requerido' });
      }

      const resultado = await renovacionService.procesarRenovacionRevendedor({
        busqueda: busqueda.trim(),
        dias,
        clienteEmail: clienteEmail.trim(),
        clienteNombre: clienteNombre.trim(),
        tipoRenovacion: tipoRenovacion || 'validity',
        cantidadSeleccionada: cantidadSeleccionada ? Number(cantidadSeleccionada) : undefined
      });

      return res.json(resultado);
    } catch (error: any) {
      console.error('[Renovacion API] Error en renovación de revendedor:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/renovacion/webhook
   * Webhook de MercadoPago para renovaciones
   */
  router.post('/webhook', async (req: Request, res: Response) => {
    try {
      await renovacionService.procesarWebhook(req.body);
      return res.status(200).send('OK');
    } catch (error: any) {
      console.error('[Renovacion API] Error en webhook:', error);
      // Aun con error, retornar 200 para que MercadoPago no reintente
      return res.status(200).send('ERROR');
    }
  });

  /**
   * GET /api/renovacion/success/:renovacionId
   * Página de éxito después de pagar una renovación
   */
  router.get('/success/:renovacionId', async (req: Request, res: Response) => {
    try {
      const renovacionId = parseInt(req.params.renovacionId, 10);
      const forzarReproceso = req.query.reprocesar === 'true';
      
      console.log(`[Renovacion API] GET /success/${renovacionId}?reprocesar=${forzarReproceso}`);
      
      if (isNaN(renovacionId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de renovación inválido'
        });
      }

      console.log(`[Renovacion API] Llamando verificarYProcesarRenovacion(${renovacionId}, ${forzarReproceso})`);
      const renovacion = await renovacionService.verificarYProcesarRenovacion(renovacionId, forzarReproceso);
      
      if (!renovacion) {
        return res.redirect(`/?error=renovacion-no-encontrada`);
      }

      // Obtener información actualizada del cliente desde Servex para la fecha de expiración
      let fechaExpiracion = 'N/A';
      try {
        const clienteActualizado = await renovacionService.obtenerClienteActualizado(renovacion.servex_username);
        if (clienteActualizado?.expiration_date) {
          fechaExpiracion = clienteActualizado.expiration_date;
        }
      } catch (error) {
        console.error('[Renovacion API] Error obteniendo fecha de expiración:', error);
      }

      // Redirigir a la página de éxito con parámetros de renovación
      const params = new URLSearchParams({
        pago_id: renovacionId.toString(),
        renovacion: 'true',
        username: renovacion.servex_username,
        dias: renovacion.dias_agregados.toString(),
        operacion: renovacion.operacion,
        monto: renovacion.monto.toString(),
        connection_limit: renovacion.datos_nuevos ? JSON.parse(renovacion.datos_nuevos).connection_limit : '',
        email: renovacion.cliente_email || '',
        fecha_expiracion: fechaExpiracion
      });
      
      return res.redirect(`/success?${params.toString()}`);
    } catch (error: any) {
      console.error('[Renovacion API] Error obteniendo renovación:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/renovacion/admin/forzar/:renovacionId
   * Forzar ejecución de confirmarRenovacion() para una renovación aprobada
   */
  router.post('/admin/forzar/:renovacionId', async (req: Request, res: Response) => {
    try {
      const renovacionId = parseInt(req.params.renovacionId, 10);
      
      if (isNaN(renovacionId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de renovación inválido'
        });
      }

      console.log(`[Renovacion ADMIN] Forzando ejecución de renovación ${renovacionId}`);
      
      // Obtener renovación
      const renovacion = await renovacionService.obtenerRenovacionPorId(renovacionId);
      if (!renovacion) {
        return res.status(404).json({
          success: false,
          error: 'Renovación no encontrada'
        });
      }

      // Forzar ejecución
      await renovacionService.confirmarRenovacion(renovacionId, renovacion.mp_payment_id || 'MANUAL');
      
      return res.json({
        success: true,
        message: `Renovación ${renovacionId} ejecutada exitosamente`
      });
    } catch (error: any) {
      console.error('[Renovacion ADMIN] Error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}
