import { DatabaseService } from "./database.service";
import { configService } from "./config.service";
import { Plan, PlanRevendedor } from "../types";

export class PlanesService {
  constructor(private db: DatabaseService) {}

  /**
   * Obtiene todos los planes normales
   */
  obtenerPlanes(): Plan[] {
    try {
      const database = this.db.getDatabase();
      const planes = database
        .prepare("SELECT * FROM planes WHERE activo = 1")
        .all() as any[];
      return planes || [];
    } catch (error) {
      console.error("[PLANES-SERVICE] Error al obtener planes:", error);
      throw new Error("Error al obtener planes");
    }
  }

  /**
   * Obtiene todos los planes de revendedor
   */
  obtenerPlanesRevendedor(): PlanRevendedor[] {
    try {
      const database = this.db.getDatabase();
      const planes = database
        .prepare("SELECT * FROM planes_revendedores WHERE activo = 1")
        .all() as any[];
      return planes || [];
    } catch (error) {
      console.error("[PLANES-SERVICE] Error al obtener planes revendedor:", error);
      throw new Error("Error al obtener planes de revendedor");
    }
  }

  /**
   * Actualiza el precio de un plan normal
   */
  actualizarPlan(id: number, precio: number): Plan {
    try {
      const database = this.db.getDatabase();
      
      // Validar que existe el plan
      const plan = database
        .prepare("SELECT * FROM planes WHERE id = ?")
        .get(id) as any;
      
      if (!plan) {
        throw new Error(`Plan con ID ${id} no encontrado`);
      }

      // Actualizar en BD
      database
        .prepare("UPDATE planes SET precio = ? WHERE id = ?")
        .run(precio, id);

      // Actualizar en configuración también
      if (plan.nombre) {
        const config = configService.leerConfigPlanes();
        if (config.precios_normales) {
          config.precios_normales[id.toString()] = precio;
        }
        if (config.overrides && config.overrides[id.toString()]) {
          const override = config.overrides[id.toString()];
          if (typeof override === 'object') {
            override.precio = precio;
          }
        }
        config.ultima_actualizacion = new Date().toISOString();
        configService.guardarConfigPlanes(config);
        console.log(`[PLANES-SERVICE] Plan ${id} actualizado: precio ${plan.precio} -> ${precio}`);
      }

      // Retornar plan actualizado
      return database
        .prepare("SELECT * FROM planes WHERE id = ?")
        .get(id) as Plan;
    } catch (error) {
      console.error("[PLANES-SERVICE] Error al actualizar plan:", error);
      throw error;
    }
  }

  /**
   * Actualiza el precio de un plan de revendedor
   */
  actualizarPlanRevendedor(id: number, precio: number): PlanRevendedor {
    try {
      const database = this.db.getDatabase();
      
      // Validar que existe el plan
      const plan = database
        .prepare("SELECT * FROM planes_revendedores WHERE id = ?")
        .get(id) as any;
      
      if (!plan) {
        throw new Error(`Plan de revendedor con ID ${id} no encontrado`);
      }

      // Actualizar en BD
      database
        .prepare("UPDATE planes_revendedores SET precio = ? WHERE id = ?")
        .run(precio, id);

      // Actualizar en configuración también
      if (plan.nombre) {
        const config = configService.leerConfigRevendedores();
        if (config.precios_normales) {
          config.precios_normales[id.toString()] = precio;
        }
        if (config.overrides && config.overrides[id.toString()]) {
          const override = config.overrides[id.toString()];
          if (typeof override === 'object') {
            override.precio = precio;
          }
        }
        config.ultima_actualizacion = new Date().toISOString();
        configService.guardarConfigRevendedores(config);
        console.log(`[PLANES-SERVICE] Plan revendedor ${id} actualizado: precio ${plan.precio} -> ${precio}`);
      }

      // Retornar plan actualizado
      return database
        .prepare("SELECT * FROM planes_revendedores WHERE id = ?")
        .get(id) as PlanRevendedor;
    } catch (error) {
      console.error("[PLANES-SERVICE] Error al actualizar plan revendedor:", error);
      throw error;
    }
  }
}
