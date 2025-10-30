import Database from "better-sqlite3";
import { config } from "../config";
import { configService } from "./config.service";

export class PreciosSyncService {
  private dbPath: string;

  constructor() {
    this.dbPath = config.database.path;
  }

  /**
   * Sincroniza los precios en la base de datos con los valores de `precios_normales`
   * definidos en `planes.config.json`. Devuelve el número de filas actualizadas.
   */
  sincronizarPreciosDesdeConfig(force: boolean = false): {
    updated: number;
    details: Array<{ id: string; from?: number; to: number }>;
  } {
    const cfg = configService.leerConfigPlanes();
    const precios = cfg.precios_normales || {};

    // Si no hay precios normales definidos, nada que hacer
    if (Object.keys(precios).length === 0) {
      return { updated: 0, details: [] };
    }

    // Protección: no sincronizar mientras una promo esté activa,
    // a menos que se fuerce explícitamente (force === true).
    if (cfg.promo_config && cfg.promo_config.activa && !force) {
      console.info(
        "precios-sync: promo activa, se omite la sincronización (usar force=true para forzar)"
      );
      return { updated: 0, details: [] };
    }

    const db = new Database(this.dbPath);
    try {
      db.pragma("journal_mode = WAL");
      const updateStmt = db.prepare(
        "UPDATE planes SET precio = ? WHERE id = ?"
      );
      const selectStmt = db.prepare("SELECT precio FROM planes WHERE id = ?");

      const details: Array<{ id: string; from?: number; to: number }> = [];
      let updated = 0;

      const tx = db.transaction(() => {
        for (const [id, precio] of Object.entries(precios)) {
          const idNum = parseInt(id, 10);
          const row = selectStmt.get(idNum) as any;
          const from = row ? Number(row.precio) : undefined;
          if (from === undefined || Number(from) !== Number(precio)) {
            updateStmt.run(precio, idNum);
            updated++;
            details.push({ id, from, to: Number(precio) });
          }
        }
      });

      tx();

      return { updated, details };
    } finally {
      try {
        db.close();
      } catch (err) {
        // ignore
      }
    }
  }
}

export const preciosSyncService = new PreciosSyncService();
