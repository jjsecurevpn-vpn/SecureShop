import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import {
  Plan,
  PlanRow,
  Pago,
  PagoRow,
  CrearPlanInput,
  PlanRevendedor,
  PlanRevendedorRow,
  PagoRevendedor,
  PagoRevendedorRow,
  CrearPlanRevendedorInput,
} from "../types";

export class DatabaseService {
  private db: Database.Database;

  constructor(dbPath: string) {
    // Crear directorio si no existe
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.inicializarTablas();
  }

  /**
   * Retorna la instancia de better-sqlite3 para uso en servicios que la requieran
   */
  getDatabase(): Database.Database {
    return this.db;
  }

  private inicializarTablas(): void {
    // Tabla de planes
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS planes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE,
        descripcion TEXT,
        precio REAL NOT NULL,
        dias INTEGER NOT NULL,
        connection_limit INTEGER NOT NULL DEFAULT 1,
        activo INTEGER NOT NULL DEFAULT 1,
        fecha_creacion TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    // Tabla de pagos
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS pagos (
        id TEXT PRIMARY KEY,
        plan_id INTEGER NOT NULL,
        monto REAL NOT NULL,
        estado TEXT NOT NULL DEFAULT 'pendiente',
        metodo_pago TEXT NOT NULL DEFAULT 'mercadopago',
        cliente_email TEXT NOT NULL,
        cliente_nombre TEXT NOT NULL,
        mp_payment_id TEXT,
        mp_preference_id TEXT,
        servex_cuenta_id INTEGER,
        servex_username TEXT,
        servex_password TEXT,
        servex_categoria TEXT,
        servex_expiracion TEXT,
        servex_connection_limit INTEGER,
        fecha_creacion TEXT NOT NULL DEFAULT (datetime('now')),
        fecha_actualizacion TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (plan_id) REFERENCES planes(id)
      )
    `);

    // Índices para optimizar consultas
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);
      CREATE INDEX IF NOT EXISTS idx_pagos_mp_payment ON pagos(mp_payment_id);
      CREATE INDEX IF NOT EXISTS idx_pagos_email ON pagos(cliente_email);
    `);
  }

  // ============================================
  // MÉTODOS PARA PLANES
  // ============================================

  obtenerPlanes(): Plan[] {
    const stmt = this.db.prepare(
      "SELECT * FROM planes WHERE activo = 1 ORDER BY precio ASC"
    );
    const rows = stmt.all() as PlanRow[];
    return rows.map(this.mapPlanRowToPlan);
  }

  obtenerPlanPorId(id: number): Plan | null {
    const stmt = this.db.prepare("SELECT * FROM planes WHERE id = ?");
    const row = stmt.get(id) as PlanRow | undefined;
    return row ? this.mapPlanRowToPlan(row) : null;
  }

  crearPlan(input: CrearPlanInput): Plan {
    const stmt = this.db.prepare(`
      INSERT INTO planes (nombre, descripcion, precio, dias, connection_limit, activo)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      input.nombre,
      input.descripcion || "",
      input.precio,
      input.dias,
      input.connection_limit,
      input.activo ? 1 : 0
    );

    const plan = this.obtenerPlanPorId(result.lastInsertRowid as number);
    if (!plan) throw new Error("Error al crear plan");
    return plan;
  }

  // ============================================
  // MÉTODOS PARA PAGOS
  // ============================================

  crearPago(pago: Omit<Pago, "fecha_creacion" | "fecha_actualizacion">): Pago {
    const stmt = this.db.prepare(`
      INSERT INTO pagos (
        id, plan_id, monto, estado, metodo_pago,
        cliente_email, cliente_nombre, mp_payment_id, mp_preference_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      pago.id,
      pago.plan_id,
      pago.monto,
      pago.estado,
      pago.metodo_pago,
      pago.cliente_email,
      pago.cliente_nombre,
      pago.mp_payment_id || null,
      pago.mp_preference_id || null
    );

    const pagoBuscado = this.obtenerPagoPorId(pago.id);
    if (!pagoBuscado) throw new Error("Error al crear pago");
    return pagoBuscado;
  }

  obtenerPagoPorId(id: string): Pago | null {
    const stmt = this.db.prepare("SELECT * FROM pagos WHERE id = ?");
    const row = stmt.get(id) as PagoRow | undefined;
    return row ? this.mapPagoRowToPago(row) : null;
  }

  obtenerPagoPorMpPaymentId(mpPaymentId: string): Pago | null {
    const stmt = this.db.prepare("SELECT * FROM pagos WHERE mp_payment_id = ?");
    const row = stmt.get(mpPaymentId) as PagoRow | undefined;
    return row ? this.mapPagoRowToPago(row) : null;
  }

  actualizarEstadoPago(
    pagoId: string,
    estado: Pago["estado"],
    mpPaymentId?: string
  ): void {
    const stmt = this.db.prepare(`
      UPDATE pagos
      SET estado = ?, mp_payment_id = COALESCE(?, mp_payment_id), fecha_actualizacion = datetime('now')
      WHERE id = ?
    `);
    stmt.run(estado, mpPaymentId || null, pagoId);
  }

  guardarCuentaServex(
    pagoId: string,
    cuentaId: number,
    username: string,
    password: string,
    categoria: string,
    expiracion: string,
    connectionLimit: number
  ): void {
    const stmt = this.db.prepare(`
      UPDATE pagos
      SET servex_cuenta_id = ?,
          servex_username = ?,
          servex_password = ?,
          servex_categoria = ?,
          servex_expiracion = ?,
          servex_connection_limit = ?,
          fecha_actualizacion = datetime('now')
      WHERE id = ?
    `);
    stmt.run(
      cuentaId,
      username,
      password,
      categoria,
      expiracion,
      connectionLimit,
      pagoId
    );
  }

  // ============================================
  // MAPPERS
  // ============================================

  private mapPlanRowToPlan(row: PlanRow): Plan {
    return {
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      precio: row.precio,
      dias: row.dias,
      connection_limit: row.connection_limit,
      activo: row.activo === 1,
      fecha_creacion: new Date(row.fecha_creacion),
    };
  }

  private mapPagoRowToPago(row: PagoRow): Pago {
    return {
      id: row.id,
      plan_id: row.plan_id,
      monto: row.monto,
      estado: row.estado as Pago["estado"],
      metodo_pago: row.metodo_pago,
      cliente_email: row.cliente_email,
      cliente_nombre: row.cliente_nombre,
      mp_payment_id: row.mp_payment_id || undefined,
      mp_preference_id: row.mp_preference_id || undefined,
      servex_cuenta_id: row.servex_cuenta_id || undefined,
      servex_username: row.servex_username || undefined,
      servex_password: row.servex_password || undefined,
      servex_categoria: row.servex_categoria || undefined,
      servex_expiracion: row.servex_expiracion || undefined,
      servex_connection_limit: row.servex_connection_limit || undefined,
      fecha_creacion: new Date(row.fecha_creacion),
      fecha_actualizacion: new Date(row.fecha_actualizacion),
    };
  }

  // ============================================
  // PLANES DE REVENDEDORES
  // ============================================

  obtenerPlanesRevendedores(): PlanRevendedor[] {
    const stmt = this.db.prepare(`
      SELECT * FROM planes_revendedores 
      WHERE activo = 1 
      ORDER BY precio ASC
    `);
    const rows = stmt.all() as PlanRevendedorRow[];
    return rows.map(this.mapRowToPlanRevendedor);
  }

  obtenerPlanRevendedorPorId(id: number): PlanRevendedor | null {
    const stmt = this.db.prepare(
      "SELECT * FROM planes_revendedores WHERE id = ?"
    );
    const row = stmt.get(id) as PlanRevendedorRow | undefined;
    return row ? this.mapRowToPlanRevendedor(row) : null;
  }

  crearPlanRevendedor(input: CrearPlanRevendedorInput): PlanRevendedor {
    const stmt = this.db.prepare(`
      INSERT INTO planes_revendedores 
      (nombre, descripcion, precio, max_users, account_type, dias, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      input.nombre,
      input.descripcion || null,
      input.precio,
      input.max_users,
      input.account_type,
      input.dias || null,
      input.activo !== undefined ? (input.activo ? 1 : 0) : 1
    );

    const planCreado = this.obtenerPlanRevendedorPorId(
      result.lastInsertRowid as number
    );
    if (!planCreado) {
      throw new Error("Error al crear el plan de revendedor");
    }

    return planCreado;
  }

  // ============================================
  // PAGOS DE REVENDEDORES
  // ============================================

  crearPagoRevendedor(data: {
    id: string;
    plan_revendedor_id: number;
    monto: number;
    estado: string;
    metodo_pago: string;
    cliente_email: string;
    cliente_nombre: string;
  }): PagoRevendedor {
    const stmt = this.db.prepare(`
      INSERT INTO pagos_revendedores 
      (id, plan_revendedor_id, monto, estado, metodo_pago, cliente_email, cliente_nombre)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      data.id,
      data.plan_revendedor_id,
      data.monto,
      data.estado,
      data.metodo_pago,
      data.cliente_email,
      data.cliente_nombre
    );

    const pago = this.obtenerPagoRevendedorPorId(data.id);
    if (!pago) {
      throw new Error("Error al crear el pago de revendedor");
    }

    return pago;
  }

  obtenerPagoRevendedorPorId(id: string): PagoRevendedor | null {
    const stmt = this.db.prepare(
      "SELECT * FROM pagos_revendedores WHERE id = ?"
    );
    const row = stmt.get(id) as PagoRevendedorRow | undefined;
    return row ? this.mapRowToPagoRevendedor(row) : null;
  }

  actualizarEstadoPagoRevendedor(
    id: string,
    estado: string,
    mpPaymentId?: string
  ): void {
    const stmt = this.db.prepare(`
      UPDATE pagos_revendedores 
      SET estado = ?, 
          mp_payment_id = COALESCE(?, mp_payment_id),
          fecha_actualizacion = datetime('now')
      WHERE id = ?
    `);

    stmt.run(estado, mpPaymentId || null, id);
  }

  guardarRevendedorServex(
    pagoId: string,
    revendedorId: number,
    username: string,
    password: string,
    maxUsers: number,
    accountType: string,
    expiracion?: string,
    duracionDias?: number
  ): void {
    const stmt = this.db.prepare(`
      UPDATE pagos_revendedores 
      SET servex_revendedor_id = ?,
          servex_username = ?,
          servex_password = ?,
          servex_max_users = ?,
          servex_account_type = ?,
          servex_expiracion = ?,
          servex_duracion_dias = ?,
          fecha_actualizacion = datetime('now')
      WHERE id = ?
    `);

    stmt.run(
      revendedorId,
      username,
      password,
      maxUsers,
      accountType,
      expiracion || null,
      duracionDias || null,
      pagoId
    );
  }

  // ============================================
  // MAPPERS PARA REVENDEDORES
  // ============================================

  private mapRowToPlanRevendedor(row: PlanRevendedorRow): PlanRevendedor {
    return {
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      precio: row.precio,
      max_users: row.max_users,
      account_type: row.account_type as "validity" | "credit",
      dias: row.dias || undefined,
      activo: row.activo === 1,
      fecha_creacion: new Date(row.fecha_creacion),
    };
  }

  private mapRowToPagoRevendedor(row: PagoRevendedorRow): PagoRevendedor {
    return {
      id: row.id,
      plan_revendedor_id: row.plan_revendedor_id,
      monto: row.monto,
      estado: row.estado as PagoRevendedor["estado"],
      metodo_pago: row.metodo_pago,
      cliente_email: row.cliente_email,
      cliente_nombre: row.cliente_nombre,
      mp_payment_id: row.mp_payment_id || undefined,
      mp_preference_id: row.mp_preference_id || undefined,
      servex_revendedor_id: row.servex_revendedor_id || undefined,
      servex_username: row.servex_username || undefined,
      servex_password: row.servex_password || undefined,
      servex_max_users: row.servex_max_users || undefined,
      servex_account_type: row.servex_account_type || undefined,
      servex_expiracion: row.servex_expiracion || undefined,
      fecha_creacion: new Date(row.fecha_creacion),
      fecha_actualizacion: new Date(row.fecha_actualizacion),
    };
  }

  // ============================================
  // RENOVACIONES
  // ============================================

  /**
   * Busca un cliente por email o username
   */
  buscarClientePorEmailOUsername(busqueda: string): any | null {
    const stmt = this.db.prepare(`
      SELECT * FROM pagos 
      WHERE (cliente_email = ? OR servex_username = ?)
      AND estado = 'aprobado'
      ORDER BY fecha_creacion DESC
      LIMIT 1
    `);
    return stmt.get(busqueda, busqueda);
  }

  /**
   * Busca un revendedor por email o username
   */
  buscarRevendedorPorEmailOUsername(busqueda: string): any | null {
    const stmt = this.db.prepare(`
      SELECT * FROM pagos_revendedores 
      WHERE (cliente_email = ? OR servex_username = ?)
      AND estado = 'aprobado'
      ORDER BY fecha_creacion DESC
      LIMIT 1
    `);
    return stmt.get(busqueda, busqueda);
  }

  /**
   * Crea un registro de renovación
   */
  crearRenovacion(data: {
    tipo: "cliente" | "revendedor";
    servex_id: number;
    servex_username: string;
    operacion: "renovacion" | "upgrade";
    dias_agregados?: number;
    datos_anteriores?: string;
    datos_nuevos?: string;
    monto: number;
    metodo_pago: string;
    cliente_email: string;
    cliente_nombre: string;
    estado: string;
  }): any {
    const stmt = this.db.prepare(`
      INSERT INTO renovaciones (
        tipo, servex_id, servex_username, operacion,
        dias_agregados, datos_anteriores, datos_nuevos,
        monto, metodo_pago, cliente_email, cliente_nombre, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.tipo,
      data.servex_id,
      data.servex_username,
      data.operacion,
      data.dias_agregados || null,
      data.datos_anteriores || null,
      data.datos_nuevos || null,
      data.monto,
      data.metodo_pago,
      data.cliente_email,
      data.cliente_nombre,
      data.estado
    );

    return this.obtenerRenovacionPorId(result.lastInsertRowid as number);
  }

  /**
   * Obtiene una renovación por ID
   */
  obtenerRenovacionPorId(id: number): any | null {
    const stmt = this.db.prepare("SELECT * FROM renovaciones WHERE id = ?");
    return stmt.get(id);
  }

  /**
   * Actualiza el estado de una renovación
   */
  actualizarEstadoRenovacion(
    id: number,
    estado: string,
    mpPaymentId?: string
  ): void {
    const stmt = this.db.prepare(`
      UPDATE renovaciones 
      SET estado = ?,
          mp_payment_id = ?,
          fecha_actualizacion = datetime('now')
      WHERE id = ?
    `);

    stmt.run(estado, mpPaymentId || null, id);
  }

  /**
   * Guarda información adicional de la renovación después de procesarla
   */
  guardarInfoRenovacion(
    id: string,
    datosAnteriores: string,
    datosNuevos: string
  ): void {
    const stmt = this.db.prepare(`
      UPDATE renovaciones 
      SET datos_anteriores = ?,
          datos_nuevos = ?,
          fecha_actualizacion = datetime('now')
      WHERE id = ?
    `);

    stmt.run(datosAnteriores, datosNuevos, id);
  }

  // ============================================
  // UTILIDADES
  // ============================================

  close(): void {
    this.db.close();
  }
}
