import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import { DatabaseService } from "./services/database.service";
import { ServexService } from "./services/servex.service";
import { MercadoPagoService } from "./services/mercadopago.service";
import { TiendaService } from "./services/tienda.service";
import { TiendaRevendedoresService } from "./services/tienda-revendedores.service";
import { RenovacionService } from "./services/renovacion.service";
import { WebSocketService } from "./services/websocket.service";
import { PromoTimerService } from "./services/promo-timer.service";
import { crearRutasTienda } from "./routes/tienda.routes";
import { crearRutasRevendedores } from "./routes/tienda-revendedores.routes";
import { crearRutasRenovacion } from "./routes/renovacion.routes";
import { crearRutasDonaciones } from "./routes/donaciones.routes";
import { crearRutasStats } from "./routes/stats.routes";
import { crearRutasClientes } from "./routes/clientes.routes";
import configRoutes from "./routes/config.routes";
import cuponesRoutes from "./routes/cupones.routes";
// import promoRoutes from "./routes/promo.routes"; // DESACTIVADO por conflicto
import { cuponesService } from "./services/cupones.service";
import { ServexPollingService } from "./services/servex-polling.service";
import { RealtimeService } from "./services/realtime.service";
import { crearRutasRealtime } from "./routes/realtime.routes";
import { crearRutasSponsors } from "./routes/sponsors.routes";
import { DonacionesService } from "./services/donaciones.service";
import { SponsorsService } from "./services/sponsors.service";
import { PlanesService } from "./services/planes.service";
import { crearRutasPlanes, crearRutasPlanesRevendedores } from "./routes/planes.routes";
import {
  corsMiddleware,
  loggerMiddleware,
  errorHandler,
  validarJSON,
} from "./middleware";

class Server {
  private app: express.Application;
  private db!: DatabaseService;
  private tiendaService!: TiendaService;
  private tiendaRevendedoresService!: TiendaRevendedoresService;
  private renovacionService!: RenovacionService;
  private donacionesService!: DonacionesService;
  private sponsorsService!: SponsorsService;
  private planesService!: PlanesService;
  private wsService!: WebSocketService;
  private servexService!: ServexService;
  private servexPollingService!: ServexPollingService;
  private realtimeService!: RealtimeService;
  private lastServexSnapshotLog = 0;

  constructor() {
    this.app = express();
    this.initializeServices();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private initializeServices(): void {
    console.log("[Server] Inicializando servicios...");

    // Inicializar base de datos
    this.db = new DatabaseService(config.database.path);
    console.log("[Server] ✅ Base de datos inicializada");

  this.sponsorsService = new SponsorsService(this.db);
  console.log("[Server] ✅ Servicio de sponsors inicializado");

  this.planesService = new PlanesService(this.db);
  console.log("[Server] ✅ Servicio de planes inicializado");

    // Inicializar cupones desde configuración
    cuponesService.cargarCuponesDesdeConfig().then((resultado) => {
      console.log(`[Server] ✅ Cupones cargados: ${resultado.cargados}, existentes: ${resultado.existentes}`);
      if (resultado.errores.length > 0) {
        console.warn("[Server] ⚠️  Errores al cargar cupones:", resultado.errores);
      }
    }).catch((error) => {
      console.error("[Server] Error cargando cupones desde configuración:", error);
    });

    // Inicializar servicio de Servex
    const servex = new ServexService(config.servex);
    this.servexService = servex;
    console.log("[Server] ✅ Servicio Servex inicializado");

    this.realtimeService = new RealtimeService();

    this.servexPollingService = new ServexPollingService(servex, {
      intervalMs: config.servex.pollIntervalMs,
      maxBackoffMs: config.servex.pollMaxBackoffMs,
      clientsLimit: config.servex.pollClientsLimit,
    });

    this.servexPollingService.on("snapshot", (snapshot) => {
      const now = Date.now();
      if (now - this.lastServexSnapshotLog > 60_000) {
        console.log(
          `[Server] ♻️ Snapshot Servex actualizado (${snapshot.clients.length} clientes)`
        );
        this.lastServexSnapshotLog = now;
      }
      this.realtimeService.updateClients(snapshot);
    });

    this.servexPollingService.on("error", (error) => {
      console.error("[Server] ❌ Error en ServexPollingService:", error);
    });

    this.servexPollingService.on("backoff", (info: any) => {
      if (info && typeof info.delay === "number") {
        console.warn(
          `[Server] ⚠️ Servex rate limit (x${info.consecutive429 ?? "?"}). Reintentando en ${info.delay}ms`
        );
      }
    });

    this.servexPollingService.start();
    console.log("[Server] ✅ Polling de Servex iniciado");

    // Inicializar servicio de MercadoPago
    const mercadopago = new MercadoPagoService(config.mercadopago);
    console.log("[Server] ✅ Servicio MercadoPago inicializado");

  // Inicializar servicio de donaciones
  this.donacionesService = new DonacionesService(this.db, mercadopago);
  console.log("[Server] ✅ Servicio de donaciones inicializado");

    // Inicializar WebSocket para estadísticas en tiempo real (ANTES de tienda)
    this.wsService = new WebSocketService();
    this.wsService.conectar().catch((error) => {
      console.error("[Server] Error conectando WebSocket:", error);
    });
    console.log("[Server] ✅ Servicio de WebSocket inicializado");

    this.wsService.on("server-stats", (stats) => {
      this.realtimeService.updateServerStats(stats);
    });

    // Inicializar servicio de tienda (DESPUÉS de wsService)
    this.tiendaService = new TiendaService(this.db, servex, mercadopago, this.wsService);
    console.log("[Server] ✅ Servicio de tienda inicializado");

    // Inicializar servicio de tienda para revendedores
    this.tiendaRevendedoresService = new TiendaRevendedoresService(
      this.db,
      servex,
      mercadopago
    );
    console.log("[Server] ✅ Servicio de revendedores inicializado");

    // Inicializar servicio de renovaciones
    this.renovacionService = new RenovacionService(this.db, servex, mercadopago);
    console.log("[Server] ✅ Servicio de renovaciones inicializado");
      this.renovacionService.iniciarAutoRevisionesPendientes(config.renovaciones);

    // Inicializar planes por defecto
    this.tiendaService.inicializarPlanes().catch((error) => {
      console.error("[Server] Error inicializando planes:", error);
    });
  }

  private setupMiddleware(): void {
    // Trust proxy (para trabajar detrás de Nginx)
    this.app.set("trust proxy", 1);

    // Seguridad
    this.app.use(helmet());

    // Rate limiting con configuración correcta para proxy
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: "Demasiadas solicitudes, por favor intente más tarde",
      },
      keyGenerator: (req) => {
        // Obtener IP real del cliente detrás del proxy
        return req.ip || req.connection.remoteAddress || "unknown";
      },
      skip: (req) => {
        if (req.path === "/health") {
          return true;
        }

          // Endpoints de lectura que se consultan con alta frecuencia desde el frontend
          const readHeavyPrefixes = [
            "/api/realtime",
            "/api/config",
            "/api/cupones",
            "/api/clients",
            "/api/stats",
          ];

        if (req.method === "GET" && readHeavyPrefixes.some((prefix) => req.path.startsWith(prefix))) {
          return true;
        }

        return false;
      },
    });
    this.app.use(limiter);

    // CORS
    this.app.use(corsMiddleware);

    // Logging
    this.app.use(loggerMiddleware);

    // Body parsing
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Validación de JSON
    this.app.use(validarJSON);
  }

  private setupRoutes(): void {
    // Health check
    this.app.get("/health", (_req, res) => {
      res.json({
        success: true,
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
      });
    });

    // Webhook unificado para MercadoPago (antes de las rutas específicas)
    this.app.post("/api/webhook", async (req, res) => {
      try {
        console.log(
          "[Webhook Unificado] Recibido:",
          JSON.stringify(req.body, null, 2)
        );

        // Procesar en todos los servicios de forma asíncrona
        Promise.all([
          this.tiendaService.procesarWebhook(req.body).catch((error) => {
            console.error("[Webhook Cliente] Error:", error);
          }),
          this.tiendaRevendedoresService
            .procesarWebhook(req.body)
            .catch((error) => {
              console.error("[Webhook Revendedor] Error:", error);
            }),
          this.renovacionService.procesarWebhook(req.body).catch((error) => {
            console.error("[Webhook Renovación] Error:", error);
          }),
          this.donacionesService.procesarWebhook(req.body).catch((error) => {
            console.error("[Webhook Donaciones] Error:", error);
          }),
        ]);

        // Responder inmediatamente a MercadoPago
        res.status(200).json({ success: true });
      } catch (error: any) {
        console.error("[Webhook] Error:", error);
        // Aún así responder 200 para evitar reintentos de MercadoPago
        res.status(200).json({ success: false });
      }
    });

    // Rutas de la API - Clientes
    this.app.use("/api", crearRutasTienda(this.tiendaService, this.wsService));

    // Rutas de la API - Donaciones
    this.app.use("/api", crearRutasDonaciones(this.donacionesService));

    // Rutas de la API - Revendedores
    this.app.use(
      "/api",
      crearRutasRevendedores(this.tiendaRevendedoresService)
    );

    // Rutas de la API - Renovaciones
    this.app.use(
      "/api/renovacion",
      crearRutasRenovacion(this.renovacionService)
    );

    // Rutas de la API - Estadísticas
    this.app.use(
      "/api/stats",
      crearRutasStats(this.wsService, this.servexService, this.realtimeService)
    );

    // Rutas de la API - Clientes
    this.app.use(
      "/api",
      crearRutasClientes(this.servexService, this.servexPollingService)
    );

    // Rutas de la API - Realtime (SSE)
    this.app.use("/api/realtime", crearRutasRealtime(this.realtimeService));

    // Rutas de la API - Config (Promociones, etc)
    this.app.use("/api/config", configRoutes);

    // Rutas de la API - Cupones
    this.app.use("/api/cupones", cuponesRoutes);

    this.app.use(
      "/api/sponsors",
      crearRutasSponsors(this.sponsorsService),
    );

    // Rutas de la API - Planes
    this.app.use(
      "/api/planes",
      crearRutasPlanes(this.planesService),
    );

    this.app.use(
      "/api/planes-revendedores",
      crearRutasPlanesRevendedores(this.planesService),
    );

    // Rutas de la API - Visitantes - removidas (funcionalidad de conteo eliminada)

    // Rutas de la API - Promo (para revendedores) - DESACTIVADO por conflicto
    // this.app.use("/api/config", promoRoutes);

    // Inicializar PromoTimerService para verificar promos expiradas cada 5 minutos
    const configPath = require("path").join(
      process.cwd(),
      "public",
      "config",
      "planes.config.json"
    );
    const promoTimerService = new PromoTimerService(configPath);
    promoTimerService.iniciar();
    console.log("[Server] ✅ PromoTimerService inicializado");

    // 404 handler
    this.app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        error: "Ruta no encontrada",
        path: req.originalUrl,
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public start(): void {
    this.app.listen(config.port, () => {
      console.log("");
      console.log("═══════════════════════════════════════════════════════");
      console.log("🛡️  SecureShop VPN - Backend API");
      console.log("═══════════════════════════════════════════════════════");
      console.log(`🚀 Servidor ejecutándose en puerto ${config.port}`);
      console.log(`🌍 Entorno: ${config.nodeEnv}`);
      console.log(`📊 Health check: http://localhost:${config.port}/health`);
      console.log(`🔌 API Base: http://localhost:${config.port}/api`);
      console.log("═══════════════════════════════════════════════════════");
      console.log("");
    });

    // Manejo de errores no capturados
    process.on("unhandledRejection", (reason, promise) => {
      console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    });

    process.on("uncaughtException", (error) => {
      console.error("❌ Uncaught Exception:", error);
      process.exit(1);
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}

export default Server;
