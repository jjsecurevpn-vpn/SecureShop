import Database from 'better-sqlite3';

export interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
  onlineNow: number;
  lastUpdate: Date;
}

/**
 * VisitorsService - Conteo por IP
 * 
 * Lógica:
 * - Nueva IP: INSERT + incrementa total visitantes
 * - IP existente: UPDATE última_visita (sin incrementar total)
 * - Online: IPs activas en últimos 30 minutos
 */
export class VisitorsService {
  private db: Database.Database;
  private onlineUsers: Set<string> = new Set(); // Conjunto de IPs online

  constructor(database: Database.Database) {
    this.db = database;
    this.initializeTables();
    this.loadOnlineUsers();
  }

  /**
   * Inicializa tabla de visitantes en la BD (por IP única)
   * Si ya existe, migra de schema antiguo a nuevo
   */
  private initializeTables(): void {
    try {
      // Verificar si la tabla existe y si es el schema antiguo
      const tableInfo = this.db.prepare(`
        PRAGMA table_info(visitantes)
      `).all() as any;

      if (tableInfo.length > 0) {
        const hasSessionId = tableInfo.some((col: any) => col.name === 'session_id');
        if (hasSessionId) {
          console.log('[Visitors] 🔄 Migrando schema de session_id a ip_address...');
          this.migrateFromSessionId();
          return;
        }
      }

      // Crear tabla nueva si no existe
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS visitantes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ip_address TEXT UNIQUE NOT NULL,
          primera_visita TEXT NOT NULL DEFAULT (datetime('now')),
          ultima_visita TEXT NOT NULL DEFAULT (datetime('now')),
          fecha_online TEXT,
          status TEXT NOT NULL DEFAULT 'registrado',
          user_agent TEXT,
          session_count INTEGER DEFAULT 1,
          creado_en TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `);

      // Índices para optimizar búsquedas
      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_visitantes_status ON visitantes(status);
        CREATE INDEX IF NOT EXISTS idx_visitantes_fecha_online ON visitantes(fecha_online);
        CREATE INDEX IF NOT EXISTS idx_visitantes_ultima_visita ON visitantes(ultima_visita);
      `);

      console.log('[Visitors] ✅ Tablas de BD inicializadas (Conteo por IP)');
    } catch (error) {
      console.error('[Visitors] Error inicializando tablas:', error);
      throw error;
    }
  }

  /**
   * Migra datos del schema antiguo (session_id) al nuevo (ip_address)
   */
  private migrateFromSessionId(): void {
    try {
      // Crear tabla temporal con nuevo schema
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS visitantes_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ip_address TEXT UNIQUE NOT NULL,
          primera_visita TEXT NOT NULL DEFAULT (datetime('now')),
          ultima_visita TEXT NOT NULL DEFAULT (datetime('now')),
          fecha_online TEXT,
          status TEXT NOT NULL DEFAULT 'registrado',
          user_agent TEXT,
          session_count INTEGER DEFAULT 1,
          creado_en TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `);

      // Copiar datos (convertir session_id en ip_address, usar hash como IP simulada)
      this.db.exec(`
        INSERT INTO visitantes_new (
          ip_address, primera_visita, ultima_visita, 
          fecha_online, status, user_agent, session_count, creado_en
        )
        SELECT DISTINCT
          COALESCE(ip_address, 'migrated-' || substr(session_id, 1, 10)),
          COALESCE(fecha_visita, datetime('now')),
          COALESCE(fecha_visita, datetime('now')),
          fecha_online,
          status,
          user_agent,
          1,
          datetime('now')
        FROM visitantes
      `);

      // Eliminar tabla antigua
      this.db.exec(`DROP TABLE visitantes`);

      // Renombrar nueva tabla
      this.db.exec(`ALTER TABLE visitantes_new RENAME TO visitantes`);

      // Crear índices
      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_visitantes_status ON visitantes(status);
        CREATE INDEX IF NOT EXISTS idx_visitantes_fecha_online ON visitantes(fecha_online);
        CREATE INDEX IF NOT EXISTS idx_visitantes_ultima_visita ON visitantes(ultima_visita);
      `);

      console.log('[Visitors] ✅ Migración completada de session_id a ip_address');
    } catch (error) {
      console.error('[Visitors] ❌ Error en migración:', error);
      // Si falla la migración, crear tabla nueva limpia
      try {
        this.db.exec(`DROP TABLE IF EXISTS visitantes_new`);
        this.db.exec(`DROP TABLE IF EXISTS visitantes`);
        this.db.exec(`
          CREATE TABLE visitantes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip_address TEXT UNIQUE NOT NULL,
            primera_visita TEXT NOT NULL DEFAULT (datetime('now')),
            ultima_visita TEXT NOT NULL DEFAULT (datetime('now')),
            fecha_online TEXT,
            status TEXT NOT NULL DEFAULT 'registrado',
            user_agent TEXT,
            session_count INTEGER DEFAULT 1,
            creado_en TEXT NOT NULL DEFAULT (datetime('now'))
          )
        `);
        console.log('[Visitors] ⚠️ Tabla recreada limpia (datos previos perdidos)');
      } catch (innerError) {
        console.error('[Visitors] ❌ Error crítico recreando tabla:', innerError);
        throw innerError;
      }
    }
  }

  /**
   * Carga usuarios online desde BD
   */
  private loadOnlineUsers(): void {
    try {
      const stmt = this.db.prepare(`
        SELECT ip_address 
        FROM visitantes 
        WHERE status = 'online' 
        AND datetime(fecha_online) > datetime('now', '-30 minutes')
      `);
      
      const rows = stmt.all() as Array<{ ip_address: string }>;
      rows.forEach(row => {
        this.onlineUsers.add(row.ip_address);
      });
      
      console.log(`[Visitors] ${this.onlineUsers.size} IPs online cargadas de BD`);
    } catch (error) {
      console.error('[Visitors] Error cargando usuarios online:', error);
    }
  }

  /**
   * Registra/Actualiza visitante por IP
   * - Si es NUEVA IP: INSERT en BD (incrementa total)
   * - Si IP EXISTE: Solo UPDATE última_visita (sin incrementar)
   */
  registrarVisitante(ipAddress: string, userAgent?: string): VisitorStats {
    try {
      if (!ipAddress) {
        console.warn('[Visitors] IP address no disponible');
        return this.obtenerEstadisticas();
      }

      // Verificar si IP ya existe
      const existing = this.db.prepare(
        'SELECT id, session_count FROM visitantes WHERE ip_address = ?'
      ).get(ipAddress) as any;

      if (!existing) {
        // ✨ NUEVA IP: Registrar en BD (incrementa total visitantes)
        const stmt = this.db.prepare(`
          INSERT INTO visitantes (ip_address, user_agent, status)
          VALUES (?, ?, 'registrado')
        `);
        stmt.run(ipAddress, userAgent || null);
        console.log(`[Visitors] ✨ Nueva IP registrada: ${ipAddress}`);
      } else {
        // 🔄 IP EXISTENTE: Solo actualizar (sin incrementar total)
        const updateStmt = this.db.prepare(`
          UPDATE visitantes 
          SET ultima_visita = datetime('now'),
              session_count = session_count + 1
          WHERE ip_address = ?
        `);
        updateStmt.run(ipAddress);
        console.log(`[Visitors] 🔄 IP conocida: ${ipAddress} (sesión #${existing.session_count + 1})`);
      }

      return this.obtenerEstadisticas();
    } catch (error) {
      console.error('[Visitors] Error registrando visitante:', error);
      return this.obtenerEstadisticas();
    }
  }

  /**
   * Registra usuario como online (por IP)
   */
  registrarUsuarioOnline(ipAddress: string): VisitorStats {
    try {
      if (!ipAddress) {
        console.warn('[Visitors] IP address no disponible');
        return this.obtenerEstadisticas();
      }

      // Asegurar que existe el visitante
      this.registrarVisitante(ipAddress);

      // Actualizar status a online
      const stmt = this.db.prepare(`
        UPDATE visitantes 
        SET status = 'online', fecha_online = datetime('now')
        WHERE ip_address = ?
      `);
      stmt.run(ipAddress);

      this.onlineUsers.add(ipAddress);
      console.log(`[Visitors] 🟢 IP online: ${ipAddress} (Total online: ${this.onlineUsers.size})`);
      return this.obtenerEstadisticas();
    } catch (error) {
      console.error('[Visitors] Error registrando online:', error);
      return this.obtenerEstadisticas();
    }
  }

  /**
   * Desconecta usuario (por IP)
   */
  desconectarUsuario(ipAddress: string): VisitorStats {
    try {
      if (!ipAddress) {
        return this.obtenerEstadisticas();
      }

      const stmt = this.db.prepare(`
        UPDATE visitantes 
        SET status = 'offline'
        WHERE ip_address = ?
      `);
      stmt.run(ipAddress);

      this.onlineUsers.delete(ipAddress);
      console.log(`[Visitors] 🔴 IP offline: ${ipAddress} (Total online: ${this.onlineUsers.size})`);
      return this.obtenerEstadisticas();
    } catch (error) {
      console.error('[Visitors] Error desconectando usuario:', error);
      return this.obtenerEstadisticas();
    }
  }

  /**
   * Limpia sesiones inactivas (más de 30 minutos)
   */
  limpiarSesionesInactivas(): void {
    try {
      const stmt = this.db.prepare(`
        UPDATE visitantes 
        SET status = 'offline'
        WHERE status = 'online' 
        AND datetime(fecha_online) < datetime('now', '-30 minutes')
      `);
      const result = stmt.run() as any;
      
      if (result.changes > 0) {
        console.log(`[Visitors] 🧹 ${result.changes} IPs inactivas marcadas como offline`);
        this.loadOnlineUsers(); // Recargar
      }
    } catch (error) {
      console.error('[Visitors] Error limpiando sesiones:', error);
    }
  }

  /**
   * Obtiene estadísticas actuales desde BD (por IP única)
   * 
   * Total: COUNT DISTINCT ip_address (todas las que visitaron alguna vez)
   * Hoy: COUNT DISTINCT ip_address WHERE fecha = hoy
   * Online: COUNT DISTINCT ip_address WHERE status='online' Y últimos 30 min
   */
  obtenerEstadisticas(): VisitorStats {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Total de IPs únicas (visitantes únicos de todos los tiempos)
      const totalStmt = this.db.prepare(
        'SELECT COUNT(DISTINCT ip_address) as count FROM visitantes'
      );
      const totalResult = totalStmt.get() as any;
      const totalVisitors = totalResult?.count || 0;

      // IPs únicas de hoy
      const todayStmt = this.db.prepare(
        `SELECT COUNT(DISTINCT ip_address) as count 
         FROM visitantes 
         WHERE DATE(primera_visita) = ? OR DATE(ultima_visita) = ?`
      );
      const todayResult = todayStmt.get(today, today) as any;
      const todayVisitors = todayResult?.count || 0;

      // IPs online ahora (últimos 30 minutos)
      const onlineStmt = this.db.prepare(
        `SELECT COUNT(DISTINCT ip_address) as count 
         FROM visitantes 
         WHERE status = 'online' 
         AND datetime(fecha_online) > datetime('now', '-30 minutes')`
      );
      const onlineResult = onlineStmt.get() as any;
      const onlineNow = onlineResult?.count || 0;

      // Actualizar Set de online
      this.onlineUsers.clear();
      const onlineIps = this.db.prepare(
        `SELECT DISTINCT ip_address FROM visitantes 
         WHERE status = 'online' 
         AND datetime(fecha_online) > datetime('now', '-30 minutes')`
      ).all() as Array<{ ip_address: string }>;
      
      onlineIps.forEach(row => this.onlineUsers.add(row.ip_address));

      return {
        totalVisitors,
        todayVisitors,
        onlineNow,
        lastUpdate: new Date(),
      };
    } catch (error) {
      console.error('[Visitors] Error obteniendo estadísticas:', error);
      return {
        totalVisitors: 0,
        todayVisitors: 0,
        onlineNow: this.onlineUsers.size,
        lastUpdate: new Date(),
      };
    }
  }

  /**
   * Obtiene solo el contador de online
   */
  obtenerOnlineNow(): number {
    return this.onlineUsers.size;
  }

  /**
   * Sincroniza estadísticas (para operaciones periódicas)
   */
  sincronizar(): void {
    this.limpiarSesionesInactivas();
    const stats = this.obtenerEstadisticas();
    console.log(`[Visitors] Sincronización: Total=${stats.totalVisitors}, Hoy=${stats.todayVisitors}, Online=${stats.onlineNow}`);
  }
}
