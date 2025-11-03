import express, { Request, Response } from "express";
import { configService } from "../services/config.service";
import { preciosSyncService } from "../services/precios-sync.service";

const router = express.Router();

/**
 * POST /api/config/activar-promo
 * Activa la promoción por una duración configurable
 * Body: { duracion_horas: number }
 */
router.post("/activar-promo", async (req: Request, res: Response) => {
  try {
    const { duracion_horas } = req.body;

    if (!duracion_horas || duracion_horas <= 0) {
      return res.status(400).json({
        error: "duracion_horas debe ser un número mayor a 0",
      });
    }

    // Leer configs actual
    const configPlanes = configService.leerConfigPlanes();
    const configRevendedores = configService.leerConfigRevendedores();

    // Actualizar promo_config en PLANES
    const now = new Date().toISOString();
    if (!configPlanes.promo_config) {
      configPlanes.promo_config = {
        activa: false,
        activada_en: null,
        duracion_horas: 12,
        auto_desactivar: true,
      };
    }
    configPlanes.promo_config.activa = true;
    configPlanes.promo_config.activada_en = now;
    configPlanes.promo_config.duracion_horas = duracion_horas;
    configPlanes.promo_config.auto_desactivar = true;
    configPlanes.ultima_actualizacion = now;

    // Habilitar el banner del hero en PLANES si existe la configuración
    if (configPlanes.hero && configPlanes.hero.promocion) {
      configPlanes.hero.promocion.habilitada = true;
    }

    // Actualizar promo_config en REVENDEDORES
    if (!configRevendedores.promo_config) {
      configRevendedores.promo_config = {
        activa: false,
        activada_en: null,
        duracion_horas: 12,
        auto_desactivar: true,
      };
    }
    configRevendedores.promo_config.activa = true;
    configRevendedores.promo_config.activada_en = now;
    configRevendedores.promo_config.duracion_horas = duracion_horas;
    configRevendedores.promo_config.auto_desactivar = true;
    configRevendedores.ultima_actualizacion = now;

    // Habilitar el banner del hero en REVENDEDORES si existe la configuración
    if (configRevendedores.hero && configRevendedores.hero.promocion) {
      configRevendedores.hero.promocion.habilitada = true;
    }

    // Guardar cambios en ambos archivos
    console.log("[CONFIG-ROUTE] 💾 Guardando config de planes...");
    configService.guardarConfigPlanes(configPlanes);
    console.log("[CONFIG-ROUTE] ✅ Config de planes guardada");

    console.log("[CONFIG-ROUTE] 💾 Guardando config de revendedores...");
    configService.guardarConfigRevendedores(configRevendedores);
    console.log("[CONFIG-ROUTE] ✅ Config de revendedores guardada");

    // Limpiar ambos cachés para que cambios se apliquen inmediatamente
    configService.limpiarCache();
    console.log("[CONFIG-ROUTE] 🔄 Caché limpiado");

    return res.status(200).json({
      success: true,
      mensaje: `Promoción activada por ${duracion_horas} hora(s) en PLANES y REVENDEDORES`,
      promo_config: configPlanes.promo_config,
      timestamp: now,
    });
  } catch (error) {
    console.error("Error activando promo:", error);
    return res.status(500).json({
      error: "Error al activar la promoción",
      detalles: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/config/desactivar-promo
 * Desactiva la promoción inmediatamente
 */
router.post("/desactivar-promo", (_req: Request, res: Response) => {
  try {
    const config = configService.leerConfigPlanes();

    if (!config.promo_config) {
      config.promo_config = {
        activa: false,
        activada_en: null,
        duracion_horas: 12,
        auto_desactivar: true,
      };
    }
    config.promo_config.activa = false;
    config.promo_config.activada_en = null;
    config.ultima_actualizacion = new Date().toISOString();

    // Desactivar el banner del hero si existe
    if (config.hero && config.hero.promocion) {
      config.hero.promocion.habilitada = false;
    }

    configService.guardarConfigPlanes(config);
    configService.limpiarCache();

    return res.status(200).json({
      success: true,
      mensaje: "Promoción desactivada",
      timestamp: config.ultima_actualizacion,
    });
  } catch (error) {
    console.error("Error desactivando promo:", error);
    return res.status(500).json({
      error: "Error al desactivar la promoción",
      detalles: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/config/sync-precios
 * Sincroniza los precios en la base de datos con `precios_normales` del config
 * (útil para restaurar precios después de una promoción que haya modificado la BD)
 */
router.post("/sync-precios", (_req: Request, res: Response) => {
  try {
    const result = preciosSyncService.sincronizarPreciosDesdeConfig();

    // Limpiar caché para que la app lea los nuevos valores
    configService.limpiarCache();

    return res.status(200).json({
      success: true,
      message: "Precios sincronizados desde config",
      data: result,
    });
  } catch (error: any) {
    console.error("Error sincronizando precios:", error);
    return res.status(500).json({
      success: false,
      error: "Error sincronizando precios",
      detalles: error.message || String(error),
    });
  }
});

/**
 * POST /api/config/sync-precios-revendedores
 * Sincroniza los precios de revendedores en la base de datos con `precios_normales` del config
 */
router.post("/sync-precios-revendedores", (req: Request, res: Response) => {
  try {
    const force = req.query.force === "true" || req.body.force === true;
    const result =
      preciosSyncService.sincronizarPreciosRevendedoresDesdeConfig(force);

    // Limpiar caché para que la app lea los nuevos valores
    configService.limpiarCache();

    return res.status(200).json({
      success: true,
      message: "Precios de revendedores sincronizados desde config",
      data: result,
    });
  } catch (error: any) {
    console.error("Error sincronizando precios revendedores:", error);
    return res.status(500).json({
      success: false,
      error: "Error sincronizando precios de revendedores",
      detalles: error.message || String(error),
    });
  }
});

/**
 * POST /api/config/sync-todo
 * Limpia caché, sincroniza todos los precios (planes + revendedores) Y refresca BD del VPS
 * Útil después de modificar manualmente los archivos JSON - hace todo automáticamente
 */
router.post("/sync-todo", async (_req: Request, res: Response) => {
  try {
    console.log("[CONFIG-ROUTE] 🔄 Iniciando sincronización completa + refresco BD VPS...");

    // Función helper para ejecutar comandos
    const execCommand = (command: string, description: string) => {
      return new Promise<{ success: boolean; output?: string; error?: string }>((resolve) => {
        const { exec } = require('child_process');
        exec(command, { cwd: process.cwd() }, (error: any, stdout: string) => {
          if (error) {
            console.error(`[SYNC-TODO] ❌ Error en ${description}:`, error.message);
            resolve({ success: false, error: error.message });
          } else {
            console.log(`[SYNC-TODO] ✅ ${description} completado`);
            resolve({ success: true, output: stdout });
          }
        });
      });
    };

    const results: any = {
      cache: null,
      planes: null,
      revendedores: null,
      vps_db_refresh: null
    };

    // 1. Limpiar caché
    configService.limpiarCache();
    results.cache = "limpiado";
    console.log("[SYNC-TODO] ✅ Caché limpiado");

    // 2. Sincronizar precios de planes
    const resultPlanes = preciosSyncService.sincronizarPreciosDesdeConfig();
    results.planes = resultPlanes;
    console.log(`[SYNC-TODO] ✅ Precios de planes sincronizados: ${resultPlanes.updated} actualizados`);

    // 3. Sincronizar precios de revendedores
    const resultRevendedores = preciosSyncService.sincronizarPreciosRevendedoresDesdeConfig();
    results.revendedores = resultRevendedores;
    console.log(`[SYNC-TODO] ✅ Precios de revendedores sincronizados: ${resultRevendedores.updated} actualizados`);

    // 4. Refrescar base de datos del VPS (corregir valores max_users)
    console.log("[SYNC-TODO] 🔄 Refrescando base de datos del VPS...");
    const vpsRefreshCommand = `
      sqlite3 secureshop.db "
        UPDATE planes_revendedores SET max_users = 5 WHERE id = 1;
        UPDATE planes_revendedores SET max_users = 10 WHERE id = 2;
        UPDATE planes_revendedores SET max_users = 20 WHERE id = 3;
        UPDATE planes_revendedores SET max_users = 30 WHERE id = 4;
        UPDATE planes_revendedores SET max_users = 40 WHERE id = 5;
        UPDATE planes_revendedores SET max_users = 50 WHERE id = 6;
        UPDATE planes_revendedores SET max_users = 60 WHERE id = 7;
        UPDATE planes_revendedores SET max_users = 80 WHERE id = 8;
        UPDATE planes_revendedores SET max_users = 100 WHERE id = 9;
        UPDATE planes_revendedores SET max_users = 150 WHERE id = 10;
        UPDATE planes_revendedores SET max_users = 200 WHERE id = 11;
        SELECT 'Planes corregidos en VPS' as status;
      "
    `;

    results.vps_db_refresh = await execCommand(
      `ssh -t root@149.50.148.6 "cd /home/secureshop/secureshop-vpn/backend/database && ${vpsRefreshCommand}"`,
      "refresco BD VPS"
    );

    if (!results.vps_db_refresh.success) {
      console.warn("[SYNC-TODO] ⚠️ No se pudo refrescar BD del VPS, pero sincronización local completada");
    } else {
      console.log("[SYNC-TODO] ✅ Base de datos del VPS refrescada");
    }

    console.log("[SYNC-TODO] 🎉 ¡Sincronización completa + refresco BD exitoso!");

    return res.status(200).json({
      success: true,
      message: "Sincronización completa + refresco BD realizado exitosamente",
      data: {
        cache: results.cache,
        planes: results.planes,
        revendedores: results.revendedores,
        vps_db_refresh: results.vps_db_refresh.success ? "completado" : "fallido",
        timestamp: new Date().toISOString()
      },
    });
  } catch (error: any) {
    console.error("[SYNC-TODO] ❌ Error en sincronización completa:", error);
    return res.status(500).json({
      success: false,
      error: "Error en sincronización completa + refresco BD",
      detalles: error.message || String(error),
    });
  }
});

/**
 * GET /api/config/promo-status
 */
router.get("/promo-status", (_req: Request, res: Response) => {
  try {
    const config = configService.leerConfigPlanes();

    return res.status(200).json({
      promo_config: config.promo_config || {
        activa: false,
        activada_en: null,
        duracion_horas: 0,
        auto_desactivar: true,
      },
    });
  } catch (error) {
    console.error("Error obteniendo status promo:", error);
    return res.status(500).json({
      error: "Error al obtener estado de la promoción",
      detalles: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/config/test
 * Ruta de prueba
 */
router.get("/test", (_req: Request, res: Response) => {
  return res.status(200).json({
    message: "Test route working",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/config/promo-status-revendedores
 * Obtiene el estado actual de la promoción para revendedores y tiempo restante
 */
router.get("/promo-status-revendedores", (_req: Request, res: Response) => {
  try {
    const config = configService.leerConfigRevendedores();

    return res.status(200).json({
      promo_config: config.promo_config || {
        activa: false,
        activada_en: null,
        duracion_horas: 0,
        auto_desactivar: true,
      },
    });
  } catch (error) {
    console.error("Error obteniendo status promo revendedores:", error);
    return res.status(500).json({
      error: "Error al obtener estado de la promoción para revendedores",
      detalles: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/config/hero
 * Obtiene la configuración del hero para la página principal
 */
router.get("/hero", (_req: Request, res: Response) => {
  try {
    const config = configService.leerConfigPlanes();

    return res.json({
      success: true,
      data: {
        titulo: config.hero?.titulo || "Conecta sin Límites",
        descripcion:
          config.hero?.descripcion ||
          "Planes flexibles y velocidad premium para tu estilo de vida digital",
        promocion: config.hero?.promocion || {
          habilitada: false,
          texto: "",
          textColor: "text-white",
          bgColor: "bg-gradient-to-r from-blue-600 to-cyan-600",
          borderColor: "border-blue-500/40",
          iconColor: "text-blue-400",
          shadowColor: "shadow-blue-500/30",
          comentario: "Configuración por defecto",
        },
      },
    });
  } catch (error) {
    console.error("Error obteniendo config hero:", error);
    return res.status(500).json({
      success: false,
      error: "Error al obtener configuración del hero",
      detalles: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/config/hero-revendedores
 * Obtiene la configuración del hero para revendedores
 */
router.get("/hero-revendedores", (_req: Request, res: Response) => {
  try {
    const config = configService.leerConfigRevendedores();

    return res.status(200).json({
      titulo: config.hero?.titulo || "Sé Revendedor VPN",
      descripcion:
        config.hero?.descripcion ||
        "Gana dinero vendiendo acceso VPN premium a tus clientes",
      promocion: config.hero?.promocion || {
        habilitada: false,
        texto: "",
        estilo: "from-blue-500 to-cyan-500",
        textColor: "text-white",
        bgColor: "bg-gradient-to-r from-blue-600 to-cyan-600",
        comentario:
          "Descuento del 20% en todos los planes - Válido por tiempo limitado",
      },
    });
  } catch (error) {
    console.error("Error obteniendo config hero revendedores:", error);
    return res.status(500).json({
      error: "Error al obtener configuración del hero para revendedores",
      detalles: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/config/noticias
 * Obtiene la configuración de noticias
 */
router.get("/noticias", (_req: Request, res: Response) => {
  try {
    const config = configService.obtenerNoticiasActivas();

    return res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Error obteniendo noticias:", error);
    return res.status(500).json({
      success: false,
      error: "Error al obtener noticias",
      detalles: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/config/noticias
 * Actualiza la configuración de noticias
 */
router.post("/noticias", (req: Request, res: Response) => {
  try {
    const config = req.body;

    if (!config || typeof config !== "object") {
      return res.status(400).json({
        success: false,
        error: "Configuración de noticias inválida",
      });
    }

    config.ultima_actualizacion = new Date().toISOString();
    configService.guardarConfigNoticias(config);
    configService.limpiarCache();

    return res.status(200).json({
      success: true,
      mensaje: "Configuración de noticias actualizada",
      timestamp: config.ultima_actualizacion,
    });
  } catch (error) {
    console.error("Error actualizando noticias:", error);
    return res.status(500).json({
      success: false,
      error: "Error al actualizar noticias",
      detalles: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/config/mercadopago
 * Obtiene la configuración pública de MercadoPago (solo publicKey)
 */
router.get("/mercadopago", (_req: Request, res: Response) => {
  try {
    const { config: appConfig } = require("../config");

    return res.status(200).json({
      success: true,
      publicKey: appConfig.mercadopago.publicKey,
    });
  } catch (error) {
    console.error("Error obteniendo config MercadoPago:", error);
    return res.status(500).json({
      success: false,
      error: "Error al obtener configuración de MercadoPago",
      detalles: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
