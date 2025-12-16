import { v4 as uuidv4 } from "uuid";
import { MercadoPagoService } from "./mercadopago.service";
import emailService from "./email.service";
import { donacionesSupabaseService } from "./donaciones-supabase.service";
import {
  CrearDonacionInput,
  Donacion,
} from "../types";

export class DonacionesService {
  constructor(
    private mercadopago: MercadoPagoService
  ) {}

  // ============================================
  // MÉTODOS SUPABASE (sin fallback SQLite)
  // ============================================

  private async crearDonacionDB(data: any): Promise<any> {
    const donacion = await donacionesSupabaseService.crearDonacion(data);
    if (!donacion) {
      throw new Error("Error al crear donación en Supabase");
    }
    console.log(`[Donaciones] ✅ Donación creada: ${donacion.id}`);
    return donacion;
  }

  private async obtenerDonacionPorId(id: string): Promise<any | null> {
    return await donacionesSupabaseService.obtenerDonacionPorId(id);
  }

  private async actualizarEstadoDonacion(
    id: string, 
    estado: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado',
    mpPaymentId?: string
  ): Promise<boolean> {
    await donacionesSupabaseService.actualizarEstadoDonacion(id, estado, mpPaymentId);
    return true;
  }

  private async actualizarPreferenciaDonacion(id: string, preferenceId: string): Promise<boolean> {
    await donacionesSupabaseService.actualizarPreferenciaDonacion(id, preferenceId);
    return true;
  }

  private async marcarAgradecimientoEnviadoDB(id: string): Promise<boolean> {
    await donacionesSupabaseService.marcarAgradecimientoEnviado(id);
    return true;
  }

  async crearDonacion(input: CrearDonacionInput): Promise<{
    donacion: Donacion;
    linkPago: string;
    preferenceId: string;
  }> {
    if (!input || typeof input.monto !== "number") {
      throw new Error("Monto de donación inválido");
    }

    const monto = Number(input.monto);
    if (!Number.isFinite(monto) || monto <= 0) {
      throw new Error("El monto debe ser mayor a 0");
    }

    if (monto > 1_000_000) {
      throw new Error("El monto no puede superar $1.000.000");
    }

    const id = uuidv4();
    const donacion = await this.crearDonacionDB({
      id,
      monto,
      estado: "pendiente",
      metodo_pago: "mercadopago",
      donante_email: input.donanteEmail,
      donante_nombre: input.donanteNombre,
      mensaje: input.mensaje,
    });

    const fallbackEmail = "donaciones@jjsecurevpn.com";
    const sanitizedEmail =
      (input.donanteEmail && this.validarEmail(input.donanteEmail)
        ? input.donanteEmail
        : fallbackEmail);
    const sanitizedNombre = input.donanteNombre?.trim() || "Donante";

    const { id: preferenceId, initPoint } =
      await this.mercadopago.crearPreferencia(
        donacion.id,
        `Donación voluntaria JJSecure VPN`,
        monto,
        sanitizedEmail,
        sanitizedNombre,
        "donacion"
      );

    await this.actualizarPreferenciaDonacion(donacion.id, preferenceId);

    const donacionActualizada = await this.obtenerDonacionPorId(donacion.id);
    return {
      donacion: donacionActualizada!,
      linkPago: initPoint,
      preferenceId,
    };
  }

  async obtenerDonacion(id: string): Promise<Donacion | null> {
    return await this.obtenerDonacionPorId(id);
  }

  async verificarYProcesarDonacion(id: string): Promise<Donacion | null> {
    const donacion = await this.obtenerDonacionPorId(id);
    if (!donacion) {
      return null;
    }

    if (donacion.estado === "aprobado") {
      // Asegurar que se haya enviado agradecimiento si estaba pendiente
      await this.enviarNotificacionesSiCorresponde(donacion);
      return donacion;
    }

    if (donacion.estado === "pendiente") {
      const pagoMP = await this.mercadopago.verificarPagoPorReferencia(id);
      if (pagoMP && pagoMP.status === "approved") {
        await this.confirmarDonacion(id, pagoMP.id);
        return await this.obtenerDonacionPorId(id);
      }
    }

    return donacion;
  }

  async procesarWebhook(body: any): Promise<void> {
    const resultado = await this.mercadopago.procesarWebhook(body);

    if (!resultado.procesado || !resultado.pagoId) {
      return;
    }

    const donacion = await this.obtenerDonacionPorId(resultado.pagoId);
    if (!donacion) {
      console.warn(
        `[Donaciones] Donación no encontrada para pago ${resultado.pagoId}`
      );
      return;
    }

    if (resultado.estado === "approved") {
      await this.confirmarDonacion(donacion.id, resultado.mpPaymentId);
    } else if (resultado.estado === "rejected" || resultado.estado === "cancelled") {
      await this.actualizarEstadoDonacion(donacion.id, "rechazado", resultado.mpPaymentId);
    }
  }

  private async confirmarDonacion(id: string, mpPaymentId?: string): Promise<void> {
    const donacion = await this.obtenerDonacionPorId(id);
    if (!donacion) {
      throw new Error("Donación no encontrada");
    }

    if (donacion.estado === "aprobado") {
      await this.enviarNotificacionesSiCorresponde(donacion);
      return;
    }

    await this.actualizarEstadoDonacion(id, "aprobado", mpPaymentId);
    const actualizada = await this.obtenerDonacionPorId(id);
    if (!actualizada) {
      return;
    }

    await this.enviarNotificacionesSiCorresponde(actualizada);
  }

  private async enviarNotificacionesSiCorresponde(donacion: Donacion): Promise<void> {
    if (donacion.estado !== "aprobado") {
      return;
    }

    if (donacion.agradecimiento_enviado) {
      return;
    }

    let notificado: boolean = !!donacion.agradecimiento_enviado;

    if (!notificado && donacion.donante_email) {
      try {
        const enviado = await emailService.enviarAgradecimientoDonacion(
          donacion.donante_email,
          {
            nombre: donacion.donante_nombre || "Donante",
            monto: donacion.monto,
            mensaje: donacion.mensaje || undefined,
          }
        );
        if (enviado) {
          notificado = true;
        }
      } catch (error: any) {
        console.error(
          `[Donaciones] Error enviando agradecimiento: ${error.message}`
        );
      }
    }

    // Siempre notificar al administrador
    try {
      await emailService.notificarDonacionAdmin({
        monto: donacion.monto,
        nombre: donacion.donante_nombre || "Donante",
        email: donacion.donante_email,
        mensaje: donacion.mensaje,
        donacionId: donacion.id,
      });
    } catch (error: any) {
      console.error(
        `[Donaciones] Error notificando donación al admin: ${error.message}`
      );
    }

    if (notificado) {
      await this.marcarAgradecimientoEnviadoDB(donacion.id);
    }
  }

  private validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}