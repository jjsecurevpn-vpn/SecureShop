import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from '../config';

/**
 * Middleware de CORS
 */
export const corsMiddleware = cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

/**
 * Middleware de logging
 */
export const loggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const logLevel = statusCode >= 400 ? '❌' : '✅';

    console.log(
      `${logLevel} [${new Date().toISOString()}] ${method} ${originalUrl} ${statusCode} - ${duration}ms - IP: ${ip}`
    );
  });

  next();
};

/**
 * Middleware de manejo de errores
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[Error]', err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Error interno del servidor',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

/**
 * Middleware de validación de JSON
 */
export const validarJSON = (err: Error, _req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      error: 'JSON inválido en el cuerpo de la solicitud',
    });
    return;
  }
  next(err);
};
