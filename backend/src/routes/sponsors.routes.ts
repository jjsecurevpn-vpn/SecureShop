import express, { Request, Response } from "express";
import { SponsorsService } from "../services/sponsors.service";

export function crearRutasSponsors(sponsorsService: SponsorsService) {
  const router = express.Router();

  router.get("/", async (_req: Request, res: Response) => {
    try {
      const sponsors = await sponsorsService.listar();
      return res.status(200).json({ success: true, data: sponsors });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Error al obtener sponsors",
        detalles: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  router.post("/", async (req: Request, res: Response) => {
    try {
      const sponsor = await sponsorsService.crear(req.body);
      return res.status(201).json({ success: true, data: sponsor });
    } catch (error) {
      const status =
        error instanceof Error && error.message.includes("obligatorio")
          ? 400
          : 500;
      return res.status(status).json({
        success: false,
        error: "Error al crear sponsor",
        detalles: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  router.put("/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "ID inválido",
        });
      }
      const sponsor = await sponsorsService.actualizar(id, req.body);
      return res.status(200).json({ success: true, data: sponsor });
    } catch (error) {
      let status = 500;
      let message = "Error al actualizar sponsor";
      if (error instanceof Error) {
        if (error.message.includes("no encontrado")) {
          status = 404;
          message = "Sponsor no encontrado";
        } else if (error.message.includes("Categoría")) {
          status = 400;
        }
      }
      return res.status(status).json({
        success: false,
        error: message,
        detalles: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "ID inválido",
        });
      }
      await sponsorsService.eliminar(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Error al eliminar sponsor",
        detalles: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return router;
}