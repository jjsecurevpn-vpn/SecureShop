import dotenv from "dotenv";
import { AppConfig } from "../types";

// Cargar variables de entorno
dotenv.config();

// Validar variables de entorno requeridas
const requiredEnvVars = [
  "SERVEX_API_KEY",
  "SERVEX_BASE_URL",
  "MP_ACCESS_TOKEN",
  "MP_PUBLIC_KEY",
  "MP_WEBHOOK_URL",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Variable de entorno requerida no encontrada: ${envVar}`);
  }
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  servex: {
    apiKey: process.env.SERVEX_API_KEY!,
    baseUrl: process.env.SERVEX_BASE_URL!,
    timeout: parseInt(process.env.SERVEX_TIMEOUT || "30000", 10),
    pollIntervalMs: parseInt(process.env.SERVEX_POLL_INTERVAL_MS || "5000", 10),
    pollMaxBackoffMs: parseInt(process.env.SERVEX_POLL_MAX_BACKOFF_MS || "30000", 10),
    pollClientsLimit: parseInt(process.env.SERVEX_POLL_CLIENTS_LIMIT || "50", 10),
  },

  mercadopago: {
    accessToken: process.env.MP_ACCESS_TOKEN!,
    publicKey: process.env.MP_PUBLIC_KEY!,
    webhookUrl: process.env.MP_WEBHOOK_URL!,
    frontendUrl: "https://shop.jhservices.com.ar",
  },

  database: {
    path: process.env.DATABASE_PATH || "./database/secureshop.db",
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "500", 10), // 500 solicitudes por ventana
  },

  logLevel: process.env.LOG_LEVEL || "info",
};
