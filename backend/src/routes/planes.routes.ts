import express, { Request, Response } from "express";
import { PlanesService } from "../services/planes.service";

export function crearRutasPlanes(planesService: PlanesService) {
  const router = express.Router();

  /**
   * GET /api/planes
   * Obtiene todos los planes normales
   */
  router.get("/", (_req: Request, res: Response) => {
    try {
      const planes = planesService.obtenerPlanes();
      return res.status(200).json({
        success: true,
        data: planes,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Error al obtener planes",
        detalles: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * PUT /api/planes/actualizar
   * Actualiza el precio de un plan normal
   * Body: { id: number, precio: number }
   */
  router.put("/actualizar", (req: Request, res: Response) => {
    try {
      const { id, precio } = req.body;

      // Validaciones
      if (typeof id !== "number" || id <= 0) {
        return res.status(400).json({
          success: false,
          error: "ID debe ser un número mayor a 0",
        });
      }

      if (typeof precio !== "number" || precio <= 0) {
        return res.status(400).json({
          success: false,
          error: "Precio debe ser un número mayor a 0",
        });
      }

      const planActualizado = planesService.actualizarPlan(id, precio);
      return res.status(200).json({
        success: true,
        message: "Plan actualizado exitosamente",
        data: planActualizado,
      });
    } catch (error) {
      let status = 500;
      let message = "Error al actualizar plan";

      if (error instanceof Error && error.message.includes("no encontrado")) {
        status = 404;
        message = "Plan no encontrado";
      }

      return res.status(status).json({
        success: false,
        error: message,
        detalles: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return router;
}

export function crearRutasPlanesRevendedores(planesService: PlanesService) {
  const router = express.Router();

  /**
   * GET /api/planes-revendedores
   * Obtiene todos los planes de revendedor
   */
  router.get("/", (_req: Request, res: Response) => {
    try {
      const planes = planesService.obtenerPlanesRevendedor();
      return res.status(200).json({
        success: true,
        data: planes,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Error al obtener planes de revendedor",
        detalles: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * PUT /api/planes-revendedores/actualizar
   * Actualiza el precio de un plan de revendedor
   * Body: { id: number, precio: number }
   */
  router.put("/actualizar", (req: Request, res: Response) => {
    try {
      const { id, precio } = req.body;

      // Validaciones
      if (typeof id !== "number" || id <= 0) {
        return res.status(400).json({
          success: false,
          error: "ID debe ser un número mayor a 0",
        });
      }

      if (typeof precio !== "number" || precio <= 0) {
        return res.status(400).json({
          success: false,
          error: "Precio debe ser un número mayor a 0",
        });
      }

      const planActualizado = planesService.actualizarPlanRevendedor(id, precio);
      return res.status(200).json({
        success: true,
        message: "Plan de revendedor actualizado exitosamente",
        data: planActualizado,
      });
    } catch (error) {
      let status = 500;
      let message = "Error al actualizar plan de revendedor";

      if (error instanceof Error && error.message.includes("no encontrado")) {
        status = 404;
        message = "Plan de revendedor no encontrado";
      }

      return res.status(status).json({
        success: false,
        error: message,
        detalles: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return router;
}
