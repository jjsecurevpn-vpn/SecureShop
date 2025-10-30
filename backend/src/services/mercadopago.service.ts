import axios, { AxiosInstance } from "axios";
import {
  MercadoPagoConfig,
  PreferenciaMercadoPago,
  PagoMercadoPago,
  WebhookMercadoPago,
} from "../types";

export class MercadoPagoService {
  private client: AxiosInstance;
  private config: MercadoPagoConfig;

  constructor(config: MercadoPagoConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: "https://api.mercadopago.com",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    // Interceptor para logging
    this.client.interceptors.response.use(
      (response) => {
        console.log(
          `[MercadoPago] ✅ ${response.config.method?.toUpperCase()} ${
            response.config.url
          } - ${response.status}`
        );
        return response;
      },
      (error) => {
        console.error(
          `[MercadoPago] ❌ Error: ${
            error.response?.data?.message || error.message
          }`
        );
        throw error;
      }
    );
  }

  /**
   * Crea una preferencia de pago en MercadoPago
   */
  async crearPreferencia(
    pagoId: string,
    titulo: string,
    precio: number,
    clienteEmail: string,
    clienteNombre: string,
    tipo:
      | "cliente"
      | "revendedor"
      | "renovacion-cliente"
      | "renovacion-revendedor" = "cliente"
  ): Promise<{ id: string; initPoint: string }> {
    try {
      // Construir URLs de retorno - usar frontendUrl directamente
      const baseUrl = this.config.frontendUrl;
      // Agregar timestamp para evitar caché de MercadoPago
      const timestamp = Date.now();

      // Determinar si es una renovación o un pago normal
      const esRenovacion =
        tipo === "renovacion-cliente" || tipo === "renovacion-revendedor";

      // Construir URLs según el tipo de operación
      const successUrl = esRenovacion
        ? `${baseUrl}/api/renovacion/success/${pagoId}?t=${timestamp}`
        : `${baseUrl}/success?pago_id=${pagoId}&tipo=${tipo}&t=${timestamp}`;
      const failureUrl = esRenovacion
        ? `${baseUrl}/?error=pago-rechazado&ref=${pagoId}&t=${timestamp}`
        : `${baseUrl}/?error=pago-fallido&tipo=${tipo}&t=${timestamp}`;
      const pendingUrl = esRenovacion
        ? `${baseUrl}/?info=pago-pendiente&ref=${pagoId}&t=${timestamp}`
        : `${baseUrl}/?info=pago-pendiente&tipo=${tipo}&t=${timestamp}`;

      const preferencia: PreferenciaMercadoPago = {
        items: [
          {
            title: titulo,
            unit_price: precio,
            quantity: 1,
            currency_id: "ARS",
          },
        ],
        payer: {
          email: clienteEmail,
          name: clienteNombre,
        },
        external_reference: pagoId,
        back_urls: {
          success: successUrl,
          failure: failureUrl,
          pending: pendingUrl,
        },
        auto_return: "approved",
        notification_url:
          tipo === "revendedor" || tipo === "renovacion-revendedor"
            ? `${this.config.webhookUrl}-revendedor`
            : this.config.webhookUrl,
      };

      console.log("[MercadoPago] 📋 URLs para esta preferencia:");
      console.log("  - success:", preferencia.back_urls.success);
      console.log("  - failure:", preferencia.back_urls.failure);
      console.log("  - pending:", preferencia.back_urls.pending);
      console.log("  - webhook:", preferencia.notification_url);
      console.log("[MercadoPago] Creando preferencia para pago:", pagoId);
      const response = await this.client.post(
        "/checkout/preferences",
        preferencia
      );

      return {
        id: response.data.id,
        initPoint: response.data.init_point,
      };
    } catch (error: any) {
      const mensaje = error.response?.data?.message || error.message;
      throw new Error(`Error creando preferencia de MercadoPago: ${mensaje}`);
    }
  }

  /**
   * Obtiene información de un pago desde MercadoPago
   */
  async obtenerPago(paymentId: string): Promise<PagoMercadoPago> {
    try {
      const response = await this.client.get<PagoMercadoPago>(
        `/v1/payments/${paymentId}`
      );
      return response.data;
    } catch (error: any) {
      const mensaje = error.response?.data?.message || error.message;
      throw new Error(`Error obteniendo pago de MercadoPago: ${mensaje}`);
    }
  }

  /**
   * Procesa un webhook de MercadoPago
   */
  async procesarWebhook(body: WebhookMercadoPago): Promise<{
    procesado: boolean;
    pagoId?: string;
    mpPaymentId?: string;
    estado?: string;
  }> {
    try {
      console.log("[MercadoPago] Procesando webhook:", body);

      // Solo procesamos notificaciones de tipo "payment"
      if (body.type !== "payment") {
        console.log("[MercadoPago] Tipo de notificación ignorado:", body.type);
        return { procesado: false };
      }

      const paymentId = body.data.id;
      console.log("[MercadoPago] Obteniendo detalles del pago:", paymentId);

      // Obtener detalles del pago
      const pago = await this.obtenerPago(paymentId);

      return {
        procesado: true,
        pagoId: pago.external_reference,
        mpPaymentId: pago.id,
        estado: pago.status,
      };
    } catch (error: any) {
      console.error("[MercadoPago] Error procesando webhook:", error.message);
      return { procesado: false };
    }
  }

  /**
   * Verifica el estado de un pago usando la referencia externa
   */
  async verificarPagoPorReferencia(
    externalReference: string
  ): Promise<PagoMercadoPago | null> {
    try {
      const response = await this.client.get("/v1/payments/search", {
        params: {
          external_reference: externalReference,
        },
      });

      const payments = response.data.results;
      if (payments && payments.length > 0) {
        // Retornar el pago más reciente
        return payments[0];
      }

      return null;
    } catch (error: any) {
      console.error("[MercadoPago] Error verificando pago:", error.message);
      return null;
    }
  }
}
