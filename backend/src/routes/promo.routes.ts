import express, { Request, Response } from "express";

const router = express.Router();

/**
 * GET /api/config/promo-status-revendedores
 * Obtiene el estado actual de la promoción para revendedores
 */
router.get("/promo-status-revendedores", (_req: Request, res: Response) => {
  try {
    return res.status(200).json({
      promo_config: {
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

export default router;
