import { Router, Request, Response } from "express";
import { TiendaService } from "../services/tienda.service";
import { WebSocketService } from "../services/websocket.service";
import { configService } from "../services/config.service";
import { ApiResponse, CrearPagoInput } from "../types";

export function crearRutasTienda(tiendaService: TiendaService, wsService: WebSocketService): Router {
  const router = Router();
  console.log("[crearRutasTienda] 🚀 INICIALIZANDO RUTAS DE TIENDA...");

  const sanitizeReference = (value: unknown): string | null => {
    if (!value) return null;
    if (Array.isArray(value)) {
      return sanitizeReference(value[0]);
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return null;
      const firstSegment = trimmed.includes(",") ? trimmed.split(",")[0]?.trim() : trimmed;
      return firstSegment || null;
    }
    return null;
  };

  const sanitizeTipo = (value: unknown): string => {
    if (Array.isArray(value)) {
      return sanitizeTipo(value[0]);
    }
    return typeof value === "string" && value.trim() ? value.trim() : "cliente";
  };

  /**
   * GET /api/planes
   * Obtiene la lista de planes disponibles
   */
  router.get("/planes", async (req: Request, res: Response) => {
    try {
      const contextRaw = Array.isArray(req.query.context)
        ? req.query.context[0]
        : req.query.context;
      const explicitFlag = Array.isArray(req.query.forNewCustomers)
        ? req.query.forNewCustomers[0]
        : req.query.forNewCustomers;

      const context = typeof contextRaw === "string" ? contextRaw.toLowerCase() : "";
      const isRenewalContext =
        context === "renovacion" ||
        context === "renovaciones" ||
        context === "renewal";

      let forNewCustomers: boolean | undefined = undefined;
      if (typeof explicitFlag === "string") {
        if (explicitFlag.toLowerCase() === "true") {
          forNewCustomers = true;
        } else if (explicitFlag.toLowerCase() === "false") {
          forNewCustomers = false;
        }
      }

      const planes = tiendaService.obtenerPlanes({
        forNewCustomers:
          forNewCustomers !== undefined ? forNewCustomers : !isRenewalContext,
      });

      const response: ApiResponse = {
        success: true,
        data: planes,
      };

      // Evitar que el navegador o proxies cacheen la respuesta de planes
      res.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
      );
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");

      // Quitar ETag para evitar respuestas 304 cuando el cliente envía If-None-Match
      // así forzamos envío del JSON actualizado con los precios reales
      try {
        res.removeHeader("ETag");
      } catch (_) {
        // ignore in environments where removeHeader may not exist
        res.set("ETag", "");
      }

      res.json(response);
    } catch (error: any) {
      console.error("[Rutas] Error obteniendo planes:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error obteniendo planes",
      } as ApiResponse);
    }
  });

  /**
   * POST /api/comprar
   * Inicia el proceso de compra
   */
  router.post("/comprar", async (req: Request, res: Response) => {
    try {
      const { planId, clienteEmail, clienteNombre, codigoCupon } =
        req.body as CrearPagoInput;

      // Validaciones
      if (!planId || !clienteEmail || !clienteNombre) {
        res.status(400).json({
          success: false,
          error: "Faltan datos requeridos: planId, clienteEmail, clienteNombre",
        } as ApiResponse);
        return;
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clienteEmail)) {
        res.status(400).json({
          success: false,
          error: "Email inválido",
        } as ApiResponse);
        return;
      }

      // Procesar compra
      const resultado = await tiendaService.procesarCompra({
        planId,
        clienteEmail,
        clienteNombre,
        codigoCupon,
      });

      const response: ApiResponse = {
        success: true,
        data: resultado,
        message: "Pago creado exitosamente",
      };

      res.json(response);
    } catch (error: any) {
      console.error("[Rutas] Error procesando compra:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error procesando compra",
      } as ApiResponse);
    }
  });

  /**
   * POST /api/webhook
   * Webhook de MercadoPago para notificaciones de pago
   */
  router.post("/webhook", async (req: Request, res: Response) => {
    try {
      console.log("[Webhook] Recibido:", JSON.stringify(req.body, null, 2));

      // Procesar webhook de forma asíncrona
      tiendaService.procesarWebhook(req.body).catch((error) => {
        console.error("[Webhook] Error procesando:", error);
      });

      // Responder inmediatamente a MercadoPago
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("[Webhook] Error:", error);
      // Aún así responder 200 para evitar reintentos de MercadoPago
      res.status(200).json({ success: false });
    }
  });

  /**
   * GET /api/pago/success
   * Página de éxito después del pago
   * 🔴 CRÍTICO: Verifica sincronicamente en MercadoPago antes de redirigir
   */
  router.get("/pago/success", async (req: Request, res: Response) => {
    const { payment_id, external_reference, tipo } = req.query;
    const externalReference = sanitizeReference(external_reference);
    const tipoNormalizado = sanitizeTipo(tipo);

    if (!externalReference) {
      console.error("[Success] ❌ external_reference ausente o inválido", external_reference);
      res.redirect(
        `${process.env.CORS_ORIGIN || "http://localhost:3000"}/error?code=INVALID_REFERENCE&operacion=compra`
      );
      return;
    }

    // 🔍 VERIFICACIÓN SINCRÓNICA: No confiar solo en webhooks
    if (externalReference) {
      try {
        console.log(
          `[Success] 🔍 Verificando pago ${externalReference} contra MercadoPago...`
        );
        const timestamp = new Date().toISOString();

        // Consultar MercadoPago directamente
        const pagoMP = await tiendaService
          .getMercadoPagoService()
          .verificarPagoPorReferencia(externalReference);

        if (pagoMP && pagoMP.status === "approved") {
          console.log(
            `[${timestamp}] ✅ Pago aprobado en MercadoPago, procesando...`
          );

          // Procesar inmediatamente
          try {
            await tiendaService.verificarYProcesarPago(
              externalReference
            );
            console.log(
              `[${timestamp}] ✅ Pago procesado exitosamente ANTES de redirigir`
            );
          } catch (procError: any) {
            console.error(
              `[${timestamp}] ⚠️ Error procesando pago:`,
              procError.message
            );
            // Continuar de todos modos, el webhook puede reintentarlo
          }
        } else if (pagoMP) {
          console.log(
            `[Success] ⚠️ Pago en estado: ${pagoMP.status} (esperando webhook)`
          );
        } else {
          console.log(
            `[Success] ⚠️ Pago no encontrado en MercadoPago, esperando webhook`
          );
        }
      } catch (error: any) {
        console.error(
          `[Success] ❌ Error verificando en MercadoPago:`,
          error.message
        );
        // No fallar, continuar redirigiendo
      }
    }

    // Agregar headers anti-caché para asegurar datos frescos
    res.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
    );
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    // Redirigir al frontend con los parámetros
    res.redirect(
      `${
        process.env.CORS_ORIGIN || "http://localhost:3000"
      }/success?status=approved&payment_id=${Array.isArray(payment_id) ? payment_id[0] : payment_id}&pago_id=${externalReference}&tipo=${
        tipoNormalizado
      }`
    );
  });

  /**
   * GET /api/pago/failure
   * Página de fallo después del pago
   */
  router.get("/pago/failure", async (req: Request, res: Response) => {
    const { external_reference, tipo, reason } = req.query;
    const externalReference = sanitizeReference(external_reference);
    const tipoNormalizado = sanitizeTipo(tipo);
    const frontendBase = process.env.CORS_ORIGIN || "http://localhost:3000";

    if (externalReference) {
      try {
        console.log(
          `[Failure] 🔍 Verificando pago ${externalReference} contra MercadoPago...`
        );
        const pagoMP = await tiendaService
          .getMercadoPagoService()
          .verificarPagoPorReferencia(externalReference);

        if (pagoMP && pagoMP.status === "approved") {
          const timestamp = new Date().toISOString();
          console.log(
            `[${timestamp}] ✅ Pago aprobado detectado desde ruta failure, procesando...`
          );

          try {
            await tiendaService.verificarYProcesarPago(
              externalReference
            );
            console.log(
              `[${timestamp}] ✅ Pago procesado exitosamente desde ruta failure`
            );
          } catch (procError: any) {
            console.error(
              `[${timestamp}] ⚠️ Error procesando pago en ruta failure:`,
              procError.message
            );
          }

          res.redirect(
            `${frontendBase}/success?status=approved&payment_id=${pagoMP.id}&pago_id=${externalReference}&tipo=${
              tipoNormalizado
            }`
          );
          return;
        }
      } catch (error: any) {
        console.error(
          `[Failure] ❌ Error verificando pago en MercadoPago:`,
          error.message
        );
      }
    }

    res.redirect(
      `${frontendBase}/error?code=PAYMENT_REJECTED&pago_id=${externalReference || ""}&tipo=${
        tipoNormalizado
      }&operacion=compra${reason ? `&message=${encodeURIComponent(reason as string)}` : ""}`
    );
  });

  /**
   * GET /api/pago/pending
   * Página de pago pendiente
   */
  router.get("/pago/pending", async (req: Request, res: Response) => {
    const { external_reference, tipo } = req.query;
    const externalReference = sanitizeReference(external_reference);
    const tipoNormalizado = sanitizeTipo(tipo);
    const frontendBase = process.env.CORS_ORIGIN || "http://localhost:3000";

    if (externalReference) {
      try {
        console.log(
          `[Pending] 🔍 Verificando pago ${externalReference} contra MercadoPago...`
        );
        const pagoMP = await tiendaService
          .getMercadoPagoService()
          .verificarPagoPorReferencia(externalReference);

        if (pagoMP && pagoMP.status === "approved") {
          const timestamp = new Date().toISOString();
          console.log(
            `[${timestamp}] ✅ Pago aprobado detectado desde ruta pending, procesando...`
          );

          try {
            await tiendaService.verificarYProcesarPago(
              externalReference
            );
            console.log(
              `[${timestamp}] ✅ Pago procesado exitosamente desde ruta pending`
            );
          } catch (procError: any) {
            console.error(
              `[${timestamp}] ⚠️ Error procesando pago en ruta pending:`,
              procError.message
            );
          }

          res.redirect(
            `${frontendBase}/success?status=approved&payment_id=${pagoMP.id}&pago_id=${externalReference}&tipo=${
              tipoNormalizado
            }`
          );
          return;
        }

        if (pagoMP && pagoMP.status === "rejected") {
          console.log(
            `[Pending] ⚠️ MercadoPago indica rechazo para ${externalReference}`
          );
          res.redirect(
            `${frontendBase}/error?code=PAYMENT_REJECTED&pago_id=${externalReference}&tipo=${
              tipoNormalizado
            }&operacion=compra`
          );
          return;
        }
      } catch (error: any) {
        console.error(
          `[Pending] ❌ Error verificando pago en MercadoPago:`,
          error.message
        );
      }
    }

    res.redirect(
      `${frontendBase}/error?code=PAYMENT_PENDING&pago_id=${externalReference || ""}&tipo=${
        tipoNormalizado
      }&operacion=compra`
    );
  });

  /**
   * GET /api/pago/:id
   * Obtiene información de un pago y verifica su estado
   */
  router.get("/pago/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const pagoId = sanitizeReference(id);

      if (!pagoId) {
        res.status(400).json({
          success: false,
          error: "ID de pago inválido",
        } as ApiResponse);
        return;
      }

      // Verificar y procesar el pago
      const pago = await tiendaService.verificarYProcesarPago(pagoId);

      if (!pago) {
        res.status(404).json({
          success: false,
          error: "Pago no encontrado",
        } as ApiResponse);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: pago,
      };

      res.json(response);
    } catch (error: any) {
      console.error("[Rutas] Error obteniendo pago:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error obteniendo pago",
      } as ApiResponse);
    }
  });

  /**
   * 🔴 CRÍTICO - POST /api/pago/:id/verificar-ahora
   * Fuerza la verificación inmediata contra MercadoPago
   * Usado como fallback si el webhook tarda mucho
   */
  router.post(
    "/pago/:id/verificar-ahora",
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const timestamp = new Date().toISOString();
        const pagoId = sanitizeReference(id);

        if (!pagoId) {
          console.log(
            `[${timestamp}] ⚠️ ID de pago inválido recibido en verificación forzada:`,
            id
          );
          res.status(400).json({
            success: false,
            error: "ID de pago inválido",
          } as ApiResponse);
          return;
        }

        console.log(
          `[${timestamp}] 🚨 VERIFICACIÓN FORZADA SOLICITADA para pago: ${pagoId}`
        );

        // Consultar MercadoPago directamente
        const pagoMP = await tiendaService
          .getMercadoPagoService()
          .verificarPagoPorReferencia(pagoId);

        if (!pagoMP) {
          console.log(`[${timestamp}] ⚠️ Pago no encontrado en MercadoPago`);
          res.status(404).json({
            success: false,
            error: "Pago no encontrado en MercadoPago",
          } as ApiResponse);
          return;
        }

        console.log(
          `[${timestamp}] 📊 Estado en MercadoPago: ${pagoMP.status}`
        );

        // Si está aprobado, procesar
        if (pagoMP.status === "approved") {
          console.log(`[${timestamp}] ✅ Pago aprobado! Procesando...`);
          try {
            await tiendaService.verificarYProcesarPago(pagoId);
            console.log(`[${timestamp}] ✅ Pago procesado exitosamente`);
          } catch (procError: any) {
            console.error(
              `[${timestamp}] ⚠️ Error procesando pago aprobado:`,
              procError.message
            );
            // Continuar de todos modos
          }
        }

        // Obtener información actualizada
        const pago = tiendaService.obtenerPago(pagoId);

        res.json({
          success: true,
          data: pago,
          meta: {
            mercadoPagoStatus: pagoMP.status,
          },
        } as ApiResponse);
      } catch (error: any) {
        console.error("[Rutas] Error en verificación forzada:", error);
        res.status(500).json({
          success: false,
          error: error.message || "Error verificando pago",
        } as ApiResponse);
      }
    }
  );

  /**
   * GET /api/pago/error
   * Ruta genérica para errores de pago (si MercadoPago falla antes de redirigir)
   */
  router.get("/pago/error", (req: Request, res: Response) => {
    const { external_reference, tipo, message } = req.query;
    res.redirect(
      `${
        process.env.CORS_ORIGIN || "http://localhost:3000"
      }/error?code=PAYMENT_ERROR&pago_id=${external_reference}&tipo=${
        tipo || "cliente"
      }&operacion=compra${message ? `&message=${encodeURIComponent(message as string)}` : ""}`
    );
  });

  /**
   * GET /api/config/info
   * Obtiene información sobre la configuración de planes
   */
  router.get("/config/info", (_req: Request, res: Response) => {
    try {
      const info = configService.obtenerInfoConfig();

      const response: ApiResponse = {
        success: true,
        data: info,
        message: "Información de configuración",
      };

      res.json(response);
    } catch (error: any) {
      console.error("[Rutas] Error obteniendo info de config:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error obteniendo configuración",
      } as ApiResponse);
    }
  });

  /**
   * GET /api/config/hero
   * Obtiene la configuración del hero (promociones, título, etc)
   */
  router.get("/config/hero", (_req: Request, res: Response) => {
    try {
      const heroConfig = configService.obtenerConfigHero();

      const response: ApiResponse = {
        success: true,
        data: heroConfig,
        message: "Configuración del hero",
      };

      res.json(response);
    } catch (error: any) {
      console.error("[Rutas] Error obteniendo config del hero:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error obteniendo configuración",
      } as ApiResponse);
    }
  });

  /**
   * POST /api/config/reload
   * Recarga la configuración desde el archivo (limpia caché)
   */
  router.post("/config/reload", (_req: Request, res: Response) => {
    try {
      configService.limpiarCache();

      const response: ApiResponse = {
        success: true,
        message: "Configuración recargada exitosamente",
        data: configService.obtenerInfoConfig(),
      };

      res.json(response);
    } catch (error: any) {
      console.error("[Rutas] Error recargando config:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error recargando configuración",
      } as ApiResponse);
    }
  });

  /**
   * POST /api/config/crear-default
   * Crea un archivo de configuración por defecto
   */
  router.post("/config/crear-default", (_req: Request, res: Response) => {
    try {
      configService.crearConfigPorDefecto();

      const response: ApiResponse = {
        success: true,
        message: "Archivo de configuración por defecto creado",
        data: configService.obtenerInfoConfig(),
      };

      res.json(response);
    } catch (error: any) {
      console.error("[Rutas] Error creando config default:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error creando configuración",
      } as ApiResponse);
    }
  });

  /**
   * POST /api/demo
   * Solicita una demostración gratuita (24 horas)
   * Previene spam con bloqueo de email/IP por 48 horas
   */
  router.post("/demo", async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, nombre } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress || "unknown";

      if (!email || !nombre) {
        res.status(400).json({
          success: false,
          error: "Email y nombre son requeridos",
        } as ApiResponse);
        return;
      }

      // Obtener el servicio de demos
      const demoService = tiendaService.getDemoService();

      // Verificar si está bloqueado
      const bloqueo = await demoService.verificarBloqueo(email, ipAddress);
      if (bloqueo.bloqueado) {
        res.status(429).json({
          success: false,
          error: bloqueo.motivo || "Bloqueado temporalmente",
          bloqueado: true,
          tiempo_restante: bloqueo.tiempo_restante,
        } as ApiResponse);
        return;
      }

      // Crear la demo
      const demo = await demoService.crearDemo(email, nombre, ipAddress);

      console.log(`[API] ✅ Demo creada exitosamente para ${email}`);

      const response: ApiResponse = {
        success: true,
        message: "Demostración solicitada exitosamente",
        data: {
          username: demo.servex_username,
          password: demo.servex_password,
          horas_validas: 24,
          mensaje: "Revisa tu email para más instrucciones",
        },
      };

      res.json(response);
    } catch (error: any) {
      console.error("[API] Error creando demo:", error.message);
      res.status(500).json({
        success: false,
        error: error.message || "Error creando demostración",
      } as ApiResponse);
    }
  });

  /**
   * GET /api/demo/recientes
   * Obtiene las demos recientemente creadas (solo admin)
   */
  router.get("/demo/recientes", async (_req: Request, res: Response) => {
    try {
      const demoService = tiendaService.getDemoService();
      const demos = demoService.obtenerDemosRecientes(5);

      const response: ApiResponse = {
        success: true,
        data: demos,
      };

      res.json(response);
    } catch (error: any) {
      console.error("[API] Error obteniendo demos recientes:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error obteniendo demostraciones",
      } as ApiResponse);
    }
  });

  /**
   * GET /api/pago/obtener-credenciales/:pagoId
   * Obtiene las credenciales de una compra realizada
   * ✅ NUEVO: Permite al cliente recuperar credenciales si el email no llegó
   */
  router.get(
    "/pago/obtener-credenciales/:pagoId",
    async (req: Request, res: Response) => {
      try {
        const { pagoId } = req.params;
        const { clienteEmail } = req.query;

        if (!pagoId) {
          res.status(400).json({
            success: false,
            error: "Falta el ID del pago",
          } as ApiResponse);
          return;
        }

        const pago = tiendaService.obtenerPago(pagoId);

        if (!pago) {
          res.status(404).json({
            success: false,
            error: "Pago no encontrado",
          } as ApiResponse);
          return;
        }

        // Validación de seguridad: verificar que el email coincida (si se proporciona)
        if (clienteEmail && pago.cliente_email !== clienteEmail) {
          res.status(403).json({
            success: false,
            error: "Email no coincide con el registro",
          } as ApiResponse);
          return;
        }

        // Si el pago no está aprobado, no mostrar credenciales
        if (pago.estado !== "aprobado") {
          res.status(400).json({
            success: false,
            error: `Pago en estado: ${pago.estado}. Solo pagos aprobados tienen credenciales.`,
          } as ApiResponse);
          return;
        }

        // Si no hay cuenta creada aún, esperar
        if (!pago.servex_username) {
          res.status(202).json({
            success: false,
            error:
              "Las credenciales aún se están procesando. Intente en unos segundos.",
          } as ApiResponse);
          return;
        }

        // Devolver credenciales
        res.json({
          success: true,
          data: {
            username: pago.servex_username,
            password: pago.servex_password,
            categoria: pago.servex_categoria,
            expiracion: pago.servex_expiracion,
            conexiones: pago.servex_connection_limit,
            servidores: wsService.obtenerEstadisticas().map((s: any) => `${s.serverName} (${s.location})`),
          },
        } as ApiResponse);
      } catch (error: any) {
        console.error("[API] Error obteniendo credenciales:", error);
        res.status(500).json({
          success: false,
          error: error.message || "Error obteniendo credenciales",
        } as ApiResponse);
      }
    }
  );

  /**
   * POST /api/admin/reenviar-email
   * Reenvía el email de credenciales a un cliente (útil cuando falla el envío original)
   */
  router.post("/admin/reenviar-email", async (req: Request, res: Response) => {
    try {
      const { pagoId } = req.body;

      if (!pagoId) {
        res.status(400).json({
          success: false,
          error: "Falta el ID del pago",
        } as ApiResponse);
        return;
      }

      const pago = tiendaService.obtenerPago(pagoId);

      if (!pago) {
        res.status(404).json({
          success: false,
          error: "Pago no encontrado",
        } as ApiResponse);
        return;
      }

      if (pago.estado !== "aprobado") {
        res.status(400).json({
          success: false,
          error: `Pago en estado: ${pago.estado}. Solo pagos aprobados pueden reenviar email.`,
        } as ApiResponse);
        return;
      }

      if (!pago.servex_username || !pago.servex_password) {
        res.status(400).json({
          success: false,
          error: "El pago no tiene credenciales asociadas",
        } as ApiResponse);
        return;
      }

      // Obtener información del plan (no necesaria para el email pero útil para el log)
      // const plan = tiendaService.obtenerPlanPorId(pago.plan_id);

      // Reenviar email
      const emailService = (await import("../services/email.service")).default;
      
      await emailService.enviarCredencialesCliente(pago.cliente_email, {
        username: pago.servex_username,
        password: pago.servex_password,
        categoria: pago.servex_categoria || "Clientes",
        expiracion: pago.servex_expiracion || "30 días",
        servidores: wsService.obtenerEstadisticas().map((s: any) => `${s.serverName} (${s.location})`),
      });

      console.log(`[Admin] ✅ Email reenviado a ${pago.cliente_email} para pago ${pagoId}`);

      res.json({
        success: true,
        message: `Email reenviado exitosamente a ${pago.cliente_email}`,
        data: {
          email: pago.cliente_email,
          username: pago.servex_username,
        },
      } as ApiResponse);
    } catch (error: any) {
      console.error("[Admin] Error reenviando email:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error reenviando email",
      } as ApiResponse);
    }
  });

  return router;
}
