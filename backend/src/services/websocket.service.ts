import WebSocket from 'ws';
import axios from 'axios';

interface ServerStats {
  serverName: string;
  location: string;
  status: 'online' | 'offline';
  connectedUsers: number;
  lastUpdate: Date;
  serverId?: number; // ID único del servidor desde Servex
  // Datos de rendimiento en tiempo real
  cpuUsage?: number; // Porcentaje 0-100
  memoryUsage?: number; // Porcentaje 0-100
  cpuCores?: number;
  totalMemoryGb?: number;
  totalUsuarios?: number; // Total de usuarios en el servidor
  netRecvMbps?: number;
  netSentMbps?: number;
}

export class WebSocketService {
  private servexToken: string;
  private ws: WebSocket | null = null;
  private stats: Map<string, ServerStats> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private connectionAttempts: number = 0;
  private maxRetries: number = 5;

  // Mapeo de IDs de servidor a nombres reales (override del nombre que viene de Servex)
  private readonly SERVIDOR_NOMBRES_REALES: { [key: number]: { nombre: string; ubicacion: string } } = {
    515: { nombre: 'Servidor 1 BR', ubicacion: 'Brasil' },
    528: { nombre: 'Servidor 1 AR', ubicacion: 'Argentina' },
    // Agregar más servidores conforme se descubran sus IDs
  };

  constructor() {
    this.servexToken = process.env.SERVEX_API_KEY || '';
  }

  /**
   * Obtiene token temporal para WebSocket
   */
  private async obtenerTokenSSE(): Promise<string> {
    try {
      const response = await axios.get('https://servex.ws/api/auth/sse-token', {
        headers: {
          'Authorization': `Bearer ${this.servexToken}`,
        },
      });
      console.log('[WebSocket] Token SSE obtenido exitosamente');
      return response.data.token;
    } catch (error: any) {
      console.error('[WebSocket] Error obteniendo token SSE:', error.message);
      throw error;
    }
  }

  /**
   * Conecta al WebSocket de JJSecure Panel para obtener estado de servidores en tiempo real
   */
  async conectar(): Promise<void> {
    try {
      const token = await this.obtenerTokenSSE();
      const wsUrl = `wss://front.servex.ws/ws/server-status?token=${token}`;

      console.log('[WebSocket] Conectando a JJSecure Panel (server-status)...');
      this.ws = new WebSocket(wsUrl);
      this.connectionAttempts = 0;

      this.ws.on('open', () => {
        // Log desactivado - servicio funcionando correctamente
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          this.procesarMensaje(message);
        } catch (error) {
          // Log desactivado - error de parseo ignorado
        }
      });

      this.ws.on('error', (error) => {
        console.error('[WebSocket] Error:', error.message);
      });

      this.ws.on('close', () => {
        console.log('[WebSocket] Desconectado. Intentando reconectar...');
        this.ws = null;
        
        // Reconectar con backoff exponencial
        if (this.connectionAttempts < this.maxRetries) {
          const delay = Math.pow(2, this.connectionAttempts) * 1000; // 1s, 2s, 4s, 8s, 16s
          this.connectionAttempts++;
          console.log(`[WebSocket] Reintentando en ${delay}ms (intento ${this.connectionAttempts}/${this.maxRetries})`);
          
          this.reconnectTimeout = setTimeout(() => {
            this.conectar();
          }, delay);
        } else {
          console.error('[WebSocket] Máximo de reintentos alcanzado. Servidores no disponibles.');
        }
      });

    } catch (error: any) {
      console.error('[WebSocket] Error al conectar:', error.message);
      console.error('[WebSocket] No se puede conectar a JJSecure Panel. Los datos en tiempo real no están disponibles.');
    }
  }

  /**
   * Procesa mensajes del WebSocket
   */
  private procesarMensaje(message: any): void {
    try {
      // Log desactivado - servicio funcionando correctamente
      if (message.name && message.online_users_count !== undefined) {
        this.actualizarEstadisticasServidores([message]);
      }
    } catch (error) {
      // Log desactivado - error ignorado
    }
  }

  /**
   * Actualiza estadísticas de servidores con datos reales
   * Usa IDs de servidor para obtener nombres "reales" en lugar de confiar en el nombre de Servex
   */
  private actualizarEstadisticasServidores(servidores: any[]): void {
    servidores.forEach((servidor: any) => {
      const serverId = servidor.id || servidor.serverId;
      const usuariosOnline = servidor.online_users_count || servidor.users || 0;
      const online = servidor.online !== false && servidor.status !== 'offline';
      
      // Intentar obtener nombre real del mapeo, si no existe usar el de Servex
      let nombre: string;
      let location: string;
      
      if (serverId && this.SERVIDOR_NOMBRES_REALES[serverId]) {
        // Usar nombre real mapeado
        nombre = this.SERVIDOR_NOMBRES_REALES[serverId].nombre;
        location = this.SERVIDOR_NOMBRES_REALES[serverId].ubicacion;
        // Log desactivado - servidor mapeado correctamente
      } else {
        // Fallback: usar nombre de Servex y detectar ubicación
        nombre = servidor.name || servidor.hostname || servidor.server_name || 'Unknown';
        const nombreLower = nombre.toLowerCase();
        
        // Log desactivado - servidor no mapeado pero funcionando
        
        // Detectar ubicación por nombre como fallback
        if (nombreLower.includes('ar') || /\bar\b|argentina|arg/.test(nombreLower)) {
          location = 'Argentina';
        } else if (nombreLower.includes('br') || nombreLower.includes('brasil')) {
          location = 'Brasil';
        } else if (nombreLower.includes('usa') || nombreLower.includes('us')) {
          location = 'USA';
        } else if (nombreLower.includes('mx') || nombreLower.includes('mexico')) {
          location = 'México';
        } else if (nombreLower.includes('cl') || nombreLower.includes('chile')) {
          location = 'Chile';
        } else if (nombreLower.includes('eu') || nombreLower.includes('europe')) {
          location = 'Europa';
        } else {
          location = 'Desconocido';
        }
      }
      
      // Log desactivado - servidor actualizado correctamente
      
      // Usar serverId como clave única (no el nombre, que puede cambiar)
      const serverKey = `server-${serverId || nombre}`;
      
      // Actualizar estadísticas con datos reales de JJSecure Panel
      this.stats.set(serverKey, {
        serverId: serverId,
        serverName: nombre,
        location: location,
        status: online ? 'online' : 'offline',
        connectedUsers: usuariosOnline,
        lastUpdate: new Date(),
        // Datos de rendimiento
        cpuUsage: servidor.cpu_usage || 0,
        memoryUsage: servidor.memory_usage || 0,
        cpuCores: servidor.cpu_cores,
        totalMemoryGb: servidor.total_memory_gb,
        totalUsuarios: servidor.total_usuarios,
        netRecvMbps: servidor.net_recv_mbps,
        netSentMbps: servidor.net_sent_mbps,
      });
    });
  }

  /**
   * Obtiene las estadísticas actuales de los servidores
   */
  obtenerEstadisticas(): ServerStats[] {
    return Array.from(this.stats.values());
  }

  /**
   * Desconecta el WebSocket
   */
  desconectar(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    console.log('[WebSocket] Desconectado manualmente');
  }
}
