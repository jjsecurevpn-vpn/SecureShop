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

      // Si tipo=cliente, solo busca clientes; si tipo=revendedor, solo busca revendedores
      const soloClientes = tipo === 'cliente';
      const soloRevendedores = tipo === 'revendedor';
      const resultado = await renovacionService.buscarCliente(busqueda.trim(), soloClientes, soloRevendedores);

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
      const {
        busqueda,
        dias,
        precio,
        clienteEmail,
        clienteNombre,
        nuevoConnectionLimit,
        precioOriginal,
        codigoCupon,
        cuponId,
        descuentoAplicado,
        planId,
      } = req.body;

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
        precio: precio ? Number(precio) : undefined, // Pasar precio al servicio
        clienteEmail: clienteEmail.trim(),
        clienteNombre: clienteNombre.trim(),
        nuevoConnectionLimit: nuevoConnectionLimit ? Number(nuevoConnectionLimit) : undefined,
        precioOriginal: precioOriginal ? Number(precioOriginal) : undefined,
        codigoCupon: typeof codigoCupon === 'string' ? codigoCupon : undefined,
        cuponId: cuponId ? Number(cuponId) : undefined,
        descuentoAplicado: descuentoAplicado ? Number(descuentoAplicado) : undefined,
        planId: planId ? Number(planId) : undefined
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
      const {
        busqueda,
        dias,
        clienteEmail,
        clienteNombre,
        tipoRenovacion,
        cantidadSeleccionada,
        precio,
        precioOriginal,
        codigoCupon,
        cuponId,
        descuentoAplicado,
        planId,
      } = req.body;

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

      const parsedCantidad = cantidadSeleccionada !== undefined && cantidadSeleccionada !== null && cantidadSeleccionada !== ''
        ? Number(cantidadSeleccionada)
        : undefined;
      const parsedPrecio = precio !== undefined && precio !== null && precio !== '' ? Number(precio) : undefined;
      const parsedPrecioOriginal = precioOriginal !== undefined && precioOriginal !== null && precioOriginal !== ''
        ? Number(precioOriginal)
        : undefined;
      const parsedCuponId = cuponId !== undefined && cuponId !== null && cuponId !== '' ? Number(cuponId) : undefined;
      const parsedDescuento = descuentoAplicado !== undefined && descuentoAplicado !== null && descuentoAplicado !== ''
        ? Number(descuentoAplicado)
        : undefined;
      const parsedPlanId = planId !== undefined && planId !== null && planId !== '' ? Number(planId) : undefined;

      if (parsedCantidad !== undefined && Number.isNaN(parsedCantidad)) {
        return res.status(400).json({ error: 'El campo "cantidadSeleccionada" es inválido' });
      }

      if (parsedPrecio !== undefined && Number.isNaN(parsedPrecio)) {
        return res.status(400).json({ error: 'El campo "precio" es inválido' });
      }

      if (parsedPrecioOriginal !== undefined && Number.isNaN(parsedPrecioOriginal)) {
        return res.status(400).json({ error: 'El campo "precioOriginal" es inválido' });
      }

      if (parsedCuponId !== undefined && Number.isNaN(parsedCuponId)) {
        return res.status(400).json({ error: 'El campo "cuponId" es inválido' });
      }

      if (parsedDescuento !== undefined && Number.isNaN(parsedDescuento)) {
        return res.status(400).json({ error: 'El campo "descuentoAplicado" es inválido' });
      }

      if (parsedPlanId !== undefined && Number.isNaN(parsedPlanId)) {
        return res.status(400).json({ error: 'El campo "planId" es inválido' });
      }

      const resultado = await renovacionService.procesarRenovacionRevendedor({
        busqueda: busqueda.trim(),
        dias,
        clienteEmail: clienteEmail.trim(),
        clienteNombre: clienteNombre.trim(),
        tipoRenovacion: tipoRenovacion || 'validity',
        cantidadSeleccionada: parsedCantidad,
        precio: parsedPrecio,
        precioOriginal: parsedPrecioOriginal,
        codigoCupon: typeof codigoCupon === 'string' ? codigoCupon : undefined,
        cuponId: parsedCuponId,
        descuentoAplicado: parsedDescuento,
        planId: parsedPlanId,
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
   * Incluye reintentos automáticos si el webhook aún no ha procesado
   */
  router.get('/success/:renovacionId', async (req: Request, res: Response) => {
    try {
      const renovacionId = parseInt(req.params.renovacionId, 10);
      const forzarReproceso = req.query.reprocesar === 'true';
      const intento = parseInt(req.query.intento as string, 10) || 1;
      
      console.log(`[Renovacion API] GET /success/${renovacionId}?reprocesar=${forzarReproceso}&intento=${intento}`);
      
      if (isNaN(renovacionId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de renovación inválido'
        });
      }

      console.log(`[Renovacion API] Llamando verificarYProcesarRenovacion(${renovacionId}, ${forzarReproceso})`);
      let renovacion = await renovacionService.verificarYProcesarRenovacion(renovacionId, forzarReproceso);
      
      if (!renovacion) {
        return res.redirect(`/?error=renovacion-no-encontrada`);
      }

      // Si aún está pendiente y no hemos reintentado mucho, esperar y reintentar
      if (renovacion.estado === 'pendiente' && intento < 3) {
        console.log(`[Renovacion API] Renovación aún pendiente (intento ${intento}), reintentando en 2 segundos...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return res.redirect(`/api/renovacion/success/${renovacionId}?reprocesar=${forzarReproceso}&intento=${intento + 1}`);
      }

      // Si sigue pendiente después de reintentos, avisar al usuario pero permitir continuar
      if (renovacion.estado === 'pendiente') {
        console.warn(`[Renovacion API] ⚠️ Renovación ${renovacionId} aún pendiente después de ${intento} intentos. El pago se procesará en background.`);
      }

      // Obtener información actualizada desde Servex para mostrar expiración/limites
      let fechaExpiracion = 'N/A';
      let usuariosActuales = '';
      let creditosActuales = '';
      try {
        if (renovacion.tipo === 'revendedor') {
          const revendedorActualizado = await renovacionService.obtenerRevendedorActualizado(renovacion.servex_username);
          if (revendedorActualizado) {
            if (revendedorActualizado.expiration_date) {
              fechaExpiracion = revendedorActualizado.expiration_date;
            }
            if (revendedorActualizado.account_type === 'credit') {
              creditosActuales = String(revendedorActualizado.max_users ?? '');
            } else {
              usuariosActuales = String(revendedorActualizado.max_users ?? '');
            }
          }
        } else {
          const clienteActualizado = await renovacionService.obtenerClienteActualizado(renovacion.servex_username);
          if (clienteActualizado?.expiration_date) {
            fechaExpiracion = clienteActualizado.expiration_date;
          }
        }
      } catch (error) {
        console.error('[Renovacion API] Error obteniendo información de expiración:', error);
      }

      const datosNuevos = renovacion.datos_nuevos ? JSON.parse(renovacion.datos_nuevos) : null;

      // Redirigir a la página de éxito con parámetros de renovación
      const params = new URLSearchParams({
        pago_id: renovacionId.toString(),
        renovacion: 'true',
        tipo: renovacion.tipo,
        username: renovacion.servex_username,
        dias: renovacion.dias_agregados.toString(),
        operacion: renovacion.operacion,
        monto: renovacion.monto.toString(),
        connection_limit: datosNuevos?.connection_limit || usuariosActuales,
        creditos: datosNuevos?.cantidad && datosNuevos?.tipo_renovacion === 'credit' ? String(datosNuevos.cantidad) : creditosActuales,
        email: renovacion.cliente_email || '',
        fecha_expiracion: fechaExpiracion,
        estado: renovacion.estado
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
   * GET /api/renovacion/status/:renovacionId
   * Verifica el estado actual de una renovación (JSON)
   * Útil para consultas desde el cliente con reintentos automáticos
   * Query param: reprocesar=true para forzar reprocesamiento si está aprobada
   */
  router.get('/status/:renovacionId', async (req: Request, res: Response) => {
    try {
      const renovacionId = parseInt(req.params.renovacionId, 10);
      const forzarReproceso = req.query.reprocesar === 'true';
      
      if (isNaN(renovacionId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de renovación inválido'
        });
      }

      // Usar verificarYProcesarRenovacion que maneja todo (incluyendo verificar en MP si es necesario)
      const renovacion = await renovacionService.verificarYProcesarRenovacion(renovacionId, forzarReproceso);
      
      if (!renovacion) {
        return res.status(404).json({
          success: false,
          error: 'Renovación no encontrada',
          renovacionId
        });
      }

      return res.json({
        success: true,
        renovacion: {
          id: renovacion.id,
          estado: renovacion.estado,
          mp_payment_id: renovacion.mp_payment_id || null,
          monto: renovacion.monto,
          dias: renovacion.dias_agregados,
          cliente_email: renovacion.cliente_email,
          fecha_creacion: renovacion.fecha_creacion,
          tipo: renovacion.tipo,
          username: renovacion.servex_username
        }
      });
    } catch (error: any) {
      console.error('[Renovacion API] Error obteniendo estado:', error);
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
      await renovacionService.confirmarRenovacion(renovacionId, renovacion.mp_payment_id || `ADMIN-FORCE-${renovacionId}`);
      
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

  /**
   * GET /api/renovacion/failure
   * Página de fallo después del pago de renovación
   */
  router.get('/failure', (req: Request, res: Response) => {
    const { external_reference, tipo, reason } = req.query;
    res.redirect(
      `${
        process.env.CORS_ORIGIN || "http://localhost:3000"
      }/error?code=PAYMENT_REJECTED&pago_id=${external_reference}&tipo=${
        tipo || "cliente"
      }&operacion=renovacion${reason ? `&message=${encodeURIComponent(reason as string)}` : ""}`
    );
  });

  /**
   * GET /api/renovacion/pending
   * Página de pago pendiente de renovación
   */
  router.get('/pending', (req: Request, res: Response) => {
    const { external_reference, tipo } = req.query;

    res.redirect(
      `${
        process.env.CORS_ORIGIN || "http://localhost:3000"
      }/error?code=PAYMENT_PENDING&pago_id=${external_reference}&tipo=${tipo || "cliente"}&operacion=renovacion`
    );
  });

  /**
   * GET /api/renovacion/error
   * Ruta genérica para errores de renovación
   */
  router.get('/error', (req: Request, res: Response) => {
    const { external_reference, tipo, message } = req.query;
    res.redirect(
      `${
        process.env.CORS_ORIGIN || "http://localhost:3000"
      }/error?code=PAYMENT_ERROR&pago_id=${external_reference}&tipo=${
        tipo || "cliente"
      }&operacion=renovacion${message ? `&message=${encodeURIComponent(message as string)}` : ""}`
    );
  });

  /**
   * POST /api/renovacion/admin/reenviar-email/:renovacionId
   * Reenvía el email de confirmación de una renovación aprobada
   */
  router.post('/admin/reenviar-email/:renovacionId', async (req: Request, res: Response) => {
    try {
      const renovacionId = parseInt(req.params.renovacionId, 10);
      
      if (isNaN(renovacionId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de renovación inválido'
        });
      }

      // Importar solo email service
      const emailService = (await import('../services/email.service')).default;

      // Obtener renovación usando el servicio
      const renovacion = await renovacionService.obtenerRenovacionPorId(renovacionId);
      
      if (!renovacion) {
        return res.status(404).json({
          success: false,
          error: 'Renovación no encontrada'
        });
      }

      if (renovacion.estado !== 'aprobado') {
        return res.status(400).json({
          success: false,
          error: `Renovación en estado: ${renovacion.estado}. Solo renovaciones aprobadas pueden reenviar email.`
        });
      }

      // Obtener datos actualizados de Servex usando métodos del renovacionService
      let nuevaExpiracion = '';
      let detallesExtra = '';
      
      if (renovacion.tipo === 'cliente') {
        const clienteActualizado = await renovacionService.obtenerClienteActualizado(renovacion.servex_username);
        if (clienteActualizado?.expiration_date) {
          nuevaExpiracion = new Date(clienteActualizado.expiration_date).toLocaleDateString('es-AR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
          });
        }
        if (renovacion.operacion === 'upgrade' && renovacion.datos_nuevos) {
          const datosNuevos = JSON.parse(renovacion.datos_nuevos);
          detallesExtra = `Nuevo límite: ${datosNuevos.connection_limit} dispositivos`;
        }
      } else if (renovacion.tipo === 'revendedor') {
        const revendedorActualizado = await renovacionService.obtenerRevendedorActualizado(renovacion.servex_username);
        if (revendedorActualizado?.expiration_date) {
          nuevaExpiracion = new Date(revendedorActualizado.expiration_date).toLocaleDateString('es-AR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
          });
        }
        if (renovacion.datos_nuevos) {
          const datosNuevos = JSON.parse(renovacion.datos_nuevos);
          if (datosNuevos.tipo_renovacion === 'validity') {
            detallesExtra = `${datosNuevos.cantidad} usuarios máx`;
          } else if (datosNuevos.tipo_renovacion === 'credit') {
            detallesExtra = `+${datosNuevos.cantidad} créditos`;
          }
        }
      }

      // Enviar email
      await emailService.enviarConfirmacionRenovacion(renovacion.cliente_email, {
        tipo: renovacion.tipo,
        username: renovacion.servex_username,
        diasAgregados: renovacion.dias_agregados,
        nuevaExpiracion: nuevaExpiracion || 'Ver en panel',
        monto: renovacion.monto,
        operacion: renovacion.operacion || (renovacion.datos_nuevos ? JSON.parse(renovacion.datos_nuevos).tipo_renovacion : undefined),
        detallesExtra: detallesExtra || undefined,
      });

      // Notificar al administrador del reenvío
      const tipoNotificacion = renovacion.tipo === 'cliente' ? 'renovacion-cliente' : 'renovacion-revendedor';
      await emailService.notificarVentaAdmin(tipoNotificacion, {
        clienteNombre: renovacion.cliente_nombre,
        clienteEmail: renovacion.cliente_email,
        monto: renovacion.monto,
        descripcion: `📧 REENVÍO EMAIL - ${renovacion.tipo === 'cliente' ? 'Renovación cliente' : 'Renovación revendedor'}: ${renovacion.dias_agregados} días${detallesExtra ? ` (${detallesExtra})` : ''}`,
        username: renovacion.servex_username
      });

      return res.json({
        success: true,
        message: `Email de confirmación reenviado a ${renovacion.cliente_email}`,
        renovacion: {
          id: renovacion.id,
          tipo: renovacion.tipo,
          username: renovacion.servex_username,
          email: renovacion.cliente_email,
          nuevaExpiracion
        }
      });
    } catch (error: any) {
      console.error('[Renovacion API] Error reenviando email:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/renovacion/admin/buscar-por-email
   * Busca renovaciones por email del cliente
   */
  router.get('/admin/buscar-por-email', async (req: Request, res: Response) => {
    try {
      const email = req.query.email as string;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email requerido'
        });
      }

      const renovaciones = await renovacionService.buscarRenovacionesPorEmail(email);
      
      return res.json({
        success: true,
        email,
        total: renovaciones.length,
        renovaciones
      });
    } catch (error: any) {
      console.error('[Renovacion API] Error buscando renovaciones por email:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/renovacion/admin/sync-historial
   * Sincroniza renovaciones aprobadas al historial de Supabase
   */
  router.post('/admin/sync-historial', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email requerido'
        });
      }

      const { supabaseService } = await import('../services/supabase.service');
      
      // Buscar renovaciones aprobadas de este usuario
      const renovaciones = await renovacionService.buscarRenovacionesPorEmail(email);
      const aprobadas = renovaciones.filter((r: any) => r.estado === 'aprobado');
      
      if (aprobadas.length === 0) {
        return res.json({
          success: true,
          message: 'No hay renovaciones aprobadas para sincronizar',
          sincronizadas: 0
        });
      }

      let sincronizadas = 0;
      const errores: string[] = [];

      for (const renovacion of aprobadas) {
        try {
          let planNombre = '';
          if (renovacion.tipo === 'cliente') {
            planNombre = renovacion.operacion === 'upgrade' 
              ? `Upgrade: ${renovacion.dias_agregados} días` 
              : `Renovación: ${renovacion.dias_agregados} días`;
          } else {
            // Revendedor
            if (renovacion.datos_nuevos) {
              const datos = JSON.parse(renovacion.datos_nuevos);
              planNombre = datos.plan_nombre || `Recarga: ${datos.cantidad || 0} créditos`;
            } else {
              planNombre = `Renovación revendedor: ${renovacion.dias_agregados} días`;
            }
          }

          const resultado = await supabaseService.syncApprovedPurchase({
            email: renovacion.cliente_email,
            planNombre,
            monto: renovacion.monto,
            tipo: renovacion.tipo === 'cliente' ? 'renovacion' : 'revendedor',
            servexUsername: renovacion.servex_username,
            mpPaymentId: renovacion.mp_payment_id || `RENOV-${renovacion.id}`,
          });

          if (resultado) {
            sincronizadas++;
          }
        } catch (err: any) {
          errores.push(`Renovación ${renovacion.id}: ${err.message}`);
        }
      }

      return res.json({
        success: true,
        message: `Se sincronizaron ${sincronizadas} de ${aprobadas.length} renovaciones`,
        sincronizadas,
        total: aprobadas.length,
        errores: errores.length > 0 ? errores : undefined
      });
    } catch (error: any) {
      console.error('[Renovacion API] Error sincronizando historial:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/renovacion/admin/agregar-historial
   * Agrega manualmente una compra/cuenta existente al historial de un usuario
   * Útil para asociar cuentas existentes de Servex a usuarios de la plataforma
   */
  router.post('/admin/agregar-historial', async (req: Request, res: Response) => {
    try {
      const { 
        email, 
        servex_username,
        servex_password, // Contraseña real (opcional, ya que Servex no la devuelve)
        tipo = 'plan',
        plan_nombre,
        monto = 0 
      } = req.body;
      
      if (!email || !servex_username) {
        return res.status(400).json({
          success: false,
          error: 'Email y servex_username son requeridos'
        });
      }

      const { supabaseService } = await import('../services/supabase.service');
      
      // Buscar datos de la cuenta en Servex
      const servexService = renovacionService.getServexService();
      let cuenta = await servexService.buscarClientePorUsername(servex_username);
      
      if (!cuenta) {
        // Buscar en revendedores
        cuenta = await servexService.buscarRevendedorPorUsername(servex_username);
      }

      if (!cuenta) {
        return res.status(404).json({
          success: false,
          error: `Cuenta ${servex_username} no encontrada en Servex`
        });
      }

      // Determinar tipo
      const esRevendedor = cuenta.max_users && cuenta.max_users > 1;
      const tipoFinal = esRevendedor ? 'revendedor' : tipo;
      
      // Generar nombre del plan si no se proporciona
      const planNombreFinal = plan_nombre || 
        (esRevendedor 
          ? `Cuenta Revendedor: ${cuenta.max_users} créditos`
          : `Plan VPN: ${cuenta.max_connections || 1} conexión`);

      // No guardar hash de contraseña - solo usar si se proporciona explícitamente
      // Servex devuelve el hash bcrypt, no la contraseña real
      const passwordReal = servex_password || null;

      // Sincronizar con Supabase
      const resultado = await supabaseService.syncApprovedPurchase({
        email,
        planNombre: planNombreFinal,
        monto,
        tipo: tipoFinal,
        servexUsername: cuenta.username,
        servexPassword: passwordReal,
        servexExpiracion: cuenta.expiration_date,
        mpPaymentId: `MANUAL-${Date.now()}`,
      });

      if (!resultado) {
        return res.status(400).json({
          success: false,
          error: 'No se pudo agregar al historial. ¿El email está registrado en la plataforma?'
        });
      }

      return res.json({
        success: true,
        message: `Cuenta ${servex_username} asociada exitosamente a ${email}`,
        data: {
          username: cuenta.username,
          tipo: tipoFinal,
          planNombre: planNombreFinal,
          expiracion: cuenta.expiration_date
        }
      });
    } catch (error: any) {
      console.error('[Renovacion API] Error agregando al historial:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}
