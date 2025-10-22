import { DatabaseService } from './database.service';
import { ServexService } from './servex.service';
import { MercadoPagoService } from './mercadopago.service';

export class RenovacionService {
  constructor(
    private db: DatabaseService,
    private servex: ServexService,
    private mercadopago: MercadoPagoService
  ) {}

  /**
   * Busca un cliente o revendedor por username en Servex
   * @param busqueda - Email o username a buscar
   * @param soloClientes - Si es true, solo busca clientes, no revendedores
   */
  async buscarCliente(busqueda: string, soloClientes: boolean = false): Promise<{
    encontrado: boolean;
    tipo?: 'cliente' | 'revendedor';
    datos?: any;
  }> {
    // Primero buscar en la base de datos local (compras anteriores)
    const clienteDB = this.db.buscarClientePorEmailOUsername(busqueda);
    if (clienteDB) {
      return {
        encontrado: true,
        tipo: 'cliente',
        datos: {
          servex_cuenta_id: clienteDB.servex_cuenta_id,
          servex_username: clienteDB.servex_username,
          cliente_nombre: clienteDB.cliente_nombre,
          cliente_email: clienteDB.cliente_email,
          plan_nombre: clienteDB.plan_nombre
        }
      };
    }

    if (!soloClientes) {
      const revendedorDB = this.db.buscarRevendedorPorEmailOUsername(busqueda);
      if (revendedorDB) {
        return {
          encontrado: true,
          tipo: 'revendedor',
          datos: {
            servex_revendedor_id: revendedorDB.servex_revendedor_id,
            servex_username: revendedorDB.servex_username,
            servex_account_type: revendedorDB.servex_account_type,
            max_users: revendedorDB.max_users || 0,
            expiration_date: revendedorDB.expiration_date,
            cliente_nombre: revendedorDB.cliente_nombre,
            cliente_email: revendedorDB.cliente_email,
            plan_nombre: revendedorDB.plan_nombre
          }
        };
      }
    }

    // Si no está en la DB, buscar directamente en Servex por username
    try {
      const clienteServex = await this.servex.buscarClientePorUsername(busqueda);
      if (clienteServex) {
        return {
          encontrado: true,
          tipo: 'cliente',
          datos: {
            servex_cuenta_id: clienteServex.id,
            servex_username: clienteServex.username,
            connection_limit: clienteServex.connection_limit || 1,
            cliente_nombre: busqueda,
            cliente_email: ''
          }
        };
      }

      if (!soloClientes) {
        const revendedorServex = await this.servex.buscarRevendedorPorUsername(busqueda);
        if (revendedorServex) {
          return {
            encontrado: true,
            tipo: 'revendedor',
            datos: {
              servex_revendedor_id: revendedorServex.id,
              servex_username: revendedorServex.username,
              servex_account_type: revendedorServex.account_type,
              max_users: revendedorServex.max_users || 0,
              expiration_date: revendedorServex.expiration_date,
              cliente_nombre: busqueda,
              cliente_email: ''
            }
          };
        }
      }
    } catch (error: any) {
      console.error('[Renovacion] Error buscando en Servex:', error.message);
    }

    return { encontrado: false };
  }

  /**
   * Procesa una renovación de cliente
   */
  async procesarRenovacionCliente(input: {
    busqueda: string;
    dias: number;
    clienteEmail: string;
    clienteNombre: string;
    nuevoConnectionLimit?: number;
  }): Promise<{ renovacion: any; linkPago: string }> {
    console.log('[Renovacion] Input recibido:', JSON.stringify(input, null, 2));
    
    // 1. Buscar cliente existente
    const resultado = await this.buscarCliente(input.busqueda);
    
    if (!resultado.encontrado || resultado.tipo !== 'cliente') {
      throw new Error('Cliente no encontrado');
    }

    const clienteExistente = resultado.datos;

    // 2. Determinar si hay cambio de dispositivos
    const connectionLimitActual = clienteExistente.connection_limit || 1;
    const connectionLimitNuevo = input.nuevoConnectionLimit || connectionLimitActual;
    const hayCambioDispositivos = connectionLimitNuevo !== connectionLimitActual;
    const operacion = hayCambioDispositivos ? 'upgrade' : 'renovacion';
    
    console.log(`[Renovacion] Límite actual: ${connectionLimitActual}, Nuevo límite: ${connectionLimitNuevo}, Hay cambio: ${hayCambioDispositivos}`);

    // 3. Calcular precio según número de dispositivos (usar el nuevo si cambia)
    // Precios basados en planes: 1 dispositivo = 6000/30 = 200, 2 = 333.33, 3 = 400, 4 = 500
    let precioPorDia: number;
    
    switch(connectionLimitNuevo) {
      case 1:
        precioPorDia = 200;
        break;
      case 2:
        precioPorDia = 333.33;
        break;
      case 3:
        precioPorDia = 400;
        break;
      case 4:
        precioPorDia = 500;
        break;
      default:
        precioPorDia = 200 * connectionLimitNuevo; // Escalado lineal para más dispositivos
    }
    
    const monto = Math.round(input.dias * precioPorDia);

    console.log(`[Renovacion] ${hayCambioDispositivos ? 'Upgrade' : 'Renovación'}: ${connectionLimitActual} -> ${connectionLimitNuevo} dispositivos`);
    console.log(`[Renovacion] Precio por día: ${precioPorDia}, Días: ${input.dias}, Monto total: ${monto}`);

    // 4. Crear registro de renovación
    const renovacionData: any = {
      tipo: 'cliente',
      servex_id: clienteExistente.servex_cuenta_id,
      servex_username: clienteExistente.servex_username,
      operacion,
      dias_agregados: input.dias,
      monto,
      metodo_pago: 'mercadopago',
      cliente_email: input.clienteEmail,
      cliente_nombre: input.clienteNombre,
      estado: 'pendiente'
    };

    if (hayCambioDispositivos) {
      renovacionData.datos_anteriores = JSON.stringify({ connection_limit: connectionLimitActual });
      renovacionData.datos_nuevos = JSON.stringify({ connection_limit: connectionLimitNuevo });
    }

    const renovacion = this.db.crearRenovacion(renovacionData);
    const renovacionId = renovacion.id;

    console.log('[Renovacion] Renovación creada:', renovacionId);

    // 5. Crear preferencia en MercadoPago
    try {
      const descripcion = hayCambioDispositivos
        ? `${operacion === 'upgrade' ? 'Upgrade' : 'Cambio'} a ${connectionLimitNuevo} disp. + ${input.dias} días - ${clienteExistente.servex_username}`
        : `Renovación ${input.dias} días - ${clienteExistente.servex_username}`;

      const { id: preferenceId, initPoint } = await this.mercadopago.crearPreferencia(
        renovacionId.toString(),
        descripcion,
        monto,
        input.clienteEmail,
        input.clienteNombre,
        'renovacion-cliente'
      );

      console.log('[Renovacion] Preferencia de MercadoPago creada:', preferenceId);

      return {
        renovacion,
        linkPago: initPoint,
      };
    } catch (error: any) {
      this.db.actualizarEstadoRenovacion(renovacionId, 'rechazado');
      throw new Error(`Error creando link de pago: ${error.message}`);
    }
  }

  /**
   * Procesa una renovación de revendedor
   */
  async procesarRenovacionRevendedor(input: {
    busqueda: string;
    dias: number;
    clienteEmail: string;
    clienteNombre: string;
    tipoRenovacion?: 'validity' | 'credit';
    cantidadSeleccionada?: number;
  }): Promise<{ renovacion: any; linkPago: string }> {
    // 1. Buscar revendedor existente
    const resultado = await this.buscarCliente(input.busqueda);
    
    if (!resultado.encontrado || resultado.tipo !== 'revendedor') {
      throw new Error('Revendedor no encontrado');
    }

    const revendedorExistente = resultado.datos;

    // 2. Calcular precio según el plan seleccionado
    let monto = 0;
    const tipoRenovacion = input.tipoRenovacion || 'validity';
    const cantidad = input.cantidadSeleccionada || 5;

    if (tipoRenovacion === 'validity') {
      // Planes de validez (30 días)
      const preciosValidez: Record<number, number> = {
        5: 10000,
        10: 18000,
        20: 32000,
        30: 42000,
        50: 60000,
        75: 78000,
        100: 90000,
      };
      monto = preciosValidez[cantidad] || 10000;
    } else {
      // Planes de créditos
      const preciosCreditos: Record<number, number> = {
        5: 12000,
        10: 20000,
        20: 36000,
        30: 51000,
        40: 64000,
        50: 75000,
        60: 84000,
        80: 104000,
        100: 110000,
        150: 150000,
        200: 190000,
      };
      monto = preciosCreditos[cantidad] || 12000;
    }

    console.log(`[Renovacion] Tipo: ${tipoRenovacion}, Cantidad: ${cantidad}, Monto: ${monto}`);

    // 3. Preparar datos para almacenar
    const datosNuevos = {
      tipo_renovacion: tipoRenovacion,
      cantidad: cantidad,
    };

    // 4. Crear registro de renovación
    const renovacion = this.db.crearRenovacion({
      tipo: 'revendedor',
      servex_id: revendedorExistente.servex_revendedor_id,
      servex_username: revendedorExistente.servex_username,
      operacion: 'renovacion',
      dias_agregados: input.dias,
      datos_nuevos: JSON.stringify(datosNuevos),
      monto,
      metodo_pago: 'mercadopago',
      cliente_email: input.clienteEmail,
      cliente_nombre: input.clienteNombre,
      estado: 'pendiente'
    });

    const renovacionId = renovacion.id;
    console.log('[Renovacion] Renovación de revendedor creada:', renovacionId);

    // 5. Crear preferencia en MercadoPago
    const descripcion = tipoRenovacion === 'validity' 
      ? `Renovación 30 días - ${cantidad} usuarios - ${revendedorExistente.servex_username}`
      : `Recarga ${cantidad} créditos - ${revendedorExistente.servex_username}`;

    try {
      const { id: preferenceId, initPoint } = await this.mercadopago.crearPreferencia(
        renovacionId.toString(),
        descripcion,
        monto,
        input.clienteEmail,
        input.clienteNombre,
        'renovacion-revendedor'
      );

      console.log('[Renovacion] Preferencia de MercadoPago creada:', preferenceId);

      return {
        renovacion,
        linkPago: initPoint,
      };
    } catch (error: any) {
      this.db.actualizarEstadoRenovacion(renovacionId, 'rechazado');
      throw new Error(`Error creando link de pago: ${error.message}`);
    }
  }

  /**
   * Confirma una renovación y ejecuta la renovación en Servex
   */
  async confirmarRenovacion(renovacionId: number, mpPaymentId: string): Promise<void> {
    console.log('[Renovacion] Confirmando renovación:', renovacionId);

    const renovacion = this.db.obtenerRenovacionPorId(renovacionId);
    if (!renovacion) {
      throw new Error('Renovación no encontrada');
    }

    try {
      // 1. Actualizar estado a aprobado
      this.db.actualizarEstadoRenovacion(renovacionId, 'aprobado', mpPaymentId);

      // 2. Si es un upgrade (cambio de dispositivos), actualizar primero el connection_limit
      if (renovacion.operacion === 'upgrade' && renovacion.tipo === 'cliente' && renovacion.datos_nuevos) {
        try {
          const datosNuevos = JSON.parse(renovacion.datos_nuevos);
          if (datosNuevos.connection_limit) {
            console.log(`[Renovacion] Actualizando connection_limit a ${datosNuevos.connection_limit} para usuario ${renovacion.servex_username}`);
            
            // Buscar cliente por username para obtener todos sus datos
            const clienteActual = await this.servex.buscarClientePorUsername(renovacion.servex_username);
            if (!clienteActual) {
              throw new Error(`Cliente no encontrado: ${renovacion.servex_username}`);
            }
            
            // Construir payload completo con todos los campos obligatorios
            const payload = {
              username: clienteActual.username,
              password: clienteActual.password,
              category_id: clienteActual.category_id,
              connection_limit: datosNuevos.connection_limit, // El nuevo límite
              type: clienteActual.type,
              ...(clienteActual.observation && { observation: clienteActual.observation }),
              ...(clienteActual.v2ray_uuid && { v2ray_uuid: clienteActual.v2ray_uuid })
            };
            
            console.log(`[Renovacion] Actualizando cliente ID ${renovacion.servex_id} con payload:`, JSON.stringify(payload));
            await this.servex.actualizarCliente(renovacion.servex_id, payload);
            console.log('[Renovacion] ✅ Connection limit actualizado exitosamente');
          }
        } catch (parseError) {
          console.error('[Renovacion] Error actualizando connection_limit:', parseError);
          throw parseError; // Re-lanzar el error para que se maneje arriba
        }
      }

      // 3. Procesar renovación de revendedor si tiene datos_nuevos
      if (renovacion.tipo === 'revendedor' && renovacion.datos_nuevos) {
        try {
          const datosNuevos = JSON.parse(renovacion.datos_nuevos);
          const tipoRenovacion = datosNuevos.tipo_renovacion;
          const cantidad = datosNuevos.cantidad;
          
          console.log(`[Renovacion] Procesando ${tipoRenovacion} para revendedor: ${cantidad}`);
          console.log(`[Renovacion] servex_id: ${renovacion.servex_id}, dias_agregados: ${renovacion.dias_agregados}`);

          if (tipoRenovacion === 'validity') {
            // Renovación de validez: Siempre 30 días fijos + REEMPLAZAR max_users
            console.log(`[Renovacion] Validity: Agregando 30 días fijos y estableciendo límite a ${cantidad} usuarios`);
            
            // Calcular nueva fecha de vencimiento (hoy + 30 días)
            const fechaVencimiento = new Date();
            fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
            const expirationDate = fechaVencimiento.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            
            console.log(`[Renovacion] Nueva fecha de vencimiento: ${expirationDate}`);
            
            // Actualizar: cambiar a validity, establecer límite de usuarios y fecha de vencimiento
            await this.servex.actualizarRevendedor(renovacion.servex_id, {
              max_users: cantidad,
              account_type: 'validity',
              expiration_date: expirationDate
            }, renovacion.servex_username);
          } else if (tipoRenovacion === 'credit') {
            // Recarga de créditos: Agregar días según plan + SUMAR créditos
            console.log(`[Renovacion] Credit: Agregando ${renovacion.dias_agregados} días y sumando ${cantidad} créditos`);
            
            // Obtener datos actuales del revendedor
            const revendedorActual = await this.servex.buscarRevendedorPorUsername(renovacion.servex_username);
            const creditosActuales = revendedorActual?.max_users || 0;
            const creditosTotales = creditosActuales + cantidad;
            
            console.log(`[Renovacion] Créditos actuales: ${creditosActuales}, sumando: ${cantidad}, total: ${creditosTotales}`);
            
            // Calcular nueva fecha de vencimiento (fecha actual + días del plan)
            const fechaActual = revendedorActual?.expiration_date ? new Date(revendedorActual.expiration_date) : new Date();
            fechaActual.setDate(fechaActual.getDate() + renovacion.dias_agregados);
            const expirationDate = fechaActual.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            
            console.log(`[Renovacion] Nueva fecha de vencimiento: ${expirationDate}`);
            
            // Actualizar: mantener account_type credit, sumar créditos y establecer nueva fecha
            await this.servex.actualizarRevendedor(renovacion.servex_id, {
              max_users: creditosTotales,
              account_type: 'credit',
              expiration_date: expirationDate
            }, renovacion.servex_username);
          }
          
          console.log('[Renovacion] ✅ Revendedor actualizado exitosamente');
        } catch (error) {
          console.error('[Renovacion] Error procesando datos de revendedor:', error);
          throw error;
        }
      } else {
        // 4. Ejecutar renovación simple de días en Servex
        if (renovacion.tipo === 'cliente') {
          await this.servex.renovarCliente(renovacion.servex_id, renovacion.dias_agregados);
        } else if (renovacion.tipo === 'revendedor') {
          await this.servex.renovarRevendedor(renovacion.servex_id, renovacion.dias_agregados);
        }

        console.log(`[Renovacion] ✅ ${renovacion.tipo} renovado exitosamente`);
      }

    } catch (error: any) {
      console.error('[Renovacion] ❌ Error ejecutando renovación:', error.message);
      this.db.actualizarEstadoRenovacion(renovacionId, 'pendiente');
      throw error;
    }
  }

  /**
   * Procesa webhook de MercadoPago para renovaciones
   */
  async procesarWebhook(body: any): Promise<void> {
    console.log('[Renovacion] Procesando webhook...');

    const resultado = await this.mercadopago.procesarWebhook(body);

    if (!resultado.procesado || !resultado.pagoId) {
      console.log('[Renovacion] Webhook no procesado o sin referencia');
      return;
    }

    const { pagoId, mpPaymentId, estado } = resultado;

    // Convertir pagoId a número (el ID de renovación es un número autoincremental)
    const renovacionId = parseInt(pagoId, 10);
    if (isNaN(renovacionId)) {
      console.error('[Renovacion] ID de renovación inválido:', pagoId);
      return;
    }

    const renovacion = this.db.obtenerRenovacionPorId(renovacionId);
    if (!renovacion) {
      console.error('[Renovacion] Renovación no encontrada:', renovacionId);
      return;
    }

    console.log('[Renovacion] Estado del pago en MercadoPago:', estado);

    if (estado === 'approved') {
      if (renovacion.estado === 'pendiente' || renovacion.estado === 'rechazado') {
        await this.confirmarRenovacion(renovacionId, mpPaymentId!);
      }
    } else if (estado === 'rejected' || estado === 'cancelled') {
      if (renovacion.estado === 'pendiente') {
        this.db.actualizarEstadoRenovacion(renovacionId, 'rechazado', mpPaymentId);
        console.log('[Renovacion] Renovación marcada como rechazada');
      }
    }
  }

  /**
   * Verifica y procesa una renovación manualmente (para cuando el cliente vuelve de MP)
   */
  async verificarYProcesarRenovacion(renovacionId: number, forzarReproceso: boolean = false): Promise<any | null> {
    const renovacion = this.db.obtenerRenovacionPorId(renovacionId);
    if (!renovacion) {
      return null;
    }

    console.log(`[Renovacion] verificarYProcesarRenovacion: ${renovacionId}, forzarReproceso=${forzarReproceso}, estado=${renovacion.estado}, mp_payment_id=${renovacion.mp_payment_id}`);

    // Si está aprobada y se fuerza reproceso, ejecutar de nuevo
    if (renovacion.estado === 'aprobado' && forzarReproceso && renovacion.mp_payment_id) {
      console.log(`[Renovacion] 🔄 Reprocesando renovación aprobada: ${renovacionId}`);
      await this.confirmarRenovacion(renovacionId, renovacion.mp_payment_id);
      return this.db.obtenerRenovacionPorId(renovacionId);
    }

    // Si la renovación ya está aprobada, solo devolver la información
    if (renovacion.estado === 'aprobado') {
      return renovacion;
    }

    // Si está pendiente, verificar en MercadoPago
    if (renovacion.estado === 'pendiente') {
      const pagoMP = await this.mercadopago.verificarPagoPorReferencia(renovacionId.toString());

      if (pagoMP && pagoMP.status === 'approved') {
        // Confirmar la renovación
        await this.confirmarRenovacion(renovacionId, pagoMP.id);
        // Devolver la renovación actualizada
        return this.db.obtenerRenovacionPorId(renovacionId);
      }
    }

    return renovacion;
  }

  /**
   * Obtiene una renovación por ID
   */
  obtenerRenovacionPorId(renovacionId: number): any | null {
    return this.db.obtenerRenovacionPorId(renovacionId);
  }

  /**
   * Obtiene información actualizada del cliente desde Servex
   */
  async obtenerClienteActualizado(username: string): Promise<any | null> {
    try {
      return await this.servex.buscarClientePorUsername(username);
    } catch (error) {
      console.error('[Renovacion] Error obteniendo cliente actualizado:', error);
      return null;
    }
  }
}
