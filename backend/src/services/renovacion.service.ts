import { DatabaseService } from './database.service';
import { ServexService } from './servex.service';
import { MercadoPagoService } from './mercadopago.service';
import { configService } from './config.service';
import emailService from './email.service';
import { cuponesService } from './cupones.service';
import { supabaseService } from './supabase.service';
import { RenovacionAutoRetryConfig } from '../types';

export class RenovacionService {
  constructor(
    private db: DatabaseService,
    private servex: ServexService,
    private mercadopago: MercadoPagoService
  ) {}

  private autoRetryTimer: NodeJS.Timeout | null = null;
  private autoRetryRunning = false;
  private autoRetryAttempts = new Map<number, number>();

  iniciarAutoRevisionesPendientes(config: RenovacionAutoRetryConfig): void {
    if (!config.enabled) {
      console.log('[Renovacion] Auto-revisión de pendientes deshabilitada por configuración');
      return;
    }

    if (this.autoRetryTimer) {
      return;
    }

    const revisarPendientes = async () => {
      if (this.autoRetryRunning) {
        return;
      }

      this.autoRetryRunning = true;

      try {
        const pendientes = this.db.obtenerRenovacionesPendientes({
          updatedBeforeMinutes: config.minPendingAgeMinutes,
          limit: config.batchSize,
        });

        if (!pendientes.length) {
          return;
        }

        console.log(`[Renovacion] 🔄 Revisando ${pendientes.length} renovaciones pendientes automaticamente`);

        for (const pendiente of pendientes) {
          const renovacionId = Number(pendiente.id);
          if (!Number.isFinite(renovacionId)) {
            continue;
          }

          if (typeof config.maxAttempts === 'number' && config.maxAttempts > 0) {
            const intentosPrevios = this.autoRetryAttempts.get(renovacionId) ?? 0;
            if (intentosPrevios >= config.maxAttempts) {
              console.warn(
                `[Renovacion] ⚠️ Renovación ${renovacionId} alcanzó el máximo de reintentos automáticos (${config.maxAttempts})`
              );
              this.db.refrescarTimestampRenovacion(renovacionId);
              continue;
            }
          }

          try {
            const resultado = await this.verificarYProcesarRenovacion(renovacionId, false);

            if (resultado && resultado.estado === 'aprobado') {
              this.autoRetryAttempts.delete(renovacionId);
              console.log(`[Renovacion] ✅ Renovación ${renovacionId} aprobada mediante auto-revisión`);
            } else {
              const intentosPrevios = this.autoRetryAttempts.get(renovacionId) ?? 0;
              this.autoRetryAttempts.set(renovacionId, intentosPrevios + 1);
              this.db.refrescarTimestampRenovacion(renovacionId);
              console.log(`[Renovacion] ⏳ Renovación ${renovacionId} sigue pendiente tras auto-revisión`);
            }
          } catch (error: any) {
            console.error(
              `[Renovacion] ❌ Error en auto-revisión de renovación ${renovacionId}:`,
              error?.message || error
            );
            this.db.refrescarTimestampRenovacion(renovacionId);
          }
        }
      } finally {
        this.autoRetryRunning = false;
      }
    };

    const programarIntervalo = () => {
      const intervalo = Math.max(config.intervalMs, 60_000);
      this.autoRetryTimer = setInterval(() => {
        revisarPendientes().catch((error) =>
          console.error('[Renovacion] ❌ Error inesperado en auto-revisión programada:', error?.message || error)
        );
      }, intervalo);
    };

    const delayInicial = Math.max(0, config.initialDelayMs);
    setTimeout(() => {
      revisarPendientes()
        .catch((error) =>
          console.error('[Renovacion] ❌ Error inesperado en auto-revisión inicial:', error?.message || error)
        )
        .finally(programarIntervalo);
    }, delayInicial);
  }

  /**
   * Busca un cliente o revendedor por username en Servex
   * @param busqueda - Email o username a buscar
   * @param soloClientes - Si es true, solo busca clientes, no revendedores
   * @param soloRevendedores - Si es true, solo busca revendedores, no clientes
   */
  async buscarCliente(busqueda: string, soloClientes: boolean = false, soloRevendedores: boolean = false): Promise<{
    encontrado: boolean;
    tipo?: 'cliente' | 'revendedor';
    datos?: any;
  }> {
    console.log(`[Renovacion] 🔍 Buscando cuenta: "${busqueda}", soloClientes: ${soloClientes}, soloRevendedores: ${soloRevendedores}`);

    // Primero buscar en la base de datos local (compras anteriores)
    if (!soloRevendedores) {
      const clienteDB = this.db.buscarClientePorUsername(busqueda);
      if (clienteDB) {
        console.log(`[Renovacion] ✅ Cliente encontrado en DB local: ${clienteDB.servex_username} (ID: ${clienteDB.servex_cuenta_id})`);
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
    }

    if (!soloClientes) {
      const revendedorDB = this.db.buscarRevendedorPorUsername(busqueda);
      if (revendedorDB) {
        let servexId = revendedorDB.servex_revendedor_id;
        const maxUsersDb =
          revendedorDB.servex_max_users ?? revendedorDB.max_users ?? 0;
        
        // 🔧 AUTO-REPARACIÓN: Si el ID es 0 o null, intentar obtenerlo de Servex
        if (!servexId || servexId === 0) {
          console.warn(`[Renovacion] ⚠️ Revendedor ${revendedorDB.servex_username} tiene ID inválido (${servexId}), intentando reparar...`);
          try {
            const revendedorServex = await this.servex.buscarRevendedorPorUsername(revendedorDB.servex_username);
            if (revendedorServex && revendedorServex.id) {
              servexId = revendedorServex.id;
              // Actualizar la DB con el ID correcto
              this.db.actualizarServexIdRevendedor(revendedorDB.servex_username, servexId);
              console.log(`[Renovacion] ✅ ID reparado automáticamente: ${revendedorDB.servex_username} -> ID: ${servexId}`);
            } else {
              console.error(`[Renovacion] ❌ No se pudo encontrar el revendedor ${revendedorDB.servex_username} en Servex para reparar`);
            }
          } catch (repairError: any) {
            console.error(`[Renovacion] ❌ Error reparando ID del revendedor:`, repairError.message);
          }
        }
        
        console.log(`[Renovacion] ✅ Revendedor encontrado en DB local: ${revendedorDB.servex_username} (ID: ${servexId}, max_users: ${maxUsersDb})`);
        return {
          encontrado: true,
          tipo: 'revendedor',
          datos: {
            servex_revendedor_id: servexId,
            servex_username: revendedorDB.servex_username,
            servex_account_type: revendedorDB.servex_account_type,
            max_users: Number(maxUsersDb) || 0,
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
      console.log(`[Renovacion] 🔍 Buscando en Servex API...`);
      if (!soloRevendedores) {
        const clienteServex = await this.servex.buscarClientePorUsername(busqueda);
        if (clienteServex) {
          console.log(`[Renovacion] ✅ Cliente encontrado en Servex: ${clienteServex.username} (ID: ${clienteServex.id})`);
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
      }

      if (!soloClientes) {
        const revendedorServex = await this.servex.buscarRevendedorPorUsername(busqueda);
        if (revendedorServex) {
          console.log(`[Renovacion] ✅ Revendedor encontrado en Servex: ${revendedorServex.username} (ID: ${revendedorServex.id}, max_users: ${revendedorServex.max_users})`);
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
      console.error('[Renovacion] ❌ Error buscando en Servex:', error.message);
    }

    console.log(`[Renovacion] ❌ Cuenta no encontrada: "${busqueda}"`);
    return { encontrado: false };
  }

  /**
   * Procesa una renovación de cliente
   */
  async procesarRenovacionCliente(input: {
    busqueda: string;
    dias: number;
    precio?: number; // Precio calculado desde el frontend con overrides aplicados
    clienteEmail: string;
    clienteNombre: string;
    nuevoConnectionLimit?: number;
    precioOriginal?: number;
    codigoCupon?: string;
    cuponId?: number;
    descuentoAplicado?: number;
    planId?: number;
  }): Promise<{ renovacion: any; linkPago: string; descuentoAplicado?: number; cuponAplicado?: any }> {
    console.log(`[Renovacion] 🚀 Iniciando procesamiento de renovación de cliente: ${input.busqueda} (${input.dias} días)`);
    console.log('[Renovacion] Input recibido:', JSON.stringify(input, null, 2));
    
    // 1. Buscar cliente existente
    const resultado = await this.buscarCliente(input.busqueda, true);
    
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

    // 3. Calcular precio base considerando overrides actuales
    const precioBaseCalculado = this.calcularPrecioBaseRenovacion(input.dias, connectionLimitNuevo);
    let precioBase = precioBaseCalculado;

    if (input.precioOriginal && input.precioOriginal > 0) {
      if (Math.abs(input.precioOriginal - precioBaseCalculado) > 1) {
        console.log(
          `[Renovacion] ⚠️ Precio original recibido (${input.precioOriginal}) difiere del calculado (${precioBaseCalculado}). Usando recibido.`
        );
      }
      precioBase = Math.round(input.precioOriginal);
    }

    let cuponAplicado: any = null;
    let descuentoAplicado = 0;

    if (input.codigoCupon) {
      const codigoNormalizado = input.codigoCupon.trim().toUpperCase();
      console.log(`[Renovacion] Validando cupón ${codigoNormalizado} para renovación`);

      const validacion = await cuponesService.validarCupon(
        codigoNormalizado,
        input.planId,
        input.clienteEmail
      );

      if (!validacion.valido || !validacion.cupon) {
        throw new Error(validacion.mensaje_error || 'Cupón inválido');
      }

      cuponAplicado = validacion.cupon;
      if (input.cuponId && cuponAplicado.id && input.cuponId !== cuponAplicado.id) {
        console.warn(
          `[Renovacion] ⚠️ ID de cupón recibido (${input.cuponId}) difiere del validado (${cuponAplicado.id})`
        );
      }

      descuentoAplicado = Math.min(
        precioBase,
        Math.round(cuponesService.calcularDescuento(cuponAplicado, precioBase))
      );

      console.log(
        `[Renovacion] Cupón ${cuponAplicado.codigo} válido. Descuento: $${descuentoAplicado}. Precio base: $${precioBase}`
      );
    }

    let monto = Math.max(0, Math.round(precioBase - descuentoAplicado));

    if (!monto || monto <= 0) {
      throw new Error('El total a pagar con el cupón debe ser mayor a 0');
    }

    if (input.precio && Math.abs(input.precio - monto) > 1) {
      console.log(
        `[Renovacion] ⚠️ Diferencia entre precio recibido (${input.precio}) y calculado (${monto}). Se usará el calculado.`
      );
    }

    console.log(`[Renovacion] ${hayCambioDispositivos ? 'Upgrade' : 'Renovación'}: ${connectionLimitActual} -> ${connectionLimitNuevo} dispositivos`);
    console.log(`[Renovacion] Precio base: $${precioBase}. Descuento aplicado: $${descuentoAplicado}. Monto final: $${monto}`);

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
      estado: 'pendiente',
      cupon_id: cuponAplicado?.id || null,
      descuento_aplicado: descuentoAplicado
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

      console.log(`[Renovacion] ✅ Renovación de cliente procesada exitosamente: ID ${renovacionId}, link: ${initPoint}`);
      return {
        renovacion,
        linkPago: initPoint,
        descuentoAplicado: descuentoAplicado > 0 ? descuentoAplicado : undefined,
        cuponAplicado: cuponAplicado
      };
    } catch (error: any) {
      this.db.actualizarEstadoRenovacion(renovacionId, 'rechazado');
      throw new Error(`Error creando link de pago: ${error.message}`);
    }
  }

  private calcularPrecioBaseRenovacion(dias: number, connectionLimit: number): number {
    if (!dias || dias <= 0) {
      return 0;
    }

    const planesBase = this.db.obtenerPlanes();
    const planesConOverrides = configService.aceptarOverridesAListaPlanes(
      planesBase,
      { forNewCustomers: false }
    );

    const planCoincidente = planesConOverrides.find(
      (plan: any) => plan.dias === dias && plan.connection_limit === connectionLimit
    );

    if (planCoincidente) {
      return Math.round(planCoincidente.precio);
    }

    // Fallback: tomar plan de 30 días con el mismo límite para estimar precio diario
    const planReferencia = planesConOverrides.find(
      (plan: any) => plan.dias === 30 && plan.connection_limit === connectionLimit
    );

    let precioPorDia: number;
    if (planReferencia) {
      precioPorDia = planReferencia.precio / 30;
    } else {
      switch (connectionLimit) {
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
          precioPorDia = 200 * Math.max(1, connectionLimit);
          break;
      }
    }

    return Math.max(0, Math.round(dias * precioPorDia));
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
    precio?: number;
    precioOriginal?: number;
    codigoCupon?: string;
    cuponId?: number;
    descuentoAplicado?: number;
    planId?: number;
  }): Promise<{ renovacion: any; linkPago: string; descuentoAplicado?: number; cuponAplicado?: any }> {
    console.log(`[Renovacion] 🚀 Iniciando procesamiento de renovación de revendedor: ${input.busqueda} (${input.dias} días, tipo: ${input.tipoRenovacion})`);
    console.log('[Renovacion] Input recibido:', JSON.stringify(input, null, 2));
    const resultado = await this.buscarCliente(input.busqueda, false);
    
    if (!resultado.encontrado || resultado.tipo !== 'revendedor') {
      throw new Error('Revendedor no encontrado');
    }

    const revendedorExistente = resultado.datos;

    // 2. Obtener planes de revendedores con overrides de configuración aplicados
    const planesBase = this.db.obtenerPlanesRevendedores();
    console.log(`[Renovacion] 📊 Planes base obtenidos: ${planesBase.length} planes`);
    const planesConOverrides =
      configService.aceptarOverridesAListaPlanesRevendedor(planesBase, {
        forNewCustomers: false,
      });
    console.log(`[Renovacion] 📊 Planes con overrides: ${planesConOverrides.length} planes`);
    
    // 3. Calcular precio según el plan seleccionado
    const tipoRenovacion = input.tipoRenovacion || 'validity';
    const cantidad = input.cantidadSeleccionada || 5;
    
    console.log(`[Renovacion] 🔍 Buscando plan con: tipo=${tipoRenovacion}, cantidad=${cantidad}`);
    console.log(`[Renovacion] 📋 Planes disponibles: ${JSON.stringify(planesConOverrides.map((p: any) => ({id: p.id, max_users: p.max_users, account_type: p.account_type, precio: p.precio})))}`);

    let planSeleccionado: any = null;

    if (input.planId) {
      planSeleccionado = planesConOverrides.find((p: any) => Number(p.id) === Number(input.planId)) || null;
    }

    if (!planSeleccionado) {
      planSeleccionado = planesConOverrides.find((p: any) =>
        p.account_type === tipoRenovacion && p.max_users === cantidad
      ) || null;
    }

    if (!planSeleccionado) {
      console.warn(`[Renovacion] ⚠️ No se encontró un plan exacto para tipo=${tipoRenovacion}, cantidad=${cantidad}. Usando defaults.`);
    }

    let precioBase = planSeleccionado?.precio ? Math.round(Number(planSeleccionado.precio)) : 0;

    if (!precioBase) {
      precioBase = tipoRenovacion === 'validity' ? 8500 : 10200;
    }

    if (input.precioOriginal && input.precioOriginal > 0) {
      if (Math.abs(input.precioOriginal - precioBase) > 1) {
        console.warn(
          `[Renovacion] ⚠️ Precio original recibido (${input.precioOriginal}) difiere del calculado (${precioBase}). Usando recibido.`
        );
      }
      precioBase = Math.round(input.precioOriginal);
    }

    let cuponAplicado: any = null;
    let descuentoAplicado = 0;

    if (input.codigoCupon) {
      const codigoNormalizado = input.codigoCupon.trim().toUpperCase();
      console.log(`[Renovacion] Validando cupón ${codigoNormalizado} para renovación de revendedor`);

      const validacion = await cuponesService.validarCupon(
        codigoNormalizado,
        planSeleccionado?.id ?? input.planId,
        input.clienteEmail
      );

      if (!validacion.valido || !validacion.cupon) {
        throw new Error(validacion.mensaje_error || 'Cupón inválido');
      }

      cuponAplicado = validacion.cupon;

      if (input.cuponId && cuponAplicado.id && input.cuponId !== cuponAplicado.id) {
        console.warn(
          `[Renovacion] ⚠️ ID de cupón recibido (${input.cuponId}) difiere del validado (${cuponAplicado.id})`
        );
      }

      descuentoAplicado = Math.min(
        precioBase,
        Math.round(cuponesService.calcularDescuento(cuponAplicado, precioBase))
      );

      console.log(`[Renovacion] Cupón ${cuponAplicado.codigo} aplicado. Descuento: $${descuentoAplicado}. Precio base: $${precioBase}`);
    }

    if (!input.codigoCupon && input.descuentoAplicado) {
      console.warn(
        `[Renovacion] ⚠️ Se recibió descuento aplicado (${input.descuentoAplicado}) sin código de cupón. Ignorando valor recibido.`
      );
    }

    if (input.descuentoAplicado && Math.abs(input.descuentoAplicado - descuentoAplicado) > 1) {
      console.warn(
        `[Renovacion] ⚠️ Diferencia entre descuento recibido (${input.descuentoAplicado}) y calculado (${descuentoAplicado}). Se utilizará el calculado.`
      );
    }

    let montoCalculado = Math.max(0, Math.round(precioBase - descuentoAplicado));

    if (input.precio && Math.abs(input.precio - montoCalculado) > 1) {
      console.warn(
        `[Renovacion] ⚠️ Diferencia entre precio recibido (${input.precio}) y calculado (${montoCalculado}). Se usará el calculado.`
      );
    }

    if (!montoCalculado || montoCalculado <= 0) {
      throw new Error('El total a pagar con el cupón debe ser mayor a 0');
    }

    const datosNuevos: any = {
      tipo_renovacion: tipoRenovacion,
      cantidad,
      precio_base: precioBase,
      precio_final: montoCalculado,
    };

    if (planSeleccionado?.id) {
      datosNuevos.plan_id = planSeleccionado.id;
    }

    if (planSeleccionado?.nombre) {
      datosNuevos.plan_nombre = planSeleccionado.nombre;
    }

    if (cuponAplicado) {
      datosNuevos.cupon_codigo = cuponAplicado.codigo;
      datosNuevos.descuento_aplicado = descuentoAplicado;
    }

    // 5. Crear registro de renovación
    const renovacion = this.db.crearRenovacion({
      tipo: 'revendedor',
      servex_id: revendedorExistente.servex_revendedor_id,
      servex_username: revendedorExistente.servex_username,
      operacion: 'renovacion',
      dias_agregados: input.dias,
      datos_nuevos: JSON.stringify(datosNuevos),
      monto: montoCalculado,
      metodo_pago: 'mercadopago',
      cliente_email: input.clienteEmail,
      cliente_nombre: input.clienteNombre,
      estado: 'pendiente',
      cupon_id: cuponAplicado?.id || null,
      descuento_aplicado: descuentoAplicado
    });

    const renovacionId = renovacion.id;
    console.log('[Renovacion] Renovación de revendedor creada:', renovacionId);

    // 6. Crear preferencia en MercadoPago
    const descripcion = tipoRenovacion === 'validity' 
      ? `Renovación 30 días - ${cantidad} usuarios - ${revendedorExistente.servex_username}`
      : `Recarga ${cantidad} créditos - ${revendedorExistente.servex_username}`;

    try {
      const { id: preferenceId, initPoint } = await this.mercadopago.crearPreferencia(
        renovacionId.toString(),
        descripcion,
        montoCalculado,
        input.clienteEmail,
        input.clienteNombre,
        'renovacion-revendedor'
      );

      console.log('[Renovacion] Preferencia de MercadoPago creada:', preferenceId);

      console.log(`[Renovacion] ✅ Renovación de revendedor procesada exitosamente: ID ${renovacionId}, link: ${initPoint}`);
      return {
        renovacion,
        linkPago: initPoint,
        descuentoAplicado: descuentoAplicado > 0 ? descuentoAplicado : undefined,
        cuponAplicado
      };
    } catch (error: any) {
      this.db.actualizarEstadoRenovacion(renovacionId, 'rechazado');
      throw new Error(`Error creando link de pago: ${error.message}`);
    }
  }

  /**
   * Confirma una renovación y ejecuta la renovación en Servex
   */
  async confirmarRenovacion(renovacionId: number, mpPaymentId: string | null): Promise<void> {
    console.log('[Renovacion] Confirmando renovación:', renovacionId);

    if (!mpPaymentId || (typeof mpPaymentId === 'string' && mpPaymentId.trim() === '')) {
      throw new Error('No se puede confirmar renovación sin ID de pago válido');
    }

    const renovacion = this.db.obtenerRenovacionPorId(renovacionId);
    if (!renovacion) {
      throw new Error('Renovación no encontrada');
    }

    const estadoPrevio = renovacion.estado;

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

            this.db.actualizarDatosRevendedorPorServexId({
              servexId: renovacion.servex_id,
              maxUsers: cantidad,
              expiracion: expirationDate,
              accountType: 'validity'
            });
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

            this.db.actualizarDatosRevendedorPorServexId({
              servexId: renovacion.servex_id,
              maxUsers: creditosTotales,
              expiracion: expirationDate,
              accountType: 'credit'
            });
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

      // Aplicar cupón si corresponde
      if (renovacion.cupon_id && estadoPrevio !== 'aprobado') {
        try {
          await cuponesService.aplicarCupon(renovacion.cupon_id);
          console.log(`[Renovacion] ✅ Cupón ${renovacion.cupon_id} marcado como utilizado`);
        } catch (cuponError: any) {
          console.error('[Renovacion] ⚠️ Error aplicando cupón:', cuponError.message);
        }
      }

      // Notificar al administrador
      try {
        const tipoNotificacion = renovacion.tipo === 'cliente' ? 'renovacion-cliente' : 'renovacion-revendedor';
        let descripcion = '';

        if (renovacion.tipo === 'cliente') {
          if (renovacion.operacion === 'upgrade') {
            const datosNuevos = JSON.parse(renovacion.datos_nuevos || '{}');
            descripcion = `Upgrade cliente: ${renovacion.dias_agregados} días, ${datosNuevos.connection_limit} conexiones`;
          } else {
            descripcion = `Renovación cliente: ${renovacion.dias_agregados} días`;
          }
        } else {
          if (renovacion.datos_nuevos) {
            const datosNuevos = JSON.parse(renovacion.datos_nuevos);
            if (datosNuevos.tipo_renovacion === 'validity') {
              descripcion = `Renovación revendedor: 30 días, ${datosNuevos.cantidad} usuarios`;
            } else {
              descripcion = `Recarga revendedor: ${renovacion.dias_agregados} días, +${datosNuevos.cantidad} créditos`;
            }
          } else {
            descripcion = `Renovación revendedor: ${renovacion.dias_agregados} días`;
          }
        }

        await emailService.notificarVentaAdmin(tipoNotificacion, {
          clienteNombre: renovacion.cliente_nombre,
          clienteEmail: renovacion.cliente_email,
          monto: renovacion.monto,
          descripcion,
          username: renovacion.servex_username
        });
        console.log('[Renovacion] ✅ Notificación enviada al administrador');
      } catch (emailError: any) {
        console.error('[Renovacion] ⚠️ Error notificando al admin:', emailError.message);
        // No lanzamos error, la renovación ya está procesada
      }

      // Sincronizar con Supabase (historial de usuario)
      try {
        await supabaseService.syncApprovedPurchase({
          email: renovacion.cliente_email,
          planNombre: renovacion.operacion === 'upgrade' ? `Upgrade: ${renovacion.dias_agregados} días` : `Renovación: ${renovacion.dias_agregados} días`,
          monto: renovacion.monto,
          tipo: 'renovacion',
          servexUsername: renovacion.servex_username,
          mpPaymentId: mpPaymentId || undefined,
        });
      } catch (supabaseError: any) {
        console.error('[Renovacion] ⚠️ Error sincronizando con Supabase:', supabaseError.message);
        // No lanzamos error, la renovación ya está procesada
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

    console.log(`[Renovacion] 🔔 Webhook: renovación ${renovacionId}, estado: ${estado}, mpPaymentId: ${mpPaymentId}`);

    if (estado === 'approved') {
      if (renovacion.estado === 'pendiente' || renovacion.estado === 'rechazado') {
        // Validar que tenemos un ID de pago válido
        if (!mpPaymentId || (typeof mpPaymentId === 'string' && mpPaymentId.trim() === '')) {
          console.warn(`[Renovacion] ⚠️ Webhook indica pago aprobado pero sin mpPaymentId válido. ID: ${pagoId}`);
          // No procesar sin ID de pago válido
          return;
        }
        
        console.log(`[Renovacion] ✅ Confirmando renovación desde webhook: ${renovacionId}`);
        await this.confirmarRenovacion(renovacionId, mpPaymentId);
      }
    } else if (estado === 'rejected' || estado === 'cancelled') {
      if (renovacion.estado === 'pendiente') {
        this.db.actualizarEstadoRenovacion(renovacionId, 'rechazado', mpPaymentId);
        console.log('[Renovacion] ❌ Renovación marcada como rechazada por webhook');
      }
    } else if (estado === 'pending') {
      console.log('[Renovacion] ⏳ Webhook: pago aún pendiente');
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
        console.log(`[Renovacion] ✅ Pago encontrado en MercadoPago: ${pagoMP.id}, status: ${pagoMP.status}`);
        
        // Confirmar la renovación con el ID de pago de MercadoPago
        if (!pagoMP.id) {
          console.error(`[Renovacion] ⚠️ Pago aprobado pero sin ID de pago`);
          throw new Error('Pago aprobado pero sin ID de pago válido');
        }
        
        await this.confirmarRenovacion(renovacionId, pagoMP.id);
        // Devolver la renovación actualizada
        return this.db.obtenerRenovacionPorId(renovacionId);
      } else if (pagoMP && pagoMP.status !== 'approved') {
        console.log(`[Renovacion] ⏳ Pago encontrado pero aún no aprobado. Estado: ${pagoMP.status}`);
      } else {
        console.warn(`[Renovacion] ⚠️ No se encontró pago en MercadoPago para renovación ${renovacionId}`);
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

  async obtenerRevendedorActualizado(username: string): Promise<any | null> {
    try {
      return await this.servex.buscarRevendedorPorUsername(username);
    } catch (error) {
      console.error('[Renovacion] Error obteniendo revendedor actualizado:', error);
      return null;
    }
  }
}
