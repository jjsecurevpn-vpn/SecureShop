import { v4 as uuidv4 } from "uuid";
import { DatabaseService } from "./database.service";
import { ServexService } from "./servex.service";
import { MercadoPagoService } from "./mercadopago.service";
import { DemoService } from "./demo.service";
import { configService } from "./config.service";
import emailService from "./email.service";
import { Plan, Pago, CrearPagoInput, ClienteServex } from "../types";

export class TiendaService {
  private demo: DemoService;

  constructor(
    private db: DatabaseService,
    private servex: ServexService,
    private mercadopago: MercadoPagoService
  ) {
    // Inicializar DemoService con la instancia de better-sqlite3
    this.demo = new DemoService(this.db.getDatabase(), this.servex);
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
        nombre: "Plan Básico",
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

    console.log("[Tienda] ✅ Planes creados exitosamente");

    // Verificar consistencia con configuración
    configService.verificarConsistenciaConDB(this.db);
  }

  /**
   * Obtiene todos los planes activos (con overrides de configuración)
   */
  obtenerPlanes(): Plan[] {
    const planesBase = this.db.obtenerPlanes();
    // Aplicar overrides de configuración si existen
    return configService.aceptarOverridesAListaPlanes(planesBase);
  }

  /**
   * Procesa una nueva compra
   */
  async procesarCompra(input: CrearPagoInput): Promise<{
    pago: Pago;
    linkPago: string;
  }> {
    // 1. Validar que el plan existe
    let plan = this.db.obtenerPlanPorId(input.planId);
    if (!plan) {
      throw new Error("Plan no encontrado");
    }

    if (!plan.activo) {
      throw new Error("Plan no disponible");
    }

    // 2. Aplicar overrides de configuración
    plan = configService.aceptarOverridesAlPlan(plan);
    console.log(`[Tienda] Plan ${plan.id} - Precio final: $${plan.precio}`);

    // 3. Crear registro de pago en la base de datos
    const pagoId = uuidv4();
    const pago = this.db.crearPago({
      id: pagoId,
      plan_id: plan.id,
      monto: plan.precio, // Usar precio con override aplicado
      estado: "pendiente",
      metodo_pago: "mercadopago",
      cliente_email: input.clienteEmail,
      cliente_nombre: input.clienteNombre,
    });

    console.log("[Tienda] Pago creado:", pagoId);

    // 4. Crear preferencia en MercadoPago
    try {
      const { id: preferenceId, initPoint } =
        await this.mercadopago.crearPreferencia(
          pagoId,
          plan.nombre,
          plan.precio, // MercadoPago recibe precio con override
          input.clienteEmail,
          input.clienteNombre
        );

      console.log("[Tienda] Preferencia de MercadoPago creada:", preferenceId);

      return {
        pago,
        linkPago: initPoint,
      };
    } catch (error: any) {
      // Si falla la creación de la preferencia, marcar el pago como rechazado
      this.db.actualizarEstadoPago(pagoId, "rechazado");
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
    const pago = this.db.obtenerPagoPorId(pagoId);
    if (!pago) {
      console.error("[Tienda] Pago no encontrado:", pagoId);
      return;
    }

    console.log("[Tienda] Estado del pago en MercadoPago:", estado);

    // Actualizar estado según la respuesta de MercadoPago
    if (estado === "approved") {
      // Procesar si el pago está pendiente o rechazado (ya que puede llegar primero el webhook de rejected)
      if (pago.estado === "pendiente" || pago.estado === "rechazado") {
        await this.confirmarPagoYCrearCuenta(pagoId, mpPaymentId!);
      } else {
        console.log("[Tienda] Pago ya procesado anteriormente");
      }
    } else if (estado === "rejected" || estado === "cancelled") {
      // Solo marcar como rechazado si aún está pendiente
      if (pago.estado === "pendiente") {
        this.db.actualizarEstadoPago(pagoId, "rechazado", mpPaymentId);
        console.log("[Tienda] Pago marcado como rechazado");
      }
    }
  }

  /**
   * Confirma un pago y crea la cuenta en Servex
   * ✅ MEJORADO: Validación anti-duplicado
   */
  private async confirmarPagoYCrearCuenta(
    pagoId: string,
    mpPaymentId: string
  ): Promise<void> {
    console.log("[Tienda] Confirmando pago y creando cuenta VPN:", pagoId);

    // Obtener pago y plan
    let pago = this.db.obtenerPagoPorId(pagoId);
    if (!pago) {
      throw new Error("Pago no encontrado");
    }

    // ✅ VALIDACIÓN ANTI-DUPLICADO: Verificar si ya tiene cuenta
    if (pago.servex_cuenta_id) {
      console.log(
        "[Tienda] ⚠️ Cuenta ya fue creada para este pago:",
        pago.servex_cuenta_id,
        "- Abortando para evitar duplicados"
      );
      return;
    }

    // ✅ VALIDACIÓN ANTI-RACE-CONDITION: Verificar si el pago ya fue procesado
    // (estado != "pendiente" significa que otro webhook ya lo procesó)
    if (pago.estado !== "pendiente") {
      console.log(
        "[Tienda] ⚠️ Pago ya fue procesado (estado: " +
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
      // Esto protege contra múltiples webhooks simultáneos
      this.db.actualizarEstadoPago(pagoId, "aprobado", mpPaymentId);
      console.log(
        "[Tienda] ✅ Estado marcado como aprobado (bloqueo de duplicados)"
      );

      // 2. Generar credenciales usando el nombre del cliente
      const { username, password } = this.servex.generarCredenciales(
        pago.cliente_nombre
      );
      console.log(
        `[Tienda] Username generado: ${username} para cliente: ${pago.cliente_nombre}`
      );

      // 3. Obtener categorías activas (no expiradas)
      const categorias = await this.servex.obtenerCategoriasActivas();
      if (categorias.length === 0) {
        throw new Error(
          "No hay categorías activas disponibles en Servex. Por favor contacte al administrador."
        );
      }
      const categoria = categorias[0];
      console.log(
        `[Tienda] Usando categoría activa: ${categoria.name} (ID: ${categoria.id})`
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

      // 5. Guardar información de la cuenta en la base de datos
      this.db.guardarCuentaServex(
        pagoId,
        clienteCreado.id,
        clienteCreado.username,
        clienteCreado.password,
        categoria.name,
        clienteCreado.expiration_date,
        clienteCreado.connection_limit
      );

      console.log(
        "[Tienda] ✅ Cuenta VPN creada exitosamente:",
        clienteCreado.username
      );

      // Enviar email con las credenciales
      try {
        await emailService.enviarCredencialesCliente(pago.cliente_email, {
          username: clienteCreado.username,
          password: clienteCreado.password,
          categoria: categoria.name,
          expiracion: new Date(
            clienteCreado.expiration_date
          ).toLocaleDateString("es-AR"),
          servidores: ["JJSecureARG1 (Argentina)", "JJSecureBR1 (Brasil)"],
        });
        console.log("[Tienda] ✅ Email enviado a:", pago.cliente_email);
      } catch (emailError: any) {
        console.error("[Tienda] ⚠️ Error enviando email:", emailError.message);
        // No lanzamos error, el servicio principal ya está creado
      }

      // Notificar al administrador
      try {
        await emailService.notificarVentaAdmin("cliente", {
          clienteNombre: pago.cliente_nombre,
          clienteEmail: pago.cliente_email,
          monto: pago.monto,
          descripcion: `Plan: ${plan.nombre} (${plan.connection_limit} conexiones, ${plan.dias} días)`,
          username: clienteCreado.username,
        });
        console.log("[Tienda] ✅ Notificación enviada al administrador");
      } catch (emailError: any) {
        console.error(
          "[Tienda] ⚠️ Error notificando al admin:",
          emailError.message
        );
        // No lanzamos error, la venta ya está procesada
      }
    } catch (error: any) {
      console.error("[Tienda] ❌ Error creando cuenta VPN:", error.message);
      // Revertir el estado del pago si falla la creación de la cuenta
      this.db.actualizarEstadoPago(pagoId, "pendiente");
      throw error;
    }
  }

  /**
   * Obtiene información de un pago
   */
  obtenerPago(pagoId: string): Pago | null {
    return this.db.obtenerPagoPorId(pagoId);
  }

  /**
   * Verifica y procesa un pago manualmente (para cuando el cliente vuelve de MP)
   * 🔴 MEJORADO: Logging detallado para debugging
   */
  async verificarYProcesarPago(pagoId: string): Promise<Pago | null> {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔍 VERIFICAR Y PROCESAR PAGO: ${pagoId}`);

    const pago = this.db.obtenerPagoPorId(pagoId);
    if (!pago) {
      console.log(`[${timestamp}] ❌ Pago NO ENCONTRADO en BD`);
      return null;
    }

    console.log(`[${timestamp}] 📊 Estado actual en BD: "${pago.estado}"`);

    // Si el pago ya está aprobado, solo devolver la información
    if (pago.estado === "aprobado") {
      console.log(`[${timestamp}] ✅ Pago ya está APROBADO, devolviendo info`);
      return pago;
    }

    // Si está pendiente, verificar en MercadoPago
    if (pago.estado === "pendiente") {
      console.log(
        `[${timestamp}] 🌐 Estado PENDIENTE: consultando MercadoPago...`
      );
      const pagoMP = await this.mercadopago.verificarPagoPorReferencia(pagoId);

      if (pagoMP) {
        console.log(
          `[${timestamp}] 📈 Respuesta de MercadoPago: status="${pagoMP.status}", id="${pagoMP.id}"`
        );

        if (pagoMP.status === "approved") {
          console.log(
            `[${timestamp}] ✅ ¡APROBADO EN MERCADOPAGO! Procesando cuenta...`
          );
          // Confirmar el pago y crear la cuenta
          await this.confirmarPagoYCrearCuenta(pagoId, pagoMP.id);
          // Devolver el pago actualizado
          const pagoActualizado = this.db.obtenerPagoPorId(pagoId);
          console.log(
            `[${timestamp}] ✅ PROCESAMIENTO COMPLETADO. Estado final: "${pagoActualizado?.estado}"`
          );
          return pagoActualizado;
        } else {
          console.log(
            `[${timestamp}] ⚠️ Pago en estado "${pagoMP.status}" (no aprobado aún)`
          );
        }
      } else {
        console.log(
          `[${timestamp}] ⚠️ Pago NO ENCONTRADO en MercadoPago (puede que el webhook no haya llegado aún)`
        );
      }
    } else {
      console.log(
        `[${timestamp}] ℹ️ Estado actual es "${pago.estado}" (ni pendiente ni aprobado)`
      );
    }

    console.log(
      `[${timestamp}] 🎯 Devolviendo pago con estado: "${pago.estado}"`
    );
    return pago;
  }
}
