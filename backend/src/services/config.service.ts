import fs from "fs";
import path from "path";
import { Plan } from "../types";

interface PlanOverride {
  precio?: number;
  descripcion?: string;
  activo?: boolean;
  dias?: number;
  connection_limit?: number;
}

interface PromoConfig {
  activa: boolean;
  activada_en: string | null;
  duracion_horas: number;
  auto_desactivar: boolean;
}

interface ConfigPlanes {
  enabled?: boolean;
  version?: string;
  ultima_actualizacion?: string;
  moneda?: string;
  notas?: string;
  hero?: {
    titulo?: string;
    descripcion?: string;
    promocion?: {
      habilitada?: boolean;
      texto?: string;
      estilo?: string;
      textColor?: string;
      bgColor?: string;
      comentario?: string;
    };
  };
  planes_disponibles?: {
    [planId: string]: string;
  };
  precios_normales?: {
    [planId: string]: number;
  };
  overrides?: {
    [planId: string]: PlanOverride;
  };
  promo_config?: PromoConfig;
}

export class ConfigService {
  private configPath: string;
  private revendedoresConfigPath: string;
  private noticiasConfigPath: string;
  private cache: ConfigPlanes | null = null;
  private cacheTime: number = 0;
  private cacheExpire: number = 60000; // 60 segundos
  private revendedoresCache: any | null = null;
  private revendedoresCacheTime: number = 0;
  private noticiasCache: any | null = null;
  private noticiasCacheTime: number = 0;

  constructor() {
    // Buscar config.json de planes en diferentes ubicaciones posibles
    const posiblesPaths = [
      path.join(process.cwd(), "public", "config", "planes.config.json"),
      path.join(process.cwd(), "config", "planes.config.json"),
      path.join(process.cwd(), "planes.config.json"),
      path.join(__dirname, "..", "..", "config", "planes.config.json"),
      path.join(
        __dirname,
        "..",
        "..",
        "public",
        "config",
        "planes.config.json"
      ),
    ];

    this.configPath = posiblesPaths[0];

    // Buscar revendedores.config.json
    const posiblesRevendedoresPaths = [
      path.join(process.cwd(), "public", "config", "revendedores.config.json"),
      path.join(process.cwd(), "config", "revendedores.config.json"),
      path.join(process.cwd(), "revendedores.config.json"),
      path.join(__dirname, "..", "..", "config", "revendedores.config.json"),
      path.join(
        __dirname,
        "..",
        "..",
        "public",
        "config",
        "revendedores.config.json"
      ),
    ];

    this.revendedoresConfigPath = posiblesRevendedoresPaths[0];

    // Buscar noticias.config.json
    const posiblesNoticiasPaths = [
      path.join(process.cwd(), "public", "config", "noticias.config.json"),
      path.join(process.cwd(), "config", "noticias.config.json"),
      path.join(process.cwd(), "noticias.config.json"),
      path.join(__dirname, "..", "..", "config", "noticias.config.json"),
      path.join(
        __dirname,
        "..",
        "..",
        "public",
        "config",
        "noticias.config.json"
      ),
    ];

    this.noticiasConfigPath = posiblesNoticiasPaths[0];

    console.log("[ConfigService] 🔍 Buscando configuración de planes...");
    for (const p of posiblesPaths) {
      if (fs.existsSync(p)) {
        this.configPath = p;
        console.log(
          "[ConfigService] ✅ Configuración de planes encontrada en:",
          p
        );
        break;
      }
    }

    if (!fs.existsSync(this.configPath)) {
      console.log("[ConfigService] ⚠️ No se encontró planes.config.json");
      console.log("[ConfigService] 📁 Se espera en:", this.configPath);
    }

    console.log("[ConfigService] 🔍 Buscando configuración de revendedores...");
    for (const p of posiblesRevendedoresPaths) {
      if (fs.existsSync(p)) {
        this.revendedoresConfigPath = p;
        console.log(
          "[ConfigService] ✅ Configuración de revendedores encontrada en:",
          p
        );
        break;
      }
    }

    if (!fs.existsSync(this.revendedoresConfigPath)) {
      console.log(
        "[ConfigService] ℹ️ No se encontró revendedores.config.json (opcional)"
      );
    }

    console.log("[ConfigService] 🔍 Buscando configuración de noticias...");
    for (const p of posiblesNoticiasPaths) {
      if (fs.existsSync(p)) {
        this.noticiasConfigPath = p;
        console.log(
          "[ConfigService] ✅ Configuración de noticias encontrada en:",
          p
        );
        break;
      }
    }

    if (!fs.existsSync(this.noticiasConfigPath)) {
      console.log(
        "[ConfigService] ℹ️ No se encontró noticias.config.json (opcional)"
      );
    }
  }

  /**
   * Lee la configuración del archivo JSON (con caché)
   */
  private leerConfig(): ConfigPlanes {
    const ahora = Date.now();

    // Si el caché no ha expirado, devolverlo
    if (this.cache && ahora - this.cacheTime < this.cacheExpire) {
      return this.cache;
    }

    try {
      if (!fs.existsSync(this.configPath)) {
        console.log(
          "[ConfigService] ℹ️ Archivo de config no existe, usando valores por defecto"
        );
        return { enabled: false };
      }

      const contenido = fs.readFileSync(this.configPath, "utf-8");
      const config: ConfigPlanes = JSON.parse(contenido);

      // Actualizar caché
      this.cache = config;
      this.cacheTime = ahora;

      return config;
    } catch (error: any) {
      console.error("[ConfigService] ❌ Error leyendo config:", error.message);
      return { enabled: false };
    }
  }

  /**
   * Aplica overrides de configuración a un plan
   * Los overrides solo se aplican si la promoción está activa
   */
  aceptarOverridesAlPlan(plan: Plan): Plan {
    const config = this.leerConfig();

    if (!config.enabled) {
      return plan;
    }

    // Verificar si la promoción está activa
    if (!config.promo_config?.activa) {
      // Si la promo no está activa, usar precios normales
      if (config.precios_normales) {
        const precioNormal = config.precios_normales[plan.id.toString()];
        if (precioNormal !== undefined) {
          return { ...plan, precio: precioNormal };
        }
      }
      return plan;
    }

    // La promo está activa, intentar aplicar overrides
    const override = config.overrides?.[plan.id.toString()];
    if (!override) {
      return plan;
    }

    console.log(
      `[ConfigService] 🔄 Aplicando override al plan ${plan.id}:`,
      override
    );

    // Aplicar overrides
    return {
      ...plan,
      precio: override.precio !== undefined ? override.precio : plan.precio,
      descripcion:
        override.descripcion !== undefined
          ? override.descripcion
          : plan.descripcion,
      activo: override.activo !== undefined ? override.activo : plan.activo,
      dias: override.dias !== undefined ? override.dias : plan.dias,
      connection_limit:
        override.connection_limit !== undefined
          ? override.connection_limit
          : plan.connection_limit,
    };
  }

  /**
   * Aplica overrides a una lista de planes
   */
  aceptarOverridesAListaPlanes(planes: Plan[]): Plan[] {
    // Limpiar caché para forzar lectura del archivo actualizado
    this.cache = null;
    this.cacheTime = 0;

    const config = this.leerConfigPlanes();

    if (!config.enabled) {
      console.log("[DEBUG] Config not enabled, returning original planes");
      return planes;
    }

    // Verificar si la promoción está activa
    if (!config.promo_config?.activa) {
      console.log("[DEBUG] Promo not active, using normal prices");
      // Si la promo no está activa, usar precios normales si existen
      if (config.precios_normales) {
        return planes.map((plan) => {
          const precioNormal = config.precios_normales![plan.id.toString()];
          if (precioNormal !== undefined) {
            return { ...plan, precio: precioNormal };
          }
          return plan;
        });
      }
      return planes;
    }

    // La promo está activa, aplicar overrides
    return planes.map((plan) => {
      const override = config.overrides?.[plan.id.toString()];
      if (!override) {
        return plan;
      }

      // Aplicar overrides
      const planActualizado = { ...plan };
      if (override.precio !== undefined) {
        planActualizado.precio = override.precio;
      }
      if (override.descripcion !== undefined) {
        planActualizado.descripcion = override.descripcion;
      }
      if (override.activo !== undefined) {
        planActualizado.activo = override.activo;
      }
      if (override.dias !== undefined) {
        planActualizado.dias = override.dias;
      }
      if (override.connection_limit !== undefined) {
        planActualizado.connection_limit = override.connection_limit;
      }

      return planActualizado;
    });
  }

  /**
   * Obtiene información de la configuración (para debugging)
   */
  obtenerInfoConfig(): {
    habilitada: boolean;
    archivo: string;
    existe: boolean;
    version?: string;
    ultimaActualizacion?: string;
    planesConOverride: number;
  } {
    const config = this.leerConfig();

    return {
      habilitada: config.enabled ?? false,
      archivo: this.configPath,
      existe: fs.existsSync(this.configPath),
      version: config.version,
      ultimaActualizacion: config.ultima_actualizacion,
      planesConOverride: Object.keys(config.overrides || {}).length,
    };
  }

  /**
   * Limpia el caché (útil después de actualizar el archivo)
   */
  limpiarCache(): void {
    this.cache = null;
    this.cacheTime = 0;
    this.revendedoresCache = null;
    this.revendedoresCacheTime = 0;
    console.log("[ConfigService] 🔄 Caché limpiado (planes y revendedores)");
  }

  /**
   * Crea un archivo de configuración por defecto
   */
  crearConfigPorDefecto(): void {
    const directorio = path.dirname(this.configPath);

    // Crear directorio si no existe
    if (!fs.existsSync(directorio)) {
      fs.mkdirSync(directorio, { recursive: true });
      console.log("[ConfigService] 📁 Directorio creado:", directorio);
    }

    const configDefault: ConfigPlanes = {
      enabled: false,
      version: "1.0.0",
      ultima_actualizacion: new Date().toISOString(),
      overrides: {
        // Ejemplo - cambiar precio del plan ID 1 a $4.99
        // "1": { "precio": 4.99 },
        // Ejemplo - cambiar múltiples parámetros del plan ID 2
        // "2": { "precio": 8.99, "descripcion": "Plan Premium Actualizado" },
      },
    };

    try {
      fs.writeFileSync(
        this.configPath,
        JSON.stringify(configDefault, null, 2),
        "utf-8"
      );
      console.log(
        "[ConfigService] ✅ Configuración por defecto creada en:",
        this.configPath
      );
    } catch (error: any) {
      console.error("[ConfigService] ❌ Error creando config:", error.message);
    }
  }
  /**
   * Obtiene la configuración del hero (promociones, título, etc)
   */
  obtenerConfigHero(): any {
    const config = this.leerConfig();

    return {
      titulo: config.hero?.titulo || "Conecta sin Límites",
      descripcion:
        config.hero?.descripcion ||
        "Planes flexibles y velocidad premium para tu estilo de vida digital",
      promocion: config.hero?.promocion || {
        habilitada: false,
        texto: "",
        estilo: "from-red-500 to-pink-500",
        textColor: "text-white",
        bgColor: "bg-gradient-to-r from-red-600 to-pink-600",
      },
    };
  }

  /**
   * Lee la configuración de revendedores del archivo JSON (con caché)
   */
  /**
   * Lee la configuración de revendedores (con caché)
   * Ahora es público para permitir acceso desde rutas
   */
  leerConfigRevendedores(): any {
    const ahora = Date.now();

    // Si el caché no ha expirado, devolverlo
    if (
      this.revendedoresCache &&
      ahora - this.revendedoresCacheTime < this.cacheExpire
    ) {
      return this.revendedoresCache;
    }

    try {
      if (!fs.existsSync(this.revendedoresConfigPath)) {
        console.log(
          "[ConfigService] ℹ️ Archivo de config revendedores no existe"
        );
        return { enabled: false };
      }

      const contenido = fs.readFileSync(this.revendedoresConfigPath, "utf-8");
      const config: any = JSON.parse(contenido);

      // Actualizar caché
      this.revendedoresCache = config;
      this.revendedoresCacheTime = ahora;

      return config;
    } catch (error: any) {
      console.error(
        "[ConfigService] ❌ Error leyendo config revendedores:",
        error.message
      );
      return { enabled: false };
    }
  }

  /**
   * Guarda la configuración de revendedores en disco
   */
  guardarConfigRevendedores(config: any): void {
    try {
      const contenido = JSON.stringify(config, null, 2);
      fs.writeFileSync(this.revendedoresConfigPath, contenido, "utf-8");
      console.log(
        "[ConfigService] ✅ Config revendedores guardada en:",
        this.revendedoresConfigPath
      );

      // Invalidar caché para que se relean los datos
      this.revendedoresCache = null;
      this.revendedoresCacheTime = 0;
    } catch (error: any) {
      console.error(
        "[ConfigService] ❌ Error guardando config revendedores:",
        error.message
      );
      throw error;
    }
  }

  /**
   * Aplica overrides de configuración a un plan de revendedor
   * Los overrides solo se aplican si la promoción está activa
   */
  aceptarOverridesAlPlanRevendedor(plan: any): any {
    const config = this.leerConfigRevendedores();

    if (!config.enabled) {
      return plan;
    }

    // Verificar si la promoción está activa
    if (!config.promo_config?.activa) {
      // Si la promo no está activa, usar precios normales
      if (config.precios_normales) {
        const precioNormal = config.precios_normales[plan.id.toString()];
        if (precioNormal !== undefined) {
          return { ...plan, precio: precioNormal };
        }
      }
      return plan;
    }

    // La promo está activa, intentar aplicar overrides
    const override = config.overrides?.[plan.id.toString()];
    if (!override) {
      return plan;
    }

    // Aplicar overrides
    const planActualizado = { ...plan };
    if (override.precio !== undefined) {
      planActualizado.precio = override.precio;
    }
    if (override.descripcion !== undefined) {
      planActualizado.descripcion = override.descripcion;
    }
    if (override.activo !== undefined) {
      planActualizado.activo = override.activo;
    }

    return planActualizado;
  }

  /**
   * Aplica overrides a una lista de planes de revendedor
   */
  aceptarOverridesAListaPlanesRevendedor(planes: any[]): any[] {
    const config = this.leerConfigRevendedores();

    if (!config.enabled) {
      return planes;
    }

    return planes.map((plan) => this.aceptarOverridesAlPlanRevendedor(plan));
  }

  /**
   * Obtiene la configuración del hero para revendedores
   */
  obtenerConfigHeroRevendedores(): any {
    const config = this.leerConfigRevendedores();

    return {
      titulo: config.hero?.titulo || "Sé Revendedor VPN",
      descripcion:
        config.hero?.descripcion ||
        "Gana dinero vendiendo acceso VPN premium a tus clientes",
      promocion: config.hero?.promocion || {
        habilitada: false,
        texto: "",
        estilo: "from-purple-500 to-pink-500",
        textColor: "text-white",
        bgColor: "bg-gradient-to-r from-purple-600 to-pink-600",
      },
    };
  }

  /**
   * Lee la configuración completa de planes
   */
  leerConfigPlanes(): ConfigPlanes {
    return this.leerConfig();
  }

  /**
   * Guarda la configuración de planes en el archivo JSON
   */
  guardarConfigPlanes(config: ConfigPlanes): void {
    try {
      fs.writeFileSync(
        this.configPath,
        JSON.stringify(config, null, 2),
        "utf-8"
      );
      console.log("[ConfigService] ✅ Configuración de planes guardada");
      // Limpiar caché para forzar lectura del archivo actualizado
      this.cache = null;
      this.cacheTime = 0;
    } catch (error: any) {
      console.error(
        "[ConfigService] ❌ Error guardando config planes:",
        error.message
      );
      throw error;
    }
  }

  /**
   * Lee la configuración de noticias (con caché)
   * Ahora es público para permitir acceso desde rutas
   */
  leerConfigNoticias(): any {
    const ahora = Date.now();

    // Si el caché no ha expirado, devolverlo
    if (
      this.noticiasCache &&
      ahora - this.noticiasCacheTime < this.cacheExpire
    ) {
      return this.noticiasCache;
    }

    try {
      if (!fs.existsSync(this.noticiasConfigPath)) {
        console.log("[ConfigService] ℹ️ Archivo de config noticias no existe");
        return { enabled: false, noticias: [] };
      }

      const contenido = fs.readFileSync(this.noticiasConfigPath, "utf-8");
      const config: any = JSON.parse(contenido);

      // Actualizar caché
      this.noticiasCache = config;
      this.noticiasCacheTime = ahora;

      return config;
    } catch (error: any) {
      console.error(
        "[ConfigService] ❌ Error leyendo config noticias:",
        error.message
      );
      return { enabled: false, noticias: [] };
    }
  }

  /**
   * Guarda la configuración de noticias en disco
   */
  guardarConfigNoticias(config: any): void {
    try {
      const contenido = JSON.stringify(config, null, 2);
      fs.writeFileSync(this.noticiasConfigPath, contenido, "utf-8");
      console.log(
        "[ConfigService] ✅ Config noticias guardada en:",
        this.noticiasConfigPath
      );

      // Invalidar caché para que se relean los datos
      this.noticiasCache = null;
      this.noticiasCacheTime = 0;
    } catch (error: any) {
      console.error(
        "[ConfigService] ❌ Error guardando config noticias:",
        error.message
      );
      throw error;
    }
  }

  /**
   * Obtiene la configuración de noticias
   */
  obtenerNoticiasActivas(): any {
    const config = this.leerConfigNoticias();

    if (!config.enabled) {
      return null;
    }

    return config;
  }
}

export const configService = new ConfigService();
