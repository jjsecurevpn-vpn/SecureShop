import { Router, Request, Response } from "express";
import { TiendaRevendedoresService } from "../services/tienda-revendedores.service";
import { configService } from "../services/config.service";
import { CrearPagoRevendedorInput, ApiResponse } from "../types";

export function crearRutasRevendedores(
  tiendaRevendedores: TiendaRevendedoresService
): Router {
  const router = Router();
  console.log(
    "[crearRutasRevendedores] 🎯 Registrando rutas de revendedores..."
  );

  /**
   * GET /api/planes-revendedores
   * Obtiene todos los planes de revendedores activos con descuentos del 15% aplicados
   */
  router.get("/planes-revendedores", async (_req: Request, res: Response) => {
    console.log("[PLANES-REVENDEDORES ROUTE] 🎯 Route handler BEING EXECUTED!");
    try {
      console.log("[PLANES-REVENDEDORES ROUTE] Getting revendedor plans...");
      const planes = tiendaRevendedores.obtenerPlanesRevendedores();
      console.log(
        "[PLANES-REVENDEDORES ROUTE] Got",
        planes.length,
        "revendedor plans"
      );

      const response: ApiResponse = {
        success: true,
        data: planes,
      };

      // Evitar que el navegador o proxies cacheen la respuesta de planes de revendedores
      res.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
      );
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");

      res.json(response);
    } catch (error: any) {
      console.error("[PLANES-REVENDEDORES ROUTE] Error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error obteniendo planes de revendedores",
      } as ApiResponse);
    }
  });

  /**
   * POST /api/comprar-revendedor
   * Crea una nueva compra de plan de revendedor
   */
  router.post(
    "/comprar-revendedor",
    async (req: Request, res: Response): Promise<void> => {
      try {
        const input: CrearPagoRevendedorInput = req.body;

        // Validar datos de entrada
        if (
          !input.planRevendedorId ||
          !input.clienteEmail ||
          !input.clienteNombre
        ) {
          res.status(400).json({
            success: false,
            error:
              "Faltan datos requeridos: planRevendedorId, clienteEmail, clienteNombre",
          });
          return;
        }

        const resultado = await tiendaRevendedores.procesarCompra(input);

        res.json({
          success: true,
          data: resultado,
        });
      } catch (error: any) {
        console.error("[API] Error procesando compra de revendedor:", error);
        res.status(500).json({
          success: false,
          error: error.message || "Error al procesar la compra",
        });
      }
    }
  );

  /**
   * GET /api/config/hero-revendedores
   * Obtiene la configuración del hero para revendedores (promociones, título, etc)
   */
  router.get("/config/hero-revendedores", (_req: Request, res: Response) => {
    try {
      const heroConfig = configService.obtenerConfigHeroRevendedores();

      const response: ApiResponse = {
        success: true,
        data: heroConfig,
        message: "Configuración del hero de revendedores",
      };

      res.json(response);
    } catch (error: any) {
      console.error(
        "[Rutas Revendedores] Error obteniendo config del hero:",
        error
      );
      res.status(500).json({
        success: false,
        error: error.message || "Error obteniendo configuración",
      } as ApiResponse);
    }
  });

  /**
   * GET /api/pago-revendedor/:id
   * Obtiene información de un pago de revendedor y verifica su estado
   */
  router.get(
    "/pago-revendedor/:id",
    async (req: Request, res: Response): Promise<void> => {
      try {
        const pagoId = req.params.id;
        console.log(`[API] GET /pago-revendedor/${pagoId} - Iniciando...`);

        const pago = await tiendaRevendedores.verificarYProcesarPago(pagoId);
        console.log(`[API] Pago obtenido:`, JSON.stringify(pago, null, 2));

        if (!pago) {
          console.log(`[API] Pago no encontrado: ${pagoId}`);
          res.status(404).json({
            success: false,
            error: "Pago no encontrado",
          });
          return;
        }

        // Mapear PagoRevendedor a formato compatible con Pago para el frontend
        const pagoCompatible = {
          id: pago.id,
          plan_id: pago.plan_revendedor_id,
          monto: pago.monto,
          estado: pago.estado,
          metodo_pago: pago.metodo_pago,
          cliente_email: pago.cliente_email,
          cliente_nombre: pago.cliente_nombre,
          mp_payment_id: pago.mp_payment_id,
          mp_preference_id: pago.mp_preference_id,
          servex_cuenta_id: pago.servex_revendedor_id,
          servex_username: pago.servex_username,
          servex_password: pago.servex_password,
          servex_categoria:
            pago.servex_account_type === "credit"
              ? "Créditos"
              : "Usuarios Simultáneos",
          servex_expiracion: pago.servex_expiracion,
          servex_connection_limit: pago.servex_max_users,
          fecha_creacion: pago.fecha_creacion,
          fecha_actualizacion: pago.fecha_actualizacion,
        };

        res.json({
          success: true,
          data: pagoCompatible,
        });
      } catch (error: any) {
        console.error("[API] Error obteniendo pago de revendedor:", error);
        console.error("[API] Stack trace:", error.stack);
        res.status(500).json({
          success: false,
          error: error.message || "Error al obtener el pago",
        });
      }
    }
  );

  /**
   * POST /api/webhook-revendedor
   * Webhook de MercadoPago para notificaciones de pago de revendedores
   */
  router.post("/webhook-revendedor", async (req: Request, res: Response) => {
    try {
      console.log(
        "[Webhook Revendedor] Recibido:",
        JSON.stringify(req.body, null, 2)
      );

      // Procesar webhook de forma asíncrona
      tiendaRevendedores.procesarWebhook(req.body).catch((error) => {
        console.error("[Webhook Revendedor] Error procesando:", error);
      });

      // Responder inmediatamente a MercadoPago
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("[Webhook Revendedor] Error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error procesando webhook",
      });
    }
  });

  return router;
}
