import { v4 as uuidv4 } from "uuid";
import { DatabaseService } from "./database.service";
import { ServexService } from "./servex.service";
import { WebSocketService } from "./websocket.service";
import { MercadoPagoService } from "./mercadopago.service";
import { DemoService } from "./demo.service";
import { configService } from "./config.service";
import emailService from "./email.service";
import { cuponesService } from "./cupones.service";
import { supabaseService } from "./supabase.service";
import { referidosService } from "./referidos.service";
import { pagosSupabaseService } from "./pagos-supabase.service";
import { Plan, Pago, CrearPagoInput, ClienteServex } from "../types";

export class TiendaService {
  private demo: DemoService;

  constructor(
    private db: DatabaseService,
    private servex: ServexService,
    private mercadopago: MercadoPagoService,
    private wsService: WebSocketService
  ) {
    // Inicializar DemoService con wsService tambiÃ©n
    this.demo = new DemoService(this.db.getDatabase(), this.servex, this.wsService);
    console.log('[Tienda] âœ… Usando Supabase para pagos');
  }

  /**
   * Obtiene el servicio de MercadoPago (para acceso desde rutas)
   */
  getMercadoPagoService(): MercadoPagoService {
    return this.mercadopago;
  }

  /**
   * Obtiene el servicio de Demos (para acceso desde rutas)
   */
  getDemoService(): DemoService {
    return this.demo;
  }

  // ============================================
  // MÃ‰TODOS SUPABASE PARA PAGOS (sin fallback SQLite)
  // ============================================

  /**
   * Obtener pago por ID
   */
  private async obtenerPagoPorId(pagoId: string): Promise<Pago | null> {
    return pagosSupabaseService.obtenerPagoPorId(pagoId);
  }

  /**
   * Actualizar estado de pago
   */
  private async actualizarEstadoPago(
    pagoId: string,
    estado: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado',
    mpPaymentId?: string
  ): Promise<void> {
    await pagosSupabaseService.actualizarEstadoPago(pagoId, estado, mpPaymentId);
  }

  /**
   * Guardar cuenta Servex en pago
   */
  private async guardarCuentaServex(
    pagoId: string,
    cuentaId: number,
    username: string,
    password: string,
    categoria: string,
    expiracion: string,
    connectionLimit: number
  ): Promise<void> {
    await pagosSupabaseService.actualizarDatosServex(pagoId, {
      servex_cuenta_id: cuentaId,
      servex_username: username,
      servex_password: password,
      servex_categoria: categoria,
      servex_expiracion: expiracion,
      servex_connection_limit: connectionLimit,
    });
  }

  /**
   * Obtener pagos pendientes
   */
  async obtenerPagosPendientes(_limite?: number): Promise<Pago[]> {
    return pagosSupabaseService.obtenerPagosPendientes();
  }

  /**
   * Inicializa planes por defecto si no existen
   */
  async inicializarPlanes(): Promise<void> {
    const planesExistentes = this.db.obtenerPlanes();
    if (planesExistentes.length > 0) {
      console.log("[Tienda] Planes ya existen en la base de datos");
      return;
    }

    console.log("[Tienda] Creando planes por defecto...");

    const planesDefault = [
      {
        nombre: "Plan BÃ¡sico",
        descripcion: "Perfecto para uso personal",
        precio: 5,
        dias: 30,
        connection_limit: 1,
        activo: true,
      },
      {
        nombre: "Plan Premium",
        descripcion: "Para usuarios exigentes",
        precio: 5,
        dias: 30,
        connection_limit: 2,
        activo: true,
      },
      {
        nombre: "Plan Familiar",
        descripcion: "Para compartir con tu familia",
        precio: 5,
        dias: 30,
        connection_limit: 4,
        activo: true,
      },
      {
        nombre: "Plan Anual",
        descripcion: "Ahorra con nuestro plan anual",
        precio: 5,
        dias: 365,
        connection_limit: 2,
        activo: true,
      },
    ];

    for (const plan of planesDefault) {
      this.db.crearPlan(plan);
    }

    console.log("[Tienda] âœ… Planes creados exitosamente");

    // Verificar consistencia con configuraciÃ³n
    configService.verificarConsistenciaConDB(this.db);
  }

  /**
   * Obtiene todos los planes activos (con overrides de configuraciÃ³n)
   */
  obtenerPlanes(options?: { forNewCustomers?: boolean; forRenewal?: boolean }): Plan[] {
    const planesBase = this.db.obtenerPlanes();
    const overrideOptions = options ?? { forNewCustomers: true };
    // Aplicar overrides de configuraciÃ³n si existen
    return configService.aceptarOverridesAListaPlanes(
      planesBase,
      overrideOptions
    );
  }

  /**
   * Procesa una nueva compra
   */
  async procesarCompra(input: CrearPagoInput): Promise<{
    pago: Pago;
    linkPago: string;
    descuentoAplicado?: number;
    cuponAplicado?: any;
    saldoUsado?: number;
    pagoConSaldoCompleto?: boolean;
    codigoReferidoUsado?: string;
    cuentaVPN?: {
      username: string;
      password: string;
      expiracion: string;
      categoria: string;
    };
  }> {
    console.log("[Tienda] procesarCompra input:", JSON.stringify(input));
    
    // 1. Validar que el plan existe
    let plan = this.db.obtenerPlanPorId(input.planId);
    if (!plan) {
      throw new Error("Plan no encontrado");
    }

    if (!plan.activo) {
      throw new Error("Plan no disponible");
    }

    // 2. Aplicar overrides de configuraciÃ³n
    plan = configService.aceptarOverridesAlPlan(plan, { forNewCustomers: true });
    let precioFinal = plan.precio;
    let descuentoAplicado = 0;
    let cuponAplicado = null;
    let saldoUsado = 0;

    // 3. Validar y aplicar cupÃ³n si se proporciona
    if (input.codigoCupon) {
      console.log(`[Tienda] Validando cupÃ³n: ${input.codigoCupon}`);

      const validacion = await cuponesService.validarCupon(input.codigoCupon, input.planId, input.clienteEmail);

      if (!validacion.valido) {
        throw new Error(`CupÃ³n invÃ¡lido: ${validacion.mensaje_error}`);
      }

      if (!validacion.cupon) {
        throw new Error("Error interno: cupÃ³n vÃ¡lido pero no encontrado");
      }

      // Calcular descuento
      descuentoAplicado = cuponesService.calcularDescuento(validacion.cupon, precioFinal);
      precioFinal = Math.max(0, precioFinal - descuentoAplicado); // No permitir precios negativos
      cuponAplicado = validacion.cupon;

      console.log(`[Tienda] CupÃ³n aplicado: ${descuentoAplicado} de descuento, precio final: $${precioFinal}`);
    }

    // 3.5. Validar y aplicar descuento por cÃ³digo de referido
    if (input.codigoReferido) {
      console.log(`[Tienda] ========================================`);
      console.log(`[Tienda] Validando cÃ³digo de referido: ${input.codigoReferido}`);
      console.log(`[Tienda] Email cliente: ${input.clienteEmail}`);
      
      const validacionReferido = await referidosService.validarCodigo(
        input.codigoReferido, 
        input.clienteEmail
      );

      console.log(`[Tienda] Resultado validaciÃ³n referido:`, JSON.stringify(validacionReferido));

      if (validacionReferido.valido && validacionReferido.descuento) {
        const descuentoReferido = Math.round(precioFinal * validacionReferido.descuento / 100);
        console.log(`[Tienda] Descuento referido calculado: ${descuentoReferido} (${validacionReferido.descuento}% de ${precioFinal})`);
        precioFinal = Math.max(0, precioFinal - descuentoReferido);
        descuentoAplicado += descuentoReferido;
        console.log(`[Tienda] âœ… Descuento por referido aplicado: ${descuentoReferido}, precio final: $${precioFinal}`);
      } else {
        console.log(`[Tienda] âš ï¸ No se aplicÃ³ descuento. valido=${validacionReferido.valido}, descuento=${validacionReferido.descuento}`);
      }
      console.log(`[Tienda] ========================================`);
    }

    // 3.6. Validar y aplicar saldo si se proporciona
    if (input.saldoUsado && input.saldoUsado > 0) {
      console.log(`[Tienda] Validando saldo a usar: ${input.saldoUsado}`);
      
      const userData = await referidosService.getSaldoByEmail(input.clienteEmail);
      const saldoDisponible = userData?.saldo || 0;
      
      if (saldoDisponible < input.saldoUsado) {
        throw new Error(`Saldo insuficiente. Disponible: $${saldoDisponible}`);
      }

      saldoUsado = Math.min(input.saldoUsado, precioFinal); // No usar mÃ¡s saldo del necesario
      precioFinal = Math.max(0, precioFinal - saldoUsado);
      
      console.log(`[Tienda] Saldo usado: ${saldoUsado}, precio final a pagar: $${precioFinal}`);
    }

    console.log(`[Tienda] Plan ${plan.id} - Precio final: $${precioFinal}`);

    // 4. Crear registro de pago en la base de datos
    const pagoId = uuidv4();
    const pago = await pagosSupabaseService.crearPago({
      id: pagoId,
      plan_id: plan.id,
      monto: precioFinal,
      estado: precioFinal === 0 ? "aprobado" : "pendiente",
      metodo_pago: precioFinal === 0 ? "saldo" : "mercadopago",
      cliente_email: input.clienteEmail,
      cliente_nombre: input.clienteNombre,
      cupon_id: cuponAplicado?.id,
      cupon_codigo: cuponAplicado?.codigo,
      descuento_aplicado: descuentoAplicado,
      referido_codigo: input.codigoReferido,
      saldo_usado: saldoUsado,
    });

    console.log("[Tienda] Pago creado:", pagoId);

    // 4.5. Si el precio es 0 (pagado completamente con saldo), procesar inmediatamente
    if (precioFinal === 0 && saldoUsado > 0) {
      console.log("[Tienda] Pago completamente cubierto con saldo, procesando inmediatamente...");
      
      // Descontar el saldo usado
      await referidosService.debitarSaldoPorEmail(
        input.clienteEmail,
        saldoUsado,
        `Pago del plan ${plan.nombre}`
      );

      // Preparar info de referido para emails
      let referidoInfo = null;
      let referidorEmail = '';
      let comisionReferidor = 0;
      let descuentoReferido = 0;

      // Procesar el referido si hay cÃ³digo
      if (input.codigoReferido) {
        // Obtener info del referidor antes de procesar
        const validacionReferido = await referidosService.validarCodigo(input.codigoReferido, input.clienteEmail);
        const settings = await referidosService.getSettings();
        
        if (validacionReferido.valido && validacionReferido.referrer_email && settings) {
          referidorEmail = validacionReferido.referrer_email;
          descuentoReferido = Math.round(plan.precio * (settings.porcentaje_descuento_referido || 0) / 100);
          comisionReferidor = Math.round(plan.precio * (settings.porcentaje_recompensa || 0) / 100);
          
          referidoInfo = {
            codigoUsado: input.codigoReferido,
            referidorEmail: referidorEmail,
            porcentajeDescuento: settings.porcentaje_descuento_referido || 0,
            descuentoAplicado: descuentoReferido,
            comisionReferidor: comisionReferidor,
            saldoUsado: saldoUsado,
            metodoPago: 'saldo' as const,
          };
        }

        await referidosService.procesarReferidoPorEmail(
          input.codigoReferido,
          input.clienteEmail,
          plan.precio, // Monto original para calcular comisiÃ³n
          pagoId
        );
      }

      // Crear la cuenta VPN y obtener credenciales
      let cuentaVPN = null;
      try {
        cuentaVPN = await this.crearCuentaVPNConRetorno(pago, plan, referidoInfo);
        await this.actualizarEstadoPago(pagoId, "aprobado");
      } catch (error: any) {
        console.error("[Tienda] Error creando cuenta VPN:", error);
        // Reembolsar el saldo
        await referidosService.acreditarSaldoPorEmail(
          input.clienteEmail,
          saldoUsado,
          `Reembolso por error en compra`,
          'reembolso'
        );
        await this.actualizarEstadoPago(pagoId, "rechazado");
        throw new Error(`Error creando cuenta VPN: ${error.message}`);
      }

      return {
        pago: { ...pago, estado: "aprobado" as const },
        linkPago: "", // No hay link porque ya estÃ¡ procesado
        descuentoAplicado: descuentoAplicado > 0 ? descuentoAplicado : undefined,
        cuponAplicado,
        saldoUsado,
        pagoConSaldoCompleto: true,
        codigoReferidoUsado: input.codigoReferido || undefined,
        cuentaVPN,
      };
    }

    // 5. Crear preferencia en MercadoPago (si hay monto a pagar)
    try {
      const { id: preferenceId, initPoint } =
        await this.mercadopago.crearPreferencia(
          pagoId,
          plan.nombre,
          precioFinal, // MercadoPago recibe precio con descuento
          input.clienteEmail,
          input.clienteNombre
        );

      console.log("[Tienda] Preferencia de MercadoPago creada:", preferenceId);

      // Guardar metadata para procesar después del pago
      await pagosSupabaseService.actualizarMetadata(pagoId, {
        saldoUsado,
        codigoReferido: input.codigoReferido,
        montoOriginal: plan.precio,
      });

      return {
        pago,
        linkPago: initPoint,
        descuentoAplicado: descuentoAplicado > 0 ? descuentoAplicado : undefined,
        cuponAplicado,
        saldoUsado: saldoUsado > 0 ? saldoUsado : undefined,
      };
    } catch (error: any) {
      // Si falla la creaciÃ³n de la preferencia, marcar el pago como rechazado
      await this.actualizarEstadoPago(pagoId, "rechazado");
      throw new Error(`Error creando link de pago: ${error.message}`);
    }
  }

  /**
   * Procesa un webhook de MercadoPago
   */
  async procesarWebhook(body: any): Promise<void> {
    console.log("[Tienda] Procesando webhook...");

    const resultado = await this.mercadopago.procesarWebhook(body);

    if (!resultado.procesado || !resultado.pagoId) {
      console.log("[Tienda] Webhook no procesado o sin referencia de pago");
      return;
    }

    const { pagoId, mpPaymentId, estado } = resultado;

    // Obtener el pago de nuestra base de datos
    const pago = await this.obtenerPagoPorId(pagoId);
    if (!pago) {
      console.error("[Tienda] Pago no encontrado:", pagoId);
      return;
    }

    console.log("[Tienda] Estado del pago en MercadoPago:", estado);

    // Actualizar estado segÃºn la respuesta de MercadoPago
    if (estado === "approved") {
      // Procesar si el pago estÃ¡ pendiente o rechazado (ya que puede llegar primero el webhook de rejected)
      if (pago.estado === "pendiente" || pago.estado === "rechazado") {
        await this.confirmarPagoYCrearCuenta(pagoId, mpPaymentId!);
      } else {
        console.log("[Tienda] Pago ya procesado anteriormente");
      }
    } else if (estado === "rejected" || estado === "cancelled") {
      // Solo marcar como rechazado si aÃºn estÃ¡ pendiente
      if (pago.estado === "pendiente") {
        await this.actualizarEstadoPago(pagoId, "rechazado", mpPaymentId);
        console.log("[Tienda] Pago marcado como rechazado");
      }
    }
  }

  /**
   * Crea una cuenta VPN y retorna las credenciales
   * Usado para pagos con saldo completo donde necesitamos mostrar las credenciales inmediatamente
   */
  private async crearCuentaVPNConRetorno(
    pago: Pago, 
    plan: Plan,
    referidoInfo?: {
      codigoUsado: string;
      referidorEmail: string;
      porcentajeDescuento: number;
      descuentoAplicado: number;
      comisionReferidor: number;
      saldoUsado?: number;
      metodoPago: 'mercadopago' | 'saldo' | 'mixto';
    } | null
  ): Promise<{ username: string; password: string; expiracion: string; categoria: string }> {
    // 1. Generar credenciales usando el nombre del cliente
    const { username, password } = this.servex.generarCredenciales(pago.cliente_nombre);
    console.log(`[Tienda] Username generado: ${username} para cliente: ${pago.cliente_nombre}`);

    // 2. Obtener categorÃ­as activas (no expiradas)
    const categorias = await this.servex.obtenerCategoriasActivas();
    if (categorias.length === 0) {
      throw new Error("No hay categorÃ­as activas disponibles en Servex. Por favor contacte al administrador.");
    }
    const categoria = categorias[0];
    console.log(`[Tienda] Usando categorÃ­a activa: ${categoria.name} (ID: ${categoria.id})`);

    // 3. Crear cliente en Servex
    const clienteData: ClienteServex = {
      username,
      password,
      category_id: categoria.id,
      connection_limit: plan.connection_limit,
      duration: plan.dias,
      type: "user",
      observation: `Cliente: ${pago.cliente_nombre} - Email: ${pago.cliente_email} - Plan: ${plan.nombre}`,
    };

    const clienteCreado = await this.servex.crearCliente(clienteData);

    // 4. Guardar informaciÃ³n de la cuenta en la base de datos
    await this.guardarCuentaServex(
      pago.id,
      clienteCreado.id,
      clienteCreado.username,
      clienteCreado.password,
      categoria.name,
      clienteCreado.expiration_date,
      clienteCreado.connection_limit
    );

    console.log("[Tienda] âœ… Cuenta VPN creada exitosamente:", clienteCreado.username);
    const expiracionFormateada = new Date(clienteCreado.expiration_date).toLocaleDateString("es-AR");

    // 5. Enviar credenciales por email con info de referido
    try {
      await emailService.enviarCredencialesCliente(pago.cliente_email, {
        username: clienteCreado.username,
        password: clienteCreado.password,
        categoria: categoria.name,
        expiracion: expiracionFormateada,
        servidores: this.wsService.obtenerEstadisticas().map((s: any) => `${s.serverName} (${s.location})`),
        referido: referidoInfo || undefined,
      });
      console.log("[Tienda] âœ… Email enviado a:", pago.cliente_email);
    } catch (emailError: any) {
      console.error("[Tienda] âš ï¸ Error enviando email:", emailError.message);
    }

    // 6. Notificar al administrador con info de referido
    try {
      await emailService.notificarVentaAdmin("cliente", {
        clienteNombre: pago.cliente_nombre,
        clienteEmail: pago.cliente_email,
        monto: pago.monto,
        descripcion: `Plan: ${plan.nombre} (${plan.connection_limit} conexiones, ${plan.dias} dÃ­as) - Pagado con SALDO`,
        username: clienteCreado.username,
        referido: referidoInfo || undefined,
      });
      console.log("[Tienda] âœ… NotificaciÃ³n enviada al administrador");
    } catch (emailError: any) {
      console.error("[Tienda] âš ï¸ Error notificando al admin:", emailError.message);
    }

    // 7. Sincronizar con Supabase
    try {
      await supabaseService.syncApprovedPurchase({
        email: pago.cliente_email,
        planNombre: plan.nombre,
        monto: pago.monto,
        tipo: 'plan',
        servexUsername: clienteCreado.username,
        servexPassword: clienteCreado.password,
        servexExpiracion: clienteCreado.expiration_date,
        servexConnectionLimit: clienteCreado.connection_limit,
        mpPaymentId: undefined,
      });
    } catch (supabaseError: any) {
      console.error("[Tienda] âš ï¸ Error sincronizando con Supabase:", supabaseError.message);
    }

    // Retornar las credenciales para mostrar en el frontend
    return {
      username: clienteCreado.username,
      password: clienteCreado.password,
      expiracion: expiracionFormateada,
      categoria: categoria.name,
    };
  }

  /**
   * Confirma un pago y crea la cuenta en Servex
   * âœ… MEJORADO: ValidaciÃ³n anti-duplicado
   */
  private async confirmarPagoYCrearCuenta(
    pagoId: string,
    mpPaymentId: string
  ): Promise<void> {
    console.log("[Tienda] Confirmando pago y creando cuenta VPN:", pagoId);

    // Obtener pago y plan
    let pago = await this.obtenerPagoPorId(pagoId);
    if (!pago) {
      throw new Error("Pago no encontrado");
    }

    // âœ… VALIDACIÃ“N ANTI-DUPLICADO: Verificar si ya tiene cuenta
    if (pago.servex_cuenta_id) {
      console.log(
        "[Tienda] âš ï¸ Cuenta ya fue creada para este pago:",
        pago.servex_cuenta_id,
        "- Abortando para evitar duplicados"
      );
      return;
    }

    // âœ… VALIDACIÃ“N ANTI-RACE-CONDITION: Verificar si el pago ya fue procesado
    // (estado != "pendiente" significa que otro webhook ya lo procesÃ³)
    if (pago.estado !== "pendiente") {
      console.log(
        "[Tienda] âš ï¸ Pago ya fue procesado (estado: " +
          pago.estado +
          ") - Abortando para evitar duplicados"
      );
      return;
    }

    const plan = this.db.obtenerPlanPorId(pago.plan_id);
    if (!plan) {
      throw new Error("Plan no encontrado");
    }

    try {
      // 1. Marcar estado como "aprobado" INMEDIATAMENTE para evitar race condition
      // Esto protege contra mÃºltiples webhooks simultÃ¡neos
      await this.actualizarEstadoPago(pagoId, "aprobado", mpPaymentId);
      console.log(
        "[Tienda] âœ… Estado marcado como aprobado (bloqueo de duplicados)"
      );

      // 2. Generar credenciales usando el nombre del cliente
      const { username, password } = this.servex.generarCredenciales(
        pago.cliente_nombre
      );
      console.log(
        `[Tienda] Username generado: ${username} para cliente: ${pago.cliente_nombre}`
      );

      // 3. Obtener categorÃ­as activas (no expiradas)
      const categorias = await this.servex.obtenerCategoriasActivas();
      if (categorias.length === 0) {
        throw new Error(
          "No hay categorÃ­as activas disponibles en Servex. Por favor contacte al administrador."
        );
      }
      const categoria = categorias[0];
      console.log(
        `[Tienda] Usando categorÃ­a activa: ${categoria.name} (ID: ${categoria.id})`
      );

      // 4. Crear cliente en Servex
      const clienteData: ClienteServex = {
        username,
        password,
        category_id: categoria.id,
        connection_limit: plan.connection_limit,
        duration: plan.dias,
        type: "user",
        observation: `Cliente: ${pago.cliente_nombre} - Email: ${pago.cliente_email} - Plan: ${plan.nombre}`,
      };

      const clienteCreado = await this.servex.crearCliente(clienteData);

      // 5. Guardar informaciÃ³n de la cuenta en la base de datos
      await this.guardarCuentaServex(
        pagoId,
        clienteCreado.id,
        clienteCreado.username,
        clienteCreado.password,
        categoria.name,
        clienteCreado.expiration_date,
        clienteCreado.connection_limit
      );

      // âœ… IMPORTANTE: PequeÃ±o delay para asegurar que la DB escribiÃ³ los datos
      // Esto previene race conditions cuando el cliente consulta inmediatamente
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log(
        "[Tienda] âœ… Cuenta VPN creada exitosamente:",
        clienteCreado.username
      );

      // Aplicar cupón si se usó uno
      let cuponInfo = null;
      if (pago.cupon_id) {
        try {
          const descuentoAplicado = pago.descuento_aplicado || 0;
          await cuponesService.aplicarCupon(
            pago.cupon_id,
            pago.cliente_email,
            pago.id,
            plan.precio,
            descuentoAplicado
          );
          const cupon = await cuponesService.obtenerCuponPorId(pago.cupon_id);
          if (cupon) {
            cuponInfo = {
              codigo: cupon.codigo,
              tipo: cupon.tipo as 'porcentaje' | 'fijo',
              valor: cupon.valor,
              descuentoAplicado,
              montoOriginal: plan.precio,
              montoFinal: pago.monto
            };
          }
          console.log(`[Tienda] ✅ Cupón ${pago.cupon_id} aplicado (uso incrementado)`);
        } catch (cuponError: any) {
          console.error(`[Tienda] âš ï¸ Error aplicando cupÃ³n ${pago.cupon_id}:`, cuponError.message);
          // No fallar la creaciÃ³n de cuenta por error en cupÃ³n
        }
      }

      // Enviar credenciales por email
      try {
        await emailService.enviarCredencialesCliente(pago.cliente_email, {
          username: clienteCreado.username,
          password: clienteCreado.password,
          categoria: categoria.name,
          expiracion: new Date(
            clienteCreado.expiration_date
          ).toLocaleDateString("es-AR"),
          servidores: this.wsService.obtenerEstadisticas().map((s: any) => `${s.serverName} (${s.location})`),
          cupon: cuponInfo || undefined,
        });
        console.log("[Tienda] âœ… Email enviado a:", pago.cliente_email);
      } catch (emailError: any) {
        console.error("[Tienda] âš ï¸ Error enviando email:", emailError.message);
        // No lanzamos error, el servicio principal ya estÃ¡ creado
      }

      // Notificar al administrador
      try {
        await emailService.notificarVentaAdmin("cliente", {
          clienteNombre: pago.cliente_nombre,
          clienteEmail: pago.cliente_email,
          monto: pago.monto,
          descripcion: `Plan: ${plan.nombre} (${plan.connection_limit} conexiones, ${plan.dias} dÃ­as)`,
          username: clienteCreado.username,
          cupon: cuponInfo || undefined,
        });
        console.log("[Tienda] âœ… NotificaciÃ³n enviada al administrador");
      } catch (emailError: any) {
        console.error(
          "[Tienda] âš ï¸ Error notificando al admin:",
          emailError.message
        );
        // No lanzamos error, la venta ya estÃ¡ procesada
      }

      // Sincronizar con Supabase (historial de usuario)
      try {
        await supabaseService.syncApprovedPurchase({
          email: pago.cliente_email,
          planNombre: plan.nombre,
          monto: pago.monto,
          tipo: 'plan',
          servexUsername: clienteCreado.username,
          servexPassword: clienteCreado.password,
          servexExpiracion: clienteCreado.expiration_date,
          servexConnectionLimit: clienteCreado.connection_limit,
          mpPaymentId: mpPaymentId,
        });
      } catch (supabaseError: any) {
        console.error("[Tienda] âš ï¸ Error sincronizando con Supabase:", supabaseError.message);
        // No lanzamos error, la venta ya estÃ¡ procesada
      }

      // Procesar saldo y referidos si hay metadata
      try {
        const metadata = this.db.obtenerMetadataPago(pagoId);
        if (metadata) {
          // Descontar saldo usado
          if (metadata.saldoUsado && metadata.saldoUsado > 0) {
            await referidosService.debitarSaldoPorEmail(
              pago.cliente_email,
              metadata.saldoUsado,
              `Pago del plan ${plan.nombre}`
            );
            console.log(`[Tienda] âœ… Saldo descontado: $${metadata.saldoUsado}`);
          }

          // Procesar referido (acreditar comisiÃ³n al referidor)
          if (metadata.codigoReferido) {
            await referidosService.procesarReferidoPorEmail(
              metadata.codigoReferido,
              pago.cliente_email,
              metadata.montoOriginal || plan.precio,
              pagoId
            );
            console.log(`[Tienda] âœ… Referido procesado con cÃ³digo: ${metadata.codigoReferido}`);
          }
        }
      } catch (referidoError: any) {
        console.error("[Tienda] âš ï¸ Error procesando saldo/referido:", referidoError.message);
        // No lanzamos error, la venta ya estÃ¡ procesada
      }
    } catch (error: any) {
      console.error("[Tienda] âŒ Error creando cuenta VPN:", error.message);
      // Revertir el estado del pago si falla la creaciÃ³n de la cuenta
      await this.actualizarEstadoPago(pagoId, "pendiente");
      throw error;
    }
  }

  /**
   * Obtiene informaciÃ³n de un pago
   */
  async obtenerPago(pagoId: string): Promise<Pago | null> {
    return this.obtenerPagoPorId(pagoId);
  }

  /**
   * Verifica y procesa un pago manualmente (para cuando el cliente vuelve de MP)
   * ðŸ”´ MEJORADO: Logging detallado para debugging
   * ðŸ”´ MEJORADO: TambiÃ©n verifica pagos "rechazados" por si el usuario hizo un reintento exitoso
   */
  async verificarYProcesarPago(pagoId: string): Promise<Pago | null> {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ðŸ” VERIFICAR Y PROCESAR PAGO: ${pagoId}`);

    const pago = await this.obtenerPagoPorId(pagoId);
    if (!pago) {
      console.log(`[${timestamp}] âŒ Pago NO ENCONTRADO en BD`);
      return null;
    }

    console.log(`[${timestamp}] ðŸ“Š Estado actual en BD: "${pago.estado}"`);

    // Si el pago ya estÃ¡ aprobado, solo devolver la informaciÃ³n
    if (pago.estado === "aprobado") {
      console.log(`[${timestamp}] âœ… Pago ya estÃ¡ APROBADO, devolviendo info`);
      return pago;
    }

    // Si estÃ¡ pendiente O rechazado, verificar en MercadoPago
    // (rechazado tambiÃ©n porque el usuario puede haber hecho un segundo intento exitoso)
    if (pago.estado === "pendiente" || pago.estado === "rechazado") {
      console.log(
        `[${timestamp}] ðŸŒ Estado ${pago.estado.toUpperCase()}: consultando MercadoPago...`
      );
      const pagoMP = await this.mercadopago.verificarPagoPorReferencia(pagoId);

      if (pagoMP) {
        console.log(
          `[${timestamp}] ðŸ“ˆ Respuesta de MercadoPago: status="${pagoMP.status}", id="${pagoMP.id}"`
        );

        if (pagoMP.status === "approved") {
          console.log(
            `[${timestamp}] âœ… Â¡APROBADO EN MERCADOPAGO! Procesando cuenta...`
          );
          
          // Si el pago estaba rechazado, primero lo volvemos a pendiente
          if (pago.estado === "rechazado") {
            console.log(`[${timestamp}] ðŸ”„ Pago rechazado tiene nuevo pago aprobado, reseteando a pendiente...`);
            await this.actualizarEstadoPago(pagoId, "pendiente");
          }
          
          // Confirmar el pago y crear la cuenta
          await this.confirmarPagoYCrearCuenta(pagoId, pagoMP.id);
          // Devolver el pago actualizado
          const pagoActualizado = await this.obtenerPagoPorId(pagoId);
          console.log(
            `[${timestamp}] âœ… PROCESAMIENTO COMPLETADO. Estado final: "${pagoActualizado?.estado}"`
          );
          return pagoActualizado;
        } else {
          console.log(
            `[${timestamp}] âš ï¸ Pago en estado "${pagoMP.status}" (no aprobado aÃºn)`
          );
        }
      } else {
        console.log(
          `[${timestamp}] âš ï¸ Pago NO ENCONTRADO en MercadoPago (puede que el webhook no haya llegado aÃºn)`
        );
      }
    } else {
      console.log(
        `[${timestamp}] â„¹ï¸ Estado actual es "${pago.estado}" (ni pendiente ni aprobado)`
      );
    }

    console.log(
      `[${timestamp}] ðŸŽ¯ Devolviendo pago con estado: "${pago.estado}"`
    );
    return pago;
  }

  /**
   * ADMIN: Aprobar pago manualmente (sin verificar MercadoPago)
   * Ãštil para pagos que se perdieron durante downtime del backend
   */
  async aprobarPagoManualmente(pagoId: string, adminMotivo: string = 'AprobaciÃ³n manual admin'): Promise<Pago> {
    console.log(`[Tienda ADMIN] ðŸ”§ Aprobando pago manualmente: ${pagoId}`);
    console.log(`[Tienda ADMIN] Motivo: ${adminMotivo}`);

    const pago = await this.obtenerPagoPorId(pagoId);
    if (!pago) {
      throw new Error(`Pago no encontrado: ${pagoId}`);
    }

    // Verificar que no tenga ya una cuenta creada
    if (pago.servex_cuenta_id) {
      console.log(`[Tienda ADMIN] âš ï¸ Este pago ya tiene cuenta: ${pago.servex_username}`);
      return pago;
    }

    // Llamar al mÃ©todo privado con un payment_id fake
    const fakePaymentId = `ADMIN-MANUAL-${Date.now()}`;
    await this.confirmarPagoYCrearCuenta(pagoId, fakePaymentId);

    // Devolver el pago actualizado
    const pagoActualizado = await this.obtenerPagoPorId(pagoId);
    if (!pagoActualizado) {
      throw new Error('Error: pago no encontrado despuÃ©s de aprobar');
    }

    console.log(`[Tienda ADMIN] âœ… Pago aprobado manualmente. Username: ${pagoActualizado.servex_username}`);
    return pagoActualizado;
  }

  /**
   * ADMIN: Buscar pagos por email
   */
  async buscarPagosPorEmail(email: string): Promise<Pago[]> {
    return pagosSupabaseService.obtenerPagosPorEmail(email);
  }
}
