import fs from "fs";
import { configService } from "./config.service";

/**
 * Servicio que gestiona la expiración automática de promociones
 * Verifica cada 5 minutos si las promos han expirado y las desactiva
 */
export class PromoTimerService {
  private configPath: string;
  private revendedoresConfigPath: string;
  private intervaloVerificacion: NodeJS.Timeout | null = null;
  private intervaloMs: number = 5 * 60 * 1000; // 5 minutos

  constructor(configPath: string) {
    this.configPath = configPath;
    const base = require("path").join(process.cwd(), "public", "config");
    this.revendedoresConfigPath = require("path").join(
      base,
      "revendedores.config.json"
    );
  }

  /**
   * Inicia el servicio de verificación automática
   */
  iniciar(): void {
    console.log(
      "[PromoTimerService] ⏱️ Iniciando servicio de verificación de promociones..."
    );

    // Verificar inmediatamente al iniciar
    this.verificarPromos();

    // Luego verificar cada 5 minutos
    this.intervaloVerificacion = setInterval(() => {
      this.verificarPromos();
    }, this.intervaloMs);

    console.log(
      "[PromoTimerService] ✅ Servicio iniciado (verifica cada 5 minutos)"
    );
  }

  /**
   * Detiene el servicio
   */
  detener(): void {
    if (this.intervaloVerificacion) {
      clearInterval(this.intervaloVerificacion);
      this.intervaloVerificacion = null;
      console.log("[PromoTimerService] ⏹️ Servicio detenido");
    }
  }

  /**
   * Verifica si las promociones han expirado
   */
  private verificarPromos(): void {
    try {
      // Chequear ambos archivos de config de forma independiente
      // (planes y revendedores pueden tener promos activas al mismo tiempo)
      this.verificarPromoEnArchivo(this.configPath, "planes");
      this.verificarPromoEnArchivo(this.revendedoresConfigPath, "revendedores");
    } catch (error: any) {
      console.error(
        "[PromoTimerService] ❌ Error verificando promos:",
        error.message
      );
    }
  }

  private verificarPromoEnArchivo(
    filePath: string,
    tipo: "planes" | "revendedores"
  ): void {
    if (!fs.existsSync(filePath)) {
      return;
    }

    const contenido = fs.readFileSync(filePath, "utf-8");
    const config: any = JSON.parse(contenido);

    if (!config.promo_config) {
      return;
    }

    const promoConfig = config.promo_config;

    if (!promoConfig.activa) {
      return;
    }

    if (!promoConfig.auto_desactivar) {
      return;
    }

    const activadaEn = new Date(promoConfig.activada_en);
    const duracionMs = (promoConfig.duracion_horas || 12) * 60 * 60 * 1000;
    const venceEn = new Date(activadaEn.getTime() + duracionMs);
    const ahora = new Date();

    if (ahora < venceEn) {
      const diferencia = venceEn.getTime() - ahora.getTime();
      const horasRestantes = Math.floor(diferencia / (60 * 60 * 1000));
      const minutosRestantes = Math.floor(
        (diferencia % (60 * 60 * 1000)) / (60 * 1000)
      );
      console.log(
        `[PromoTimerService] ⏳ Promoción (${tipo}) activa. Vence en: ${horasRestantes}h ${minutosRestantes}m`
      );
      return;
    }

    console.log(
      `[PromoTimerService] ⏰ Promoción (${tipo}) expirada. Desactivando...`
    );
    console.log(`[PromoTimerService] 📊 Activada: ${activadaEn.toISOString()}`);
    console.log(`[PromoTimerService] 📊 Vencía: ${venceEn.toISOString()}`);
    console.log(`[PromoTimerService] 📊 Ahora: ${ahora.toISOString()}`);

    promoConfig.activa = false;
    promoConfig.activada_en = null;
    promoConfig.desactivada_en = ahora.toISOString();
    config.ultima_actualizacion = ahora.toISOString();

    if (config.hero && config.hero.promocion && config.hero.promocion.habilitada) {
      config.hero.promocion.habilitada = false;
      console.log(
        `[PromoTimerService] ✅ Hero promoción desactivada en ${tipo}.config.json`
      );
    }

    fs.writeFileSync(filePath, JSON.stringify(config, null, 2), "utf-8");
    console.log("[PromoTimerService] ✅ Promoción desactivada en", filePath);

    try {
      configService.limpiarCache();
      console.log(
        "[PromoTimerService] 🔄 Caché de configuración invalidado en ConfigService"
      );
    } catch (err: any) {
      console.error(
        "[PromoTimerService] ❌ Error invalidando caché:",
        err?.message || err
      );
    }
  }

  /**
   * Obtiene el tiempo restante de la promoción actual (en ms)
   */
  obtenerTiempoRestante(): number | null {
    try {
      if (!fs.existsSync(this.configPath)) {
        return null;
      }

      const contenido = fs.readFileSync(this.configPath, "utf-8");
      const config: any = JSON.parse(contenido);

      if (!config.promo_config || !config.promo_config.activa) {
        return null;
      }

      const promoConfig = config.promo_config;
      const activadaEn = new Date(promoConfig.activada_en);
      const duracionMs = (promoConfig.duracion_horas || 12) * 60 * 60 * 1000;
      const venceEn = new Date(activadaEn.getTime() + duracionMs);
      const ahora = new Date();

      const tiempoRestante = venceEn.getTime() - ahora.getTime();

      if (tiempoRestante > 0) {
        return tiempoRestante;
      }

      return null;
    } catch (error: any) {
      console.error(
        "[PromoTimerService] ❌ Error calculando tiempo restante:",
        error.message
      );
      return null;
    }
  }

  /**
   * Obtiene info de la promoción actual
   */
  obtenerInfoPromo(): {
    activa: boolean;
    tiempoRestante?: string;
    activadaEn?: string;
    duracionHoras?: number;
  } | null {
    try {
      if (!fs.existsSync(this.configPath)) {
        return null;
      }

      const contenido = fs.readFileSync(this.configPath, "utf-8");
      const config: any = JSON.parse(contenido);

      if (!config.promo_config) {
        return null;
      }

      const promoConfig = config.promo_config;
      const tiempoRestante = this.obtenerTiempoRestante();

      if (tiempoRestante === null) {
        return {
          activa: false,
        };
      }

      const horas = Math.floor(tiempoRestante / (60 * 60 * 1000));
      const minutos = Math.floor(
        (tiempoRestante % (60 * 60 * 1000)) / (60 * 1000)
      );
      const segundos = Math.floor((tiempoRestante % (60 * 1000)) / 1000);

      return {
        activa: true,
        tiempoRestante: `${horas}h ${minutos}m ${segundos}s`,
        activadaEn: promoConfig.activada_en,
        duracionHoras: promoConfig.duracion_horas,
      };
    } catch (error: any) {
      console.error(
        "[PromoTimerService] ❌ Error obteniendo info promo:",
        error.message
      );
      return null;
    }
  }
}

export const promoTimerService = new PromoTimerService(
  require("path").join(process.cwd(), "public", "config", "planes.config.json")
);
