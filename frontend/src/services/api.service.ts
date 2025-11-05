import axios, { AxiosInstance } from "axios";
import {
  Plan,
  PlanRevendedor,
  Pago,
  CompraRequest,
  CompraRevendedorRequest,
  CompraResponse,
  ApiResponse,
  Usuario,
} from "../types";

export interface ValidacionCupon {
  valido: boolean;
  descuento?: number;
  precio_final?: number;
  mensaje?: string;
  cupon?: {
    id: number;
    codigo: string;
    tipo: "porcentaje" | "monto_fijo";
    valor: number;
  };
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    const baseURL = import.meta.env.VITE_API_URL || "/api";

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Interceptor para logging y manejo de errores
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          // El servidor respondió con un código de error
          const status = error.response.status;
          const data = error.response.data;

          // Mensajes amigables para el usuario
          const mensajesAmigables: { [key: number]: string } = {
            429: "Demasiadas solicitudes. Por favor espera antes de intentar nuevamente.",
            500: "Error en el servidor. Por favor intenta más tarde.",
            400:
              data?.error ||
              "Solicitud inválida. Por favor verifica los datos.",
            404: "El recurso solicitado no existe.",
            401: "No autorizado. Por favor inicia sesión.",
            403: "Acceso denegado.",
          };

          const mensajeError =
            mensajesAmigables[status] || data?.error || error.message;
          console.error(`[API Error ${status}]`, mensajeError);
          error.mensaje = mensajeError;
        } else if (error.request) {
          console.error(
            "[API Error] No hay respuesta del servidor:",
            error.message
          );
          error.mensaje =
            "No hay conexión con el servidor. Verifica tu conexión a internet.";
        } else {
          console.error("[API Error]", error.message);
          error.mensaje = error.message;
        }
        throw error;
      }
    );
  }

  /**
   * Obtiene la lista de planes disponibles
   */
  async obtenerPlanes(): Promise<Plan[]> {
    const response = await this.client.get<ApiResponse<Plan[]>>("/planes");
    if (!response.data.success) {
      throw new Error(response.data.error || "Error obteniendo planes");
    }
    return response.data.data || [];
  }

  /**
   * Inicia el proceso de compra
   */
  async comprarPlan(data: CompraRequest): Promise<CompraResponse> {
    const response = await this.client.post<ApiResponse<CompraResponse>>(
      "/comprar",
      data
    );
    if (!response.data.success) {
      throw new Error(response.data.error || "Error procesando compra");
    }
    return response.data.data!;
  }

  /**
   * Obtiene información de un pago
   */
  async obtenerPago(pagoId: string): Promise<Pago> {
    const response = await this.client.get<ApiResponse<Pago>>(
      `/pago/${pagoId}`
    );
    if (!response.data.success) {
      throw new Error(response.data.error || "Error obteniendo pago");
    }
    return response.data.data!;
  }

  /**
   * Obtiene la lista de planes de revendedores disponibles
   */
  /**
   * Obtiene la lista de planes de revendedores disponibles
   * @param forceReload Si es true, se añade un query param `_t` con timestamp para evitar caches intermedios/304
   */
  async obtenerPlanesRevendedores(
    forceReload: boolean = false
  ): Promise<PlanRevendedor[]> {
    const params = forceReload ? { _t: Date.now() } : {};
    const response = await this.client.get<ApiResponse<PlanRevendedor[]>>(
      "/planes-revendedores",
      { params }
    );
    if (!response.data.success) {
      throw new Error(
        response.data.error || "Error obteniendo planes de revendedores"
      );
    }
    return response.data.data || [];
  }

  /**
   * Inicia el proceso de compra de plan de revendedor
   */
  async comprarPlanRevendedor(
    data: CompraRevendedorRequest
  ): Promise<CompraResponse> {
    const response = await this.client.post<ApiResponse<CompraResponse>>(
      "/comprar-revendedor",
      data
    );
    if (!response.data.success) {
      throw new Error(
        response.data.error || "Error procesando compra de revendedor"
      );
    }
    return response.data.data!;
  }

  /**
   * Obtiene información de un pago de revendedor
   */
  async obtenerPagoRevendedor(pagoId: string): Promise<Pago> {
    const response = await this.client.get<ApiResponse<Pago>>(
      `/pago-revendedor/${pagoId}`
    );
    if (!response.data.success) {
      throw new Error(
        response.data.error || "Error obteniendo pago de revendedor"
      );
    }
    return response.data.data!;
  }

  /**
   * Obtiene los últimos usuarios creados
   */
  async obtenerUltimosUsuarios(limit: number = 10): Promise<Usuario[]> {
    const response = await this.client.get<ApiResponse<Usuario[]>>(
      `/clients?limit=${limit}`
    );
    if (!response.data.success) {
      throw new Error(
        response.data.error || "Error obteniendo últimos usuarios"
      );
    }
    return response.data.data || [];
  }

  /**
   * Obtiene la configuración del hero para revendedores
   */
  async obtenerConfigHeroRevendedores(): Promise<any> {
    const response = await this.client.get<any>("/config/hero-revendedores");

    // El backend puede devolver dos formatos:
    // 1) { success: true, data: { ... } }
    // 2) { titulo: ..., descripcion: ..., promocion: { ... } }
    const body = response.data;

    // Caso 1: envoltorio ApiResponse
    if (typeof body === "object" && body !== null && "success" in body) {
      if (!body.success) {
        throw new Error(
          body.error || "Error obteniendo configuración del hero"
        );
      }
      return body.data || {};
    }

    // Caso 2: respuesta directa con las propiedades del hero
    if (
      typeof body === "object" &&
      body !== null &&
      ("titulo" in body || "promocion" in body)
    ) {
      return body;
    }

    // En caso inesperado, devolver objeto vacío
    return {};
  }

  /**
   * Solicita una demostración gratuita
   */
  async solicitarDemo(nombre: string, email: string): Promise<any> {
    try {
      const response = await this.client.post<ApiResponse<any>>("/demo", {
        nombre,
        email,
      });
      return response.data;
    } catch (error: any) {
      // Capturar respuesta 429 (bloqueado) con datos
      if (error.response?.status === 429 && error.response?.data) {
        return error.response.data; // Retornar la respuesta del servidor tal cual
      }

      // Para otros errores, retornar con mensaje amigable
      return {
        success: false,
        error: error.mensaje || error.message || "Error al solicitar demo",
      };
    }
  }

  /**
   * Obtiene la configuración de MercadoPago
   */
  async obtenerConfigMercadoPago(): Promise<{ publicKey: string }> {
    const response = await this.client.get<{
      success: boolean;
      publicKey: string;
      error?: string;
    }>("/config/mercadopago");

    if (!response.data.success) {
      throw new Error(
        response.data.error || "Error obteniendo configuración de MercadoPago"
      );
    }
    return { publicKey: response.data.publicKey };
  }

  /**
   * Valida un cupón de descuento
   */
  async validarCupon(codigo: string, planId?: number, precioPlan?: number, clienteEmail?: string): Promise<ValidacionCupon> {
    try {
      const response = await this.client.post<{
        success: boolean;
        data?: any;
        error?: string;
      }>("/cupones/validar", {
        codigo: codigo.trim().toUpperCase(),
        planId,
        precioPlan,
        clienteEmail,
      });

      if (!response.data.success) {
        return {
          valido: false,
          mensaje: response.data.error || "Error validando cupón",
        };
      }

      // El backend devuelve success: true cuando el cupón es válido
      // Mapear la respuesta del backend a la interfaz ValidacionCupon
      const data = response.data.data;
      if (data && data.cupon) {
        return {
          valido: true,
          descuento: data.descuento,
          precio_final: data.precio_final,
          cupon: data.cupon,
        };
      } else {
        return {
          valido: false,
          mensaje: "Respuesta inválida del servidor",
        };
      }
    } catch (error: any) {
      console.error("[ApiService] Error validando cupón:", error);
      return {
        valido: false,
        mensaje: error.mensaje || "Error de conexión. Intenta nuevamente.",
      };
    }
  }

  /**
   * Aplica un cupón a una compra (se llama automáticamente en el backend)
   */
  async aplicarCupon(cuponId: number): Promise<boolean> {
    try {
      const response = await this.client.post<{
        success: boolean;
        error?: string;
      }>("/cupones/aplicar", {
        cuponId,
      });

      return response.data.success;
    } catch (error: any) {
      console.error("[ApiService] Error aplicando cupón:", error);
      return false;
    }
  }
}

export const apiService = new ApiService();
