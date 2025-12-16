import { DatabaseService } from './database.service';
import { ServexService } from './servex.service';
import { MercadoPagoService } from './mercadopago.service';
import { configService } from './config.service';
import emailService from './email.service';
import { cuponesService } from './cupones.service';
import { supabaseService } from './supabase.service';
import { renovacionesSupabaseService } from './renovaciones-supabase.service';
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

  // ============================================
  // MÃ‰TODOS SUPABASE (sin fallback SQLite)
  // ============================================

  /**
   * Crear renovaciÃ³n
   */
  private async crearRenovacionDB(data: any): Promise<any> {
    const renovacion = await renovacionesSupabaseService.crearRenovacion(data);
    if (!renovacion) {
      throw new Error("Error al crear renovaciÃ³n en Supabase");
    }
    console.log(`[Renovacion] âœ… RenovaciÃ³n creada: ${renovacion.id}`);
    return renovacion;
  }

  /**
   * Obtener renovación por ID
   */
  async obtenerRenovacionPorId(id: number): Promise<any | null> {
    return await renovacionesSupabaseService.obtenerRenovacionPorId(id);
  }

  /**
   * Actualizar estado de renovaciÃ³n
   */
  private async actualizarEstadoRenovacion(
    id: number, 
    estado: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado',
    mpPaymentId?: string
  ): Promise<boolean> {
    const ok = await renovacionesSupabaseService.actualizarEstadoRenovacion(id, estado, mpPaymentId);
    if (ok) {
      console.log(`[Renovacion] âœ… Estado actualizado: ${id} -> ${estado}`);
    }
    return ok;
  }

  /**
   * Refrescar timestamp de renovaciÃ³n
   */
  private async refrescarTimestampRenovacion(id: number): Promise<boolean> {
    await renovacionesSupabaseService.refrescarTimestampRenovacion(id);
    return true;
  }

  /**
   * Obtener renovaciones pendientes
   */
  private async obtenerRenovacionesPendientes(opts: { updatedBeforeMinutes?: number; limit?: number }): Promise<any[]> {
    return await renovacionesSupabaseService.obtenerRenovacionesPendientes(
      opts.updatedBeforeMinutes || 5,
      opts.limit || 10
    );
  }

  /**
   * Buscar renovaciones por email
   */
  async buscarRenovacionesPorEmail(email: string): Promise<any[]> {
    return await renovacionesSupabaseService.buscarRenovacionesPorEmail(email);
  }

  /**
   * Getter para acceder al servicio de Servex desde las rutas
   */
  getServexService(): ServexService {
    return this.servex;
  }

  iniciarAutoRevisionesPendientes(config: RenovacionAutoRetryConfig): void {
    if (!config.enabled) {
      console.log('[Renovacion] Auto-revisiÃ³n de pendientes deshabilitada por configuraciÃ³n');
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
        const pendientes = await this.obtenerRenovacionesPendientes({
          updatedBeforeMinutes: config.minPendingAgeMinutes,
          limit: config.batchSize,
        });

        if (!pendientes.length) {
          return;
        }

        console.log(`[Renovacion] ðŸ”„ Revisando ${pendientes.length} renovaciones pendientes automaticamente`);

        for (const pendiente of pendientes) {
          const renovacionId = Number(pendiente.id);
          if (!Number.isFinite(renovacionId)) {
            continue;
          }

          if (typeof config.maxAttempts === 'number' && config.maxAttempts > 0) {
            const intentosPrevios = this.autoRetryAttempts.get(renovacionId) ?? 0;
            if (intentosPrevios >= config.maxAttempts) {
              console.warn(
                `[Renovacion] âš ï¸ RenovaciÃ³n ${renovacionId} alcanzÃ³ el mÃ¡ximo de reintentos automÃ¡ticos (${config.maxAttempts})`
              );
              await this.refrescarTimestampRenovacion(renovacionId);
              continue;
            }
          }

          try {
            const resultado = await this.verificarYProcesarRenovacion(renovacionId, false);

            if (resultado && resultado.estado === 'aprobado') {
              this.autoRetryAttempts.delete(renovacionId);
              console.log(`[Renovacion] âœ… RenovaciÃ³n ${renovacionId} aprobada mediante auto-revisiÃ³n`);
            } else {
              const intentosPrevios = this.autoRetryAttempts.get(renovacionId) ?? 0;
              this.autoRetryAttempts.set(renovacionId, intentosPrevios + 1);
              await this.refrescarTimestampRenovacion(renovacionId);
              console.log(`[Renovacion] â³ RenovaciÃ³n ${renovacionId} sigue pendiente tras auto-revisiÃ³n`);
            }
          } catch (error: any) {
            console.error(
              `[Renovacion] âŒ Error en auto-revisiÃ³n de renovaciÃ³n ${renovacionId}:`,
              error?.message || error
            );
            await this.refrescarTimestampRenovacion(renovacionId);
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
          console.error('[Renovacion] âŒ Error inesperado en auto-revisiÃ³n programada:', error?.message || error)
        );
      }, intervalo);
    };

    const delayInicial = Math.max(0, config.initialDelayMs);
    setTimeout(() => {
      revisarPendientes()
        .catch((error) =>
          console.error('[Renovacion] âŒ Error inesperado en auto-revisiÃ³n inicial:', error?.message || error)
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
    console.log(`[Renovacion] ðŸ” Buscando cuenta: "${busqueda}", soloClientes: ${soloClientes}, soloRevendedores: ${soloRevendedores}`);

    // Primero buscar en la base de datos local (compras anteriores)
    if (!soloRevendedores) {
      const clienteDB = this.db.buscarClientePorUsername(busqueda);
      if (clienteDB) {
        console.log(`[Renovacion] âœ… Cliente encontrado en DB local: ${clienteDB.servex_username} (ID: ${clienteDB.servex_cuenta_id})`);
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
        
        // ðŸ”§ AUTO-REPARACIÃ“N: Si el ID es 0 o null, intentar obtenerlo de Servex
        if (!servexId || servexId === 0) {
          console.warn(`[Renovacion] âš ï¸ Revendedor ${revendedorDB.servex_username} tiene ID invÃ¡lido (${servexId}), intentando reparar...`);
          try {
            const revendedorServex = await this.servex.buscarRevendedorPorUsername(revendedorDB.servex_username);
            if (revendedorServex && revendedorServex.id) {
              servexId = revendedorServex.id;
              // Actualizar la DB con el ID correcto
              this.db.actualizarServexIdRevendedor(revendedorDB.servex_username, servexId);
              console.log(`[Renovacion] âœ… ID reparado automÃ¡ticamente: ${revendedorDB.servex_username} -> ID: ${servexId}`);
            } else {
              console.error(`[Renovacion] âŒ No se pudo encontrar el revendedor ${revendedorDB.servex_username} en Servex para reparar`);
            }
          } catch (repairError: any) {
            console.error(`[Renovacion] âŒ Error reparando ID del revendedor:`, repairError.message);
          }
        }
        
        console.log(`[Renovacion] âœ… Revendedor encontrado en DB local: ${revendedorDB.servex_username} (ID: ${servexId}, max_users: ${maxUsersDb})`);
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

    // Si no estÃ¡ en la DB, buscar directamente en Servex por username
    try {
      console.log(`[Renovacion] ðŸ” Buscando en Servex API...`);
      if (!soloRevendedores) {
        const clienteServex = await this.servex.buscarClientePorUsername(busqueda);
        if (clienteServex) {
          console.log(`[Renovacion] âœ… Cliente encontrado en Servex: ${clienteServex.username} (ID: ${clienteServex.id})`);
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
          console.log(`[Renovacion] âœ… Revendedor encontrado en Servex: ${revendedorServex.username} (ID: ${revendedorServex.id}, max_users: ${revendedorServex.max_users})`);
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
      console.error('[Renovacion] âŒ Error buscando en Servex:', error.message);
    }

    console.log(`[Renovacion] âŒ Cuenta no encontrada: "${busqueda}"`);
    return { encontrado: false };
  }

  /**
   * Procesa una renovaciÃ³n de cliente
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
    console.log(`[Renovacion] ðŸš€ Iniciando procesamiento de renovaciÃ³n de cliente: ${input.busqueda} (${input.dias} dÃ­as)`);
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
    
    console.log(`[Renovacion] LÃ­mite actual: ${connectionLimitActual}, Nuevo lÃ­mite: ${connectionLimitNuevo}, Hay cambio: ${hayCambioDispositivos}`);

    // 3. Calcular precio base considerando overrides actuales
    const precioBaseCalculado = this.calcularPrecioBaseRenovacion(input.dias, connectionLimitNuevo);
    let precioBase = precioBaseCalculado;

    if (input.precioOriginal && input.precioOriginal > 0) {
      if (Math.abs(input.precioOriginal - precioBaseCalculado) > 1) {
        console.log(
          `[Renovacion] âš ï¸ Precio original recibido (${input.precioOriginal}) difiere del calculado (${precioBaseCalculado}). Usando recibido.`
        );
      }
      precioBase = Math.round(input.precioOriginal);
    }

    let cuponAplicado: any = null;
    let descuentoAplicado = 0;

    if (input.codigoCupon) {
      const codigoNormalizado = input.codigoCupon.trim().toUpperCase();
      console.log(`[Renovacion] Validando cupÃ³n ${codigoNormalizado} para renovaciÃ³n`);

      const validacion = await cuponesService.validarCupon(
        codigoNormalizado,
        input.planId,
        input.clienteEmail
      );

      if (!validacion.valido || !validacion.cupon) {
        throw new Error(validacion.mensaje_error || 'CupÃ³n invÃ¡lido');
      }

      cuponAplicado = validacion.cupon;
      if (input.cuponId && cuponAplicado.id && input.cuponId !== cuponAplicado.id) {
        console.warn(
          `[Renovacion] âš ï¸ ID de cupÃ³n recibido (${input.cuponId}) difiere del validado (${cuponAplicado.id})`
        );
      }

      descuentoAplicado = Math.min(
        precioBase,
        Math.round(cuponesService.calcularDescuento(cuponAplicado, precioBase))
      );

      console.log(
        `[Renovacion] CupÃ³n ${cuponAplicado.codigo} vÃ¡lido. Descuento: $${descuentoAplicado}. Precio base: $${precioBase}`
      );
    }

    let monto = Math.max(0, Math.round(precioBase - descuentoAplicado));

    if (!monto || monto <= 0) {
      throw new Error('El total a pagar con el cupÃ³n debe ser mayor a 0');
    }

    if (input.precio && Math.abs(input.precio - monto) > 1) {
      console.log(
        `[Renovacion] âš ï¸ Diferencia entre precio recibido (${input.precio}) y calculado (${monto}). Se usarÃ¡ el calculado.`
      );
    }

    console.log(`[Renovacion] ${hayCambioDispositivos ? 'Upgrade' : 'RenovaciÃ³n'}: ${connectionLimitActual} -> ${connectionLimitNuevo} dispositivos`);
    console.log(`[Renovacion] Precio base: $${precioBase}. Descuento aplicado: $${descuentoAplicado}. Monto final: $${monto}`);

    // 4. Crear registro de renovaciÃ³n
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
      cupon_codigo: cuponAplicado?.codigo || null,
      descuento_aplicado: descuentoAplicado
    };

    if (hayCambioDispositivos) {
      renovacionData.datos_anteriores = { connection_limit: connectionLimitActual };
      renovacionData.datos_nuevos = { connection_limit: connectionLimitNuevo };
    }

    const renovacion = await this.crearRenovacionDB(renovacionData);
    const renovacionId = renovacion.id;

    console.log('[Renovacion] RenovaciÃ³n creada:', renovacionId);

    // 5. Crear preferencia en MercadoPago
    try {
      const descripcion = hayCambioDispositivos
        ? `${operacion === 'upgrade' ? 'Upgrade' : 'Cambio'} a ${connectionLimitNuevo} disp. + ${input.dias} dÃ­as - ${clienteExistente.servex_username}`
        : `RenovaciÃ³n ${input.dias} dÃ­as - ${clienteExistente.servex_username}`;

      const { id: preferenceId, initPoint } = await this.mercadopago.crearPreferencia(
        renovacionId.toString(),
        descripcion,
        monto,
        input.clienteEmail,
        input.clienteNombre,
        'renovacion-cliente'
      );

      console.log('[Renovacion] Preferencia de MercadoPago creada:', preferenceId);

      console.log(`[Renovacion] âœ… RenovaciÃ³n de cliente procesada exitosamente: ID ${renovacionId}, link: ${initPoint}`);
      return {
        renovacion,
        linkPago: initPoint,
        descuentoAplicado: descuentoAplicado > 0 ? descuentoAplicado : undefined,
        cuponAplicado: cuponAplicado
      };
    } catch (error: any) {
      await this.actualizarEstadoRenovacion(renovacionId, 'rechazado');
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

    // Fallback: tomar plan de 30 dÃ­as con el mismo lÃ­mite para estimar precio diario
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
   * Procesa una renovaciÃ³n de revendedor
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
    console.log(`[Renovacion] ðŸš€ Iniciando procesamiento de renovaciÃ³n de revendedor: ${input.busqueda} (${input.dias} dÃ­as, tipo: ${input.tipoRenovacion})`);
    console.log('[Renovacion] Input recibido:', JSON.stringify(input, null, 2));
    const resultado = await this.buscarCliente(input.busqueda, false);
    
    if (!resultado.encontrado || resultado.tipo !== 'revendedor') {
      throw new Error('Revendedor no encontrado');
    }

    const revendedorExistente = resultado.datos;

    // 2. Obtener planes de revendedores con overrides de configuraciÃ³n aplicados
    const planesBase = this.db.obtenerPlanesRevendedores();
    console.log(`[Renovacion] ðŸ“Š Planes base obtenidos: ${planesBase.length} planes`);
    const planesConOverrides =
      configService.aceptarOverridesAListaPlanesRevendedor(planesBase, {
        forNewCustomers: false,
      });
    console.log(`[Renovacion] ðŸ“Š Planes con overrides: ${planesConOverrides.length} planes`);
    
    // 3. Calcular precio segÃºn el plan seleccionado
    const tipoRenovacion = input.tipoRenovacion || 'validity';
    const cantidad = input.cantidadSeleccionada || 5;
    
    console.log(`[Renovacion] ðŸ” Buscando plan con: tipo=${tipoRenovacion}, cantidad=${cantidad}`);
    console.log(`[Renovacion] ðŸ“‹ Planes disponibles: ${JSON.stringify(planesConOverrides.map((p: any) => ({id: p.id, max_users: p.max_users, account_type: p.account_type, precio: p.precio})))}`);

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
      console.warn(`[Renovacion] âš ï¸ No se encontrÃ³ un plan exacto para tipo=${tipoRenovacion}, cantidad=${cantidad}. Usando defaults.`);
    }

    let precioBase = planSeleccionado?.precio ? Math.round(Number(planSeleccionado.precio)) : 0;

    if (!precioBase) {
      precioBase = tipoRenovacion === 'validity' ? 8500 : 10200;
    }

    if (input.precioOriginal && input.precioOriginal > 0) {
      if (Math.abs(input.precioOriginal - precioBase) > 1) {
        console.warn(
          `[Renovacion] âš ï¸ Precio original recibido (${input.precioOriginal}) difiere del calculado (${precioBase}). Usando recibido.`
        );
      }
      precioBase = Math.round(input.precioOriginal);
    }

    let cuponAplicado: any = null;
    let descuentoAplicado = 0;

    if (input.codigoCupon) {
      const codigoNormalizado = input.codigoCupon.trim().toUpperCase();
      console.log(`[Renovacion] Validando cupÃ³n ${codigoNormalizado} para renovaciÃ³n de revendedor`);

      const validacion = await cuponesService.validarCupon(
        codigoNormalizado,
        planSeleccionado?.id ?? input.planId,
        input.clienteEmail
      );

      if (!validacion.valido || !validacion.cupon) {
        throw new Error(validacion.mensaje_error || 'CupÃ³n invÃ¡lido');
      }

      cuponAplicado = validacion.cupon;

      if (input.cuponId && cuponAplicado.id && input.cuponId !== cuponAplicado.id) {
        console.warn(
          `[Renovacion] âš ï¸ ID de cupÃ³n recibido (${input.cuponId}) difiere del validado (${cuponAplicado.id})`
        );
      }

      descuentoAplicado = Math.min(
        precioBase,
        Math.round(cuponesService.calcularDescuento(cuponAplicado, precioBase))
      );

      console.log(`[Renovacion] CupÃ³n ${cuponAplicado.codigo} aplicado. Descuento: $${descuentoAplicado}. Precio base: $${precioBase}`);
    }

    if (!input.codigoCupon && input.descuentoAplicado) {
      console.warn(
        `[Renovacion] âš ï¸ Se recibiÃ³ descuento aplicado (${input.descuentoAplicado}) sin cÃ³digo de cupÃ³n. Ignorando valor recibido.`
      );
    }

    if (input.descuentoAplicado && Math.abs(input.descuentoAplicado - descuentoAplicado) > 1) {
      console.warn(
        `[Renovacion] âš ï¸ Diferencia entre descuento recibido (${input.descuentoAplicado}) y calculado (${descuentoAplicado}). Se utilizarÃ¡ el calculado.`
      );
    }

    let montoCalculado = Math.max(0, Math.round(precioBase - descuentoAplicado));

    if (input.precio && Math.abs(input.precio - montoCalculado) > 1) {
      console.warn(
        `[Renovacion] âš ï¸ Diferencia entre precio recibido (${input.precio}) y calculado (${montoCalculado}). Se usarÃ¡ el calculado.`
      );
    }

    if (!montoCalculado || montoCalculado <= 0) {
      throw new Error('El total a pagar con el cupÃ³n debe ser mayor a 0');
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

    // 5. Crear registro de renovaciÃ³n
    const renovacion = await this.crearRenovacionDB({
      tipo: 'revendedor',
      servex_id: revendedorExistente.servex_revendedor_id,
      servex_username: revendedorExistente.servex_username,
      operacion: 'renovacion',
      dias_agregados: input.dias,
      datos_nuevos: datosNuevos,
      monto: montoCalculado,
      metodo_pago: 'mercadopago',
      cliente_email: input.clienteEmail,
      cliente_nombre: input.clienteNombre,
      estado: 'pendiente',
      cupon_id: cuponAplicado?.id || null,
      cupon_codigo: cuponAplicado?.codigo || null,
      descuento_aplicado: descuentoAplicado
    });

    const renovacionId = renovacion.id;
    console.log('[Renovacion] RenovaciÃ³n de revendedor creada:', renovacionId);

    // 6. Crear preferencia en MercadoPago
    const descripcion = tipoRenovacion === 'validity' 
      ? `RenovaciÃ³n 30 dÃ­as - ${cantidad} usuarios - ${revendedorExistente.servex_username}`
      : `Recarga ${cantidad} crÃ©ditos - ${revendedorExistente.servex_username}`;

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

      console.log(`[Renovacion] âœ… RenovaciÃ³n de revendedor procesada exitosamente: ID ${renovacionId}, link: ${initPoint}`);
      return {
        renovacion,
        linkPago: initPoint,
        descuentoAplicado: descuentoAplicado > 0 ? descuentoAplicado : undefined,
        cuponAplicado
      };
    } catch (error: any) {
      await this.actualizarEstadoRenovacion(renovacionId, 'rechazado');
      throw new Error(`Error creando link de pago: ${error.message}`);
    }
  }

  /**
   * Confirma una renovaciÃ³n y ejecuta la renovaciÃ³n en Servex
   */
  async confirmarRenovacion(renovacionId: number, mpPaymentId: string | null): Promise<void> {
    console.log('[Renovacion] Confirmando renovaciÃ³n:', renovacionId);

    if (!mpPaymentId || (typeof mpPaymentId === 'string' && mpPaymentId.trim() === '')) {
      throw new Error('No se puede confirmar renovaciÃ³n sin ID de pago vÃ¡lido');
    }

    const renovacion = await this.obtenerRenovacionPorId(renovacionId);
    if (!renovacion) {
      throw new Error('RenovaciÃ³n no encontrada');
    }

    const estadoPrevio = renovacion.estado;

    try {
      // 1. Actualizar estado a aprobado
      await this.actualizarEstadoRenovacion(renovacionId, 'aprobado', mpPaymentId);

      // 2. Si es un upgrade (cambio de dispositivos), actualizar primero el connection_limit
      if (renovacion.operacion === 'upgrade' && renovacion.tipo === 'cliente' && renovacion.datos_nuevos) {
        try {
          const datosNuevos = typeof renovacion.datos_nuevos === 'string' 
            ? JSON.parse(renovacion.datos_nuevos) 
            : renovacion.datos_nuevos;
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
              connection_limit: datosNuevos.connection_limit, // El nuevo lÃ­mite
              type: clienteActual.type,
              ...(clienteActual.observation && { observation: clienteActual.observation }),
              ...(clienteActual.v2ray_uuid && { v2ray_uuid: clienteActual.v2ray_uuid })
            };
            
            console.log(`[Renovacion] Actualizando cliente ID ${renovacion.servex_id} con payload:`, JSON.stringify(payload));
            await this.servex.actualizarCliente(renovacion.servex_id, payload);
            console.log('[Renovacion] âœ… Connection limit actualizado exitosamente');
          }
        } catch (parseError) {
          console.error('[Renovacion] Error actualizando connection_limit:', parseError);
          throw parseError; // Re-lanzar el error para que se maneje arriba
        }
      }

      // 3. Procesar renovaciÃ³n de revendedor si tiene datos_nuevos
      if (renovacion.tipo === 'revendedor' && renovacion.datos_nuevos) {
        try {
          const datosNuevos = typeof renovacion.datos_nuevos === 'string'
            ? JSON.parse(renovacion.datos_nuevos)
            : renovacion.datos_nuevos;
          const tipoRenovacion = datosNuevos.tipo_renovacion;
          const cantidad = datosNuevos.cantidad;
          
          console.log(`[Renovacion] Procesando ${tipoRenovacion} para revendedor: ${cantidad}`);
          console.log(`[Renovacion] servex_id: ${renovacion.servex_id}, dias_agregados: ${renovacion.dias_agregados}`);

          if (tipoRenovacion === 'validity') {
            // RenovaciÃ³n de validez: Siempre 30 dÃ­as fijos + REEMPLAZAR max_users
            console.log(`[Renovacion] Validity: Agregando 30 dÃ­as fijos y estableciendo lÃ­mite a ${cantidad} usuarios`);
            
            // Calcular nueva fecha de vencimiento (hoy + 30 dÃ­as)
            const fechaVencimiento = new Date();
            fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
            const expirationDate = fechaVencimiento.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            
            console.log(`[Renovacion] Nueva fecha de vencimiento: ${expirationDate}`);
            
            // Actualizar: cambiar a validity, establecer lÃ­mite de usuarios y fecha de vencimiento
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
            // Recarga de crÃ©ditos: Agregar dÃ­as segÃºn plan + SUMAR crÃ©ditos
            console.log(`[Renovacion] Credit: Agregando ${renovacion.dias_agregados} dÃ­as y sumando ${cantidad} crÃ©ditos`);
            
            // Obtener datos actuales del revendedor
            const revendedorActual = await this.servex.buscarRevendedorPorUsername(renovacion.servex_username);
            const creditosActuales = revendedorActual?.max_users || 0;
            const creditosTotales = creditosActuales + cantidad;
            
            console.log(`[Renovacion] CrÃ©ditos actuales: ${creditosActuales}, sumando: ${cantidad}, total: ${creditosTotales}`);
            
            // Calcular nueva fecha de vencimiento (fecha actual + dÃ­as del plan)
            const fechaActual = revendedorActual?.expiration_date ? new Date(revendedorActual.expiration_date) : new Date();
            fechaActual.setDate(fechaActual.getDate() + renovacion.dias_agregados);
            const expirationDate = fechaActual.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            
            console.log(`[Renovacion] Nueva fecha de vencimiento: ${expirationDate}`);
            
            // Actualizar: mantener account_type credit, sumar crÃ©ditos y establecer nueva fecha
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
          
          console.log('[Renovacion] âœ… Revendedor actualizado exitosamente');
        } catch (error) {
          console.error('[Renovacion] Error procesando datos de revendedor:', error);
          throw error;
        }
      } else {
        // 4. Ejecutar renovaciÃ³n simple de dÃ­as en Servex
        if (renovacion.tipo === 'cliente') {
          await this.servex.renovarCliente(renovacion.servex_id, renovacion.dias_agregados);
        } else if (renovacion.tipo === 'revendedor') {
          await this.servex.renovarRevendedor(renovacion.servex_id, renovacion.dias_agregados);
        }

        console.log(`[Renovacion] âœ… ${renovacion.tipo} renovado exitosamente`);
      }

      // Aplicar cupón si corresponde
      if (renovacion.cupon_id && estadoPrevio !== 'aprobado') {
        try {
          const descuentoAplicado = renovacion.descuento_aplicado || 0;
          await cuponesService.aplicarCupon(
            renovacion.cupon_id,
            renovacion.cliente_email || '',
            String(renovacion.id),
            renovacion.monto_original || renovacion.monto || 0,
            descuentoAplicado
          );
          console.log(`[Renovacion] ✅ Cupón ${renovacion.cupon_id} marcado como utilizado`);
        } catch (cuponError: any) {
          console.error('[Renovacion] âš ï¸ Error aplicando cupÃ³n:', cuponError.message);
        }
      }

      // Notificar al administrador
      try {
        const tipoNotificacion = renovacion.tipo === 'cliente' ? 'renovacion-cliente' : 'renovacion-revendedor';
        let descripcion = '';

        if (renovacion.tipo === 'cliente') {
          if (renovacion.operacion === 'upgrade') {
            const datosNuevos = JSON.parse(renovacion.datos_nuevos || '{}');
            descripcion = `Upgrade cliente: ${renovacion.dias_agregados} dÃ­as, ${datosNuevos.connection_limit} conexiones`;
          } else {
            descripcion = `RenovaciÃ³n cliente: ${renovacion.dias_agregados} dÃ­as`;
          }
        } else {
          if (renovacion.datos_nuevos) {
            const datosNuevos = JSON.parse(renovacion.datos_nuevos);
            if (datosNuevos.tipo_renovacion === 'validity') {
              descripcion = `RenovaciÃ³n revendedor: 30 dÃ­as, ${datosNuevos.cantidad} usuarios`;
            } else {
              descripcion = `Recarga revendedor: ${renovacion.dias_agregados} dÃ­as, +${datosNuevos.cantidad} crÃ©ditos`;
            }
          } else {
            descripcion = `RenovaciÃ³n revendedor: ${renovacion.dias_agregados} dÃ­as`;
          }
        }

        await emailService.notificarVentaAdmin(tipoNotificacion, {
          clienteNombre: renovacion.cliente_nombre,
          clienteEmail: renovacion.cliente_email,
          monto: renovacion.monto,
          descripcion,
          username: renovacion.servex_username
        });
        console.log('[Renovacion] âœ… NotificaciÃ³n enviada al administrador');
      } catch (emailError: any) {
        console.error('[Renovacion] âš ï¸ Error notificando al admin:', emailError.message);
        // No lanzamos error, la renovaciÃ³n ya estÃ¡ procesada
      }

      // Sincronizar con Supabase (historial de usuario)
      try {
        await supabaseService.syncApprovedPurchase({
          email: renovacion.cliente_email,
          planNombre: renovacion.operacion === 'upgrade' ? `Upgrade: ${renovacion.dias_agregados} dÃ­as` : `RenovaciÃ³n: ${renovacion.dias_agregados} dÃ­as`,
          monto: renovacion.monto,
          tipo: 'renovacion',
          servexUsername: renovacion.servex_username,
          mpPaymentId: mpPaymentId || undefined,
        });
      } catch (supabaseError: any) {
        console.error('[Renovacion] âš ï¸ Error sincronizando con Supabase:', supabaseError.message);
        // No lanzamos error, la renovaciÃ³n ya estÃ¡ procesada
      }

      // Enviar email de confirmaciÃ³n al cliente
      try {
        // Obtener la nueva fecha de expiraciÃ³n
        let nuevaExpiracion = '';
        let detallesExtra = '';
        
        if (renovacion.tipo === 'cliente') {
          const clienteActualizado = await this.servex.buscarClientePorUsername(renovacion.servex_username);
          if (clienteActualizado?.expiration_date) {
            nuevaExpiracion = new Date(clienteActualizado.expiration_date).toLocaleDateString('es-AR', {
              day: '2-digit', month: '2-digit', year: 'numeric'
            });
          }
          if (renovacion.operacion === 'upgrade') {
            const datosNuevos = JSON.parse(renovacion.datos_nuevos || '{}');
            detallesExtra = `Nuevo lÃ­mite: ${datosNuevos.connection_limit} dispositivos`;
          }
        } else if (renovacion.tipo === 'revendedor') {
          const revendedorActualizado = await this.servex.buscarRevendedorPorUsername(renovacion.servex_username);
          if (revendedorActualizado?.expiration_date) {
            nuevaExpiracion = new Date(revendedorActualizado.expiration_date).toLocaleDateString('es-AR', {
              day: '2-digit', month: '2-digit', year: 'numeric'
            });
          }
          if (renovacion.datos_nuevos) {
            const datosNuevos = JSON.parse(renovacion.datos_nuevos);
            if (datosNuevos.tipo_renovacion === 'validity') {
              detallesExtra = `${datosNuevos.cantidad} usuarios mÃ¡x`;
            } else if (datosNuevos.tipo_renovacion === 'credit') {
              detallesExtra = `+${datosNuevos.cantidad} crÃ©ditos`;
            }
          }
        }
        
        await emailService.enviarConfirmacionRenovacion(renovacion.cliente_email, {
          tipo: renovacion.tipo,
          username: renovacion.servex_username,
          diasAgregados: renovacion.dias_agregados,
          nuevaExpiracion: nuevaExpiracion || 'Ver en panel',
          monto: renovacion.monto,
          operacion: renovacion.operacion || (renovacion.datos_nuevos ? JSON.parse(renovacion.datos_nuevos).tipo_renovacion : undefined),
          detallesExtra: detallesExtra || undefined,
        });
        console.log(`[Renovacion] âœ… Email de confirmaciÃ³n enviado a ${renovacion.cliente_email}`);
      } catch (emailClienteError: any) {
        console.error('[Renovacion] âš ï¸ Error enviando email de confirmaciÃ³n al cliente:', emailClienteError.message);
        // No lanzamos error, la renovaciÃ³n ya estÃ¡ procesada
      }

    } catch (error: any) {
      console.error('[Renovacion] âŒ Error ejecutando renovaciÃ³n:', error.message);
      await this.actualizarEstadoRenovacion(renovacionId, 'pendiente');
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

    // Convertir pagoId a nÃºmero (el ID de renovaciÃ³n es un nÃºmero autoincremental)
    const renovacionId = parseInt(pagoId, 10);
    if (isNaN(renovacionId)) {
      console.error('[Renovacion] ID de renovaciÃ³n invÃ¡lido:', pagoId);
      return;
    }

    const renovacion = await this.obtenerRenovacionPorId(renovacionId);
    if (!renovacion) {
      console.error('[Renovacion] RenovaciÃ³n no encontrada:', renovacionId);
      return;
    }

    console.log(`[Renovacion] ðŸ”” Webhook: renovaciÃ³n ${renovacionId}, estado: ${estado}, mpPaymentId: ${mpPaymentId}`);

    if (estado === 'approved') {
      if (renovacion.estado === 'pendiente' || renovacion.estado === 'rechazado') {
        // Validar que tenemos un ID de pago vÃ¡lido
        if (!mpPaymentId || (typeof mpPaymentId === 'string' && mpPaymentId.trim() === '')) {
          console.warn(`[Renovacion] âš ï¸ Webhook indica pago aprobado pero sin mpPaymentId vÃ¡lido. ID: ${pagoId}`);
          // No procesar sin ID de pago vÃ¡lido
          return;
        }
        
        console.log(`[Renovacion] âœ… Confirmando renovaciÃ³n desde webhook: ${renovacionId}`);
        await this.confirmarRenovacion(renovacionId, mpPaymentId);
      }
    } else if (estado === 'rejected' || estado === 'cancelled') {
      if (renovacion.estado === 'pendiente') {
        await this.actualizarEstadoRenovacion(renovacionId, 'rechazado', mpPaymentId);
        console.log('[Renovacion] âŒ RenovaciÃ³n marcada como rechazada por webhook');
      }
    } else if (estado === 'pending') {
      console.log('[Renovacion] â³ Webhook: pago aÃºn pendiente');
    }
  }

  /**
   * Verifica y procesa una renovaciÃ³n manualmente (para cuando el cliente vuelve de MP)
   */
  async verificarYProcesarRenovacion(renovacionId: number, forzarReproceso: boolean = false): Promise<any | null> {
    const renovacion = await this.obtenerRenovacionPorId(renovacionId);
    if (!renovacion) {
      return null;
    }

    console.log(`[Renovacion] verificarYProcesarRenovacion: ${renovacionId}, forzarReproceso=${forzarReproceso}, estado=${renovacion.estado}, mp_payment_id=${renovacion.mp_payment_id}`);

    // Si estÃ¡ aprobada y se fuerza reproceso, ejecutar de nuevo
    if (renovacion.estado === 'aprobado' && forzarReproceso && renovacion.mp_payment_id) {
      console.log(`[Renovacion] ðŸ”„ Reprocesando renovaciÃ³n aprobada: ${renovacionId}`);
      await this.confirmarRenovacion(renovacionId, renovacion.mp_payment_id);
      return await this.obtenerRenovacionPorId(renovacionId);
    }

    // Si la renovaciÃ³n ya estÃ¡ aprobada, solo devolver la informaciÃ³n
    if (renovacion.estado === 'aprobado') {
      return renovacion;
    }

    // Si estÃ¡ pendiente, verificar en MercadoPago
    if (renovacion.estado === 'pendiente') {
      const pagoMP = await this.mercadopago.verificarPagoPorReferencia(renovacionId.toString());

      if (pagoMP && pagoMP.status === 'approved') {
        console.log(`[Renovacion] âœ… Pago encontrado en MercadoPago: ${pagoMP.id}, status: ${pagoMP.status}`);
        
        // Confirmar la renovaciÃ³n con el ID de pago de MercadoPago
        if (!pagoMP.id) {
          console.error(`[Renovacion] âš ï¸ Pago aprobado pero sin ID de pago`);
          throw new Error('Pago aprobado pero sin ID de pago vÃ¡lido');
        }
        
        await this.confirmarRenovacion(renovacionId, pagoMP.id);
        // Devolver la renovaciÃ³n actualizada
        return await this.obtenerRenovacionPorId(renovacionId);
      } else if (pagoMP && pagoMP.status !== 'approved') {
        console.log(`[Renovacion] â³ Pago encontrado pero aÃºn no aprobado. Estado: ${pagoMP.status}`);
      } else {
        console.warn(`[Renovacion] âš ï¸ No se encontrÃ³ pago en MercadoPago para renovaciÃ³n ${renovacionId}`);
      }
    }

    return renovacion;
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
