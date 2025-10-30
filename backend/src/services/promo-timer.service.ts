import fs from "fs";
import { configService } from "./config.service";

/**
 * Servicio que gestiona la expiración automática de promociones
 * Verifica cada 5 minutos si las promos han expirado y las desactiva
 */
export class PromoTimerService {
  private configPath: string;
  private revendedoresConfigPath: string;
  private noticiasConfigPath: string;
  private intervaloVerificacion: NodeJS.Timeout | null = null;
  private intervaloMs: number = 5 * 60 * 1000; // 5 minutos

  constructor(configPath: string) {
    this.configPath = configPath;
    const base = require("path").join(process.cwd(), "public", "config");
    this.revendedoresConfigPath = require("path").join(
      base,
      "revendedores.config.json"
    );
    this.noticiasConfigPath = require("path").join(
      base,
      "noticias.config.json"
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
      if (!fs.existsSync(this.configPath)) {
        return;
      }

      const contenido = fs.readFileSync(this.configPath, "utf-8");
      const config: any = JSON.parse(contenido);

      // Si no hay promo config, salir
      if (!config.promo_config) {
        return;
      }

      const promoConfig = config.promo_config;

      // Si no está activa, salir
      if (!promoConfig.activa) {
        return;
      }

      // Si no tiene auto_desactivar, salir
      if (!promoConfig.auto_desactivar) {
        return;
      }

      // Calcular si ha expirado
      const activadaEn = new Date(promoConfig.activada_en);
      const duracionMs = (promoConfig.duracion_horas || 12) * 60 * 60 * 1000;
      const venceEn = new Date(activadaEn.getTime() + duracionMs);
      const ahora = new Date();

      if (ahora >= venceEn) {
        console.log(
          `[PromoTimerService] ⏰ Promoción expirada. Desactivando...`
        );
        console.log(
          `[PromoTimerService] 📊 Activada: ${activadaEn.toISOString()}`
        );
        console.log(`[PromoTimerService] 📊 Vencía: ${venceEn.toISOString()}`);
        console.log(`[PromoTimerService] 📊 Ahora: ${ahora.toISOString()}`);

        // Desactivar la promoción en el archivo principal
        promoConfig.activa = false;
        promoConfig.desactivada_en = ahora.toISOString();

        // Guardar cambios en el archivo principal
        fs.writeFileSync(
          this.configPath,
          JSON.stringify(config, null, 2),
          "utf-8"
        );
        console.log(
          "[PromoTimerService] ✅ Promoción desactivada en",
          this.configPath
        );

        // Además, intentar desactivar las promos/avisos relacionados en
        // revendedores.config.json y noticias.config.json para mantener
        // coherencia visual en la UI (hero/promocion y aviso global)
        try {
          // Revendedores: desactivar promo_config y el banner del hero si existe
          if (fs.existsSync(this.revendedoresConfigPath)) {
            const revContent = fs.readFileSync(
              this.revendedoresConfigPath,
              "utf-8"
            );
            const revConfig: any = JSON.parse(revContent);
            if (revConfig.promo_config && revConfig.promo_config.activa) {
              revConfig.promo_config.activa = false;
              revConfig.promo_config.desactivada_en = ahora.toISOString();
            }
            if (
              revConfig.hero &&
              revConfig.hero.promocion &&
              revConfig.hero.promocion.habilitada
            ) {
              revConfig.hero.promocion.habilitada = false;
            }
            fs.writeFileSync(
              this.revendedoresConfigPath,
              JSON.stringify(revConfig, null, 2),
              "utf-8"
            );
            console.log(
              "[PromoTimerService] ✅ Revendedores promo/hero desactivados en",
              this.revendedoresConfigPath
            );
          }
        } catch (err: any) {
          console.error(
            "[PromoTimerService] ❌ Error desactivando revendedores config:",
            err?.message || err
          );
        }

        try {
          // Noticias: desactivar el aviso global si está activo
          if (fs.existsSync(this.noticiasConfigPath)) {
            const notContent = fs.readFileSync(
              this.noticiasConfigPath,
              "utf-8"
            );
            const notConfig: any = JSON.parse(notContent);
            if (notConfig.aviso && notConfig.aviso.habilitado) {
              notConfig.aviso.habilitado = false;
            }
            fs.writeFileSync(
              this.noticiasConfigPath,
              JSON.stringify(notConfig, null, 2),
              "utf-8"
            );
            console.log(
              "[PromoTimerService] ✅ Aviso de noticias desactivado en",
              this.noticiasConfigPath
            );
          }
        } catch (err: any) {
          console.error(
            "[PromoTimerService] ❌ Error desactivando noticias config:",
            err?.message || err
          );
        }

        // Invalidar caché en ConfigService para que los cambios se reflejen de inmediato
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
      } else {
        // Calcular tiempo restante
        const diferencia = venceEn.getTime() - ahora.getTime();
        const horasRestantes = Math.floor(diferencia / (60 * 60 * 1000));
        const minutosRestantes = Math.floor(
          (diferencia % (60 * 60 * 1000)) / (60 * 1000)
        );

        console.log(
          `[PromoTimerService] ⏳ Promoción activa. Vence en: ${horasRestantes}h ${minutosRestantes}m`
        );
      }
    } catch (error: any) {
      console.error(
        "[PromoTimerService] ❌ Error verificando promos:",
        error.message
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
