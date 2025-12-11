import { v4 as uuidv4 } from "uuid";
import { DatabaseService } from "./database.service";
import { ServexService } from "./servex.service";
import { MercadoPagoService } from "./mercadopago.service";
import { configService } from "./config.service";
import emailService from "./email.service";
import { cuponesService } from "./cupones.service";
import {
  PlanRevendedor,
  PagoRevendedor,
  CrearPagoRevendedorInput,
  RevendedorServex,
} from "../types";

export class TiendaRevendedoresService {
  constructor(
    private db: DatabaseService,
    private servex: ServexService,
    private mercadopago: MercadoPagoService
  ) {}

  /**
   * Infers the duration in days for a reseller plan when the database does not provide it.
   * Falls back to parsing the plan's name/description so credit plans also get an expiration.
   */
  private inferirDuracionPlan(plan: PlanRevendedor): number | undefined {
    if (plan.dias && plan.dias > 0) {
      return plan.dias;
    }

    const texto = `${plan.nombre || ""} ${plan.descripcion || ""}`.toLowerCase();

    // Prefer explicit day counts if present (e.g. "30 días")
    const matchDias = texto.match(/(\d+)\s*d[ií]a?s?/);
    if (matchDias) {
      const dias = parseInt(matchDias[1], 10);
      if (Number.isFinite(dias) && dias > 0) {
        return dias;
      }
    }

    // Fall back to months hints (e.g. "1 mes", "5 meses")
    const matchMeses = texto.match(/(\d+)\s*mes(?:es)?/);
    if (matchMeses) {
      const meses = parseInt(matchMeses[1], 10);
      if (Number.isFinite(meses) && meses > 0) {
        return meses * 30;
      }
    }

    if (plan.account_type === "validity") {
      return 30;
    }

    if (plan.account_type === "credit") {
      return 30;
    }

    return undefined;
  }

  /**
   * Obtiene el servicio de MercadoPago (para acceso desde rutas)
   */
  getMercadoPagoService(): MercadoPagoService {
    return this.mercadopago;
  }

  /**
   * Obtiene todos los planes de revendedores activos con overrides aplicados
   */
  obtenerPlanesRevendedores(options?: { forNewCustomers?: boolean; forRenewal?: boolean }): PlanRevendedor[] {
    const planesBase = this.db.obtenerPlanesRevendedores();
    console.log(
      "[TiendaRevendedores] 📊 Planes base obtenidos:",
      planesBase.length,
      "planes"
    );
    
    // Debug: ver plan 1
    const plan1Base = planesBase.find((p: any) => p.id === 1);
    if (plan1Base) {
      console.log("[TiendaRevendedores] 🔍 Plan 1 base:", JSON.stringify(plan1Base));
    }
    
    // Aplicar overrides de configuración si existen
    const overrideOptions = options ?? { forNewCustomers: true };

    const planesConOverrides = (
      configService.aceptarOverridesAListaPlanesRevendedor(
        planesBase,
        overrideOptions
      ) as PlanRevendedor[]
    ).map((plan) => {
          const duracionInferida = this.inferirDuracionPlan(plan);
          if (!plan.dias && duracionInferida) {
            console.log(
              `[TiendaRevendedores] ℹ️ Duración inferida para plan ${plan.id}: ${duracionInferida} días`
            );
            return { ...plan, dias: duracionInferida } as PlanRevendedor;
          }
          return plan;
        });
    
    // Debug: ver plan 1 después de overrides
    const plan1Overrides = planesConOverrides.find((p: any) => p.id === 1);
    if (plan1Overrides) {
      console.log("[TiendaRevendedores] 🔍 Plan 1 después de overrides:", JSON.stringify(plan1Overrides));
    }
    
    return planesConOverrides;
  }

  /**
   * Procesa una nueva compra de plan de revendedor
   */
  async procesarCompra(input: CrearPagoRevendedorInput): Promise<{
    pago: PagoRevendedor;
    linkPago: string;
  }> {
    // 1. Validar que el plan existe
    let plan = this.db.obtenerPlanRevendedorPorId(input.planRevendedorId);
    if (!plan) {
      throw new Error("Plan de revendedor no encontrado");
    }

    if (!plan.activo) {
      throw new Error("Plan no disponible");
    }

    // 2. Aplicar overrides de configuración
    plan = configService.aceptarOverridesAlPlanRevendedor(plan, {
      forNewCustomers: true,
    }) as PlanRevendedor;

    const duracionInferida = this.inferirDuracionPlan(plan);
    if (!plan.dias && duracionInferida) {
      plan = { ...plan, dias: duracionInferida } as PlanRevendedor;
      console.log(
        `[TiendaRevendedores] ℹ️ Duración ajustada para plan ${plan.id}: ${duracionInferida} días`
      );
    }
    console.log(
      `[TiendaRevendedores] Plan ${plan!.id} - Precio final: $${plan!.precio}`
    );

    // 3. Validar cupón si se proporcionó uno
    let precioFinal = plan!.precio;
    let descuentoAplicado = 0;
    let cuponId: number | undefined;

    if (input.codigoCupon) {
      console.log(`[TiendaRevendedores] Validando cupón: ${input.codigoCupon}`);
      const validacion = await cuponesService.validarCupon(input.codigoCupon, input.planRevendedorId, input.clienteEmail);

      if (!validacion.valido) {
        throw new Error(validacion.mensaje_error || "Cupón inválido");
      }

      // Validar que el cupón existe
      if (!validacion.cupon) {
        console.error('[TiendaRevendedores] ERROR: Cupón validado pero no encontrado!', validacion);
        throw new Error("Error: Cupón validado pero no encontrado");
      }

      // Calcular el descuento basado en el precio del plan
      descuentoAplicado = cuponesService.calcularDescuento(validacion.cupon, plan!.precio);
      precioFinal = Math.max(0, plan!.precio - descuentoAplicado);
      cuponId = validacion.cupon.id;

      console.log(`[TiendaRevendedores] ✅ Cupón válido: ${validacion.cupon.codigo}`);
      console.log(`[TiendaRevendedores] 📊 Descuento: $${descuentoAplicado} aplicado`);
      console.log(`[TiendaRevendedores] 💰 Precio: $${plan!.precio} → $${precioFinal}`);
    }

    // 4. Crear registro de pago en la base de datos
    const pagoId = uuidv4();
    const pago = this.db.crearPagoRevendedor({
      id: pagoId,
      plan_revendedor_id: plan!.id,
      monto: precioFinal,
      estado: "pendiente",
      metodo_pago: "mercadopago",
      cliente_email: input.clienteEmail,
      cliente_nombre: input.clienteNombre,
      cupon_id: cuponId,
      descuento_aplicado: descuentoAplicado,
    });

    console.log("[TiendaRevendedores] Pago creado:", pagoId);

    // 3. Crear preferencia en MercadoPago
    try {
      const { id: preferenceId, initPoint } =
        await this.mercadopago.crearPreferencia(
          pagoId,
          plan!.nombre,
          precioFinal, // Usar precio con descuento aplicado
          input.clienteEmail,
          input.clienteNombre,
          "revendedor"
        );

      console.log(
        "[TiendaRevendedores] Preferencia de MercadoPago creada:",
        preferenceId
      );

      return {
        pago,
        linkPago: initPoint,
      };
    } catch (error: any) {
      // Si falla la creación de la preferencia, marcar el pago como rechazado
      this.db.actualizarEstadoPagoRevendedor(pagoId, "rechazado");
      throw new Error(`Error creando link de pago: ${error.message}`);
    }
  }

  /**
   * Procesa un webhook de MercadoPago para revendedores
   */
  async procesarWebhook(body: any): Promise<void> {
    console.log("[TiendaRevendedores] 📨 Procesando webhook...", JSON.stringify(body).substring(0, 200));

    const resultado = await this.mercadopago.procesarWebhook(body);

    if (!resultado.procesado || !resultado.pagoId) {
      console.log(
        "[TiendaRevendedores] ⚠️ Webhook no procesado o sin referencia de pago",
        { procesado: resultado.procesado, pagoId: resultado.pagoId }
      );
      return;
    }

    const { pagoId, mpPaymentId, estado } = resultado;
    console.log(
      `[TiendaRevendedores] ✅ Webhook procesado: pagoId=${pagoId}, estado=${estado}, mpPaymentId=${mpPaymentId}`
    );

    // Obtener el pago de nuestra base de datos
    const pago = this.db.obtenerPagoRevendedorPorId(pagoId);
    if (!pago) {
      console.error("[TiendaRevendedores] ❌ Pago no encontrado en BD:", pagoId);
      return;
    }

    console.log(
      `[TiendaRevendedores] 📊 Estado actual en BD: ${pago.estado}, estado MercadoPago: ${estado}`
    );

    // Actualizar estado según la respuesta de MercadoPago
    if (estado === "approved") {
      // Procesar si el pago está pendiente o rechazado (ya que puede llegar primero el webhook de rejected)
      if (pago.estado === "pendiente" || pago.estado === "rechazado") {
        console.log(
          `[TiendaRevendedores] 🔄 Pago aprobado en MP, creando revendedor...`
        );
        await this.confirmarPagoYCrearRevendedor(pagoId, mpPaymentId!);
      } else {
        console.log(
          `[TiendaRevendedores] ⚠️ Pago ya procesado anteriormente (estado: ${pago.estado})`
        );
      }
    } else if (estado === "rejected" || estado === "cancelled") {
      // Solo marcar como rechazado si aún está pendiente
      if (pago.estado === "pendiente") {
        this.db.actualizarEstadoPagoRevendedor(
          pagoId,
          "rechazado",
          mpPaymentId
        );
        console.log(
          `[TiendaRevendedores] ❌ Pago marcado como rechazado (estado MercadoPago: ${estado})`
        );
      }
    } else {
      console.log(
        `[TiendaRevendedores] ℹ️ Estado de pago no reconocido: ${estado}`
      );
    }
  }

  /**
   * Confirma un pago y crea el revendedor en Servex
   * ✅ MEJORADO: Validación anti-duplicado
   */
  private async confirmarPagoYCrearRevendedor(
    pagoId: string,
    mpPaymentId: string
  ): Promise<void> {
    console.log(
      "[TiendaRevendedores] Confirmando pago y creando revendedor:",
      pagoId
    );

    // Obtener pago y plan
    let pago = this.db.obtenerPagoRevendedorPorId(pagoId);
    if (!pago) {
      throw new Error("Pago no encontrado");
    }

    // ✅ VALIDACIÓN ANTI-DUPLICADO: Verificar si ya tiene revendedor
    if (pago.servex_revendedor_id) {
      console.log(
        "[TiendaRevendedores] ⚠️ Revendedor ya fue creado para este pago:",
        pago.servex_revendedor_id,
        "- Abortando para evitar duplicados"
      );
      return;
    }

    // ✅ VALIDACIÓN ANTI-RACE-CONDITION: Verificar si el pago ya fue procesado
    // (estado != "pendiente" significa que otro webhook ya lo procesó)
    if (pago.estado !== "pendiente") {
      console.log(
        "[TiendaRevendedores] ⚠️ Pago ya fue procesado (estado: " +
          pago.estado +
          ") - Abortando para evitar duplicados"
      );
      return;
    }

    const plan = this.db.obtenerPlanRevendedorPorId(pago.plan_revendedor_id);
    if (!plan) {
      throw new Error("Plan no encontrado");
    }

    try {
      // 1. Marcar estado como "aprobado" INMEDIATAMENTE para evitar race condition
      // Esto protege contra múltiples webhooks simultáneos
      this.db.actualizarEstadoPagoRevendedor(pagoId, "aprobado", mpPaymentId);
      console.log(
        "[TiendaRevendedores] ✅ Estado marcado como aprobado (bloqueo de duplicados)"
      );

      // 2. Generar credenciales usando el nombre del cliente
      const { username, password, name } =
        this.servex.generarCredencialesRevendedor(pago.cliente_nombre);
      console.log(
        `[TiendaRevendedores] Username generado: ${username} para cliente: ${pago.cliente_nombre}`
      );
      console.log(
        `[TiendaRevendedores] Nombre visible normalizado para Servex: ${name}`
      );

      // 3. Obtener categorías activas (no expiradas)
      const categorias = await this.servex.obtenerCategoriasActivas();
      if (categorias.length === 0) {
        throw new Error(
          "No hay categorías activas disponibles en Servex. Por favor contacte al administrador."
        );
      }

      // Usar todas las categorías activas disponibles
      const categoryIds = categorias.map((c) => c.id);
      console.log(
        `[TiendaRevendedores] Usando ${
          categoryIds.length
        } categorías activas: [${categoryIds.join(", ")}]`
      );

      // Preparar datos del revendedor
      const revendedorData: RevendedorServex = {
        name,
        username,
        password,
        max_users: plan.max_users,
        account_type: plan.account_type,
        category_ids: categoryIds,
        obs: `Cliente: ${pago.cliente_nombre} - Email: ${pago.cliente_email} - Plan: ${plan.nombre}`,
      };

      // Agregar fecha de expiración para ambos tipos de cuenta (validity y credit)
      // Servex requiere expiration_date para que las cuentas expiren correctamente
      const duracionDias = this.inferirDuracionPlan(plan);

      if (duracionDias) {
        const fechaExpiracion = new Date();
        fechaExpiracion.setDate(fechaExpiracion.getDate() + duracionDias);
        revendedorData.expiration_date = fechaExpiracion
          .toISOString()
          .split("T")[0]; // YYYY-MM-DD
        console.log(
          `[TiendaRevendedores] 📅 Fecha de expiración calculada para ${plan.account_type}:`,
          revendedorData.expiration_date
        );
      } else {
        console.warn(
          `[TiendaRevendedores] ⚠️ No se pudo inferir duración para el plan ${plan.id}, la cuenta no tendrá fecha de expiración inicial`
        );
      }

      // 5. Crear revendedor en Servex
      const revendedorCreado = await this.servex.crearRevendedor(
        revendedorData
      );

      // ✅ VALIDACIÓN CRÍTICA: Asegurar que tenemos un ID válido
      if (!revendedorCreado || !revendedorCreado.id || revendedorCreado.id === 0) {
        throw new Error(
          `Revendedor creado en Servex pero sin ID válido. Username: ${username}. ` +
          `Respuesta de Servex: ${JSON.stringify(revendedorCreado)}`
        );
      }

      console.log(
        `[TiendaRevendedores] ✅ ID del revendedor validado: ${revendedorCreado.id}`
      );

      // 6. Calcular y guardar información del revendedor en la base de datos
      // Usar la expiración devuelta por Servex, o calcularla si no la devuelve
      let expiracionFinal = revendedorCreado.expiration_date;
      if (!expiracionFinal && plan.dias) {
        // Si Servex no devuelve expiration_date pero el plan tiene días, calcular internamente
        const fechaExpiracion = new Date();
        fechaExpiracion.setDate(fechaExpiracion.getDate() + plan.dias);
        expiracionFinal = fechaExpiracion.toISOString().split("T")[0];
        console.log(
          "[TiendaRevendedores] 📅 Expiración calculada internamente:",
          expiracionFinal
        );
      }

      this.db.guardarRevendedorServex(
        pagoId,
        revendedorCreado.id,
        revendedorCreado.username,
        password, // Guardamos la contraseña generada, no la que devuelve Servex
        revendedorCreado.max_users,
        revendedorCreado.account_type,
        expiracionFinal,
        duracionDias // Guardar la duración en días del plan (incluye inferencia)
      );

      console.log(
        "[TiendaRevendedores] ✅ Revendedor creado exitosamente:",
        revendedorCreado.username
      );

      // Aplicar cupón si se usó uno
      if (pago.cupon_id) {
        try {
          await cuponesService.aplicarCupon(pago.cupon_id);
          console.log(`[TiendaRevendedores] ✅ Cupón ${pago.cupon_id} aplicado (uso incrementado)`);
        } catch (cuponError: any) {
          console.error(`[TiendaRevendedores] ⚠️ Error aplicando cupón ${pago.cupon_id}:`, cuponError.message);
          // No fallar la creación del revendedor por error en cupón
        }
      }

      // Enviar email con las credenciales
      try {
        await emailService.enviarCredencialesRevendedor(pago.cliente_email, {
          username: revendedorCreado.username,
          password: password,
          tipo: plan.account_type === "credit" ? "credito" : "validez",
          credito: plan.account_type === "credit" ? plan.max_users : undefined,
          validez:
            plan.account_type === "validity" && revendedorCreado.expiration_date
              ? new Date(revendedorCreado.expiration_date).toLocaleDateString(
                  "es-AR"
                )
              : undefined,
          panelUrl: "https://servex.ws",
        });
        console.log(
          "[TiendaRevendedores] ✅ Email enviado a:",
          pago.cliente_email
        );
      } catch (emailError: any) {
        console.error(
          "[TiendaRevendedores] ⚠️ Error enviando email:",
          emailError.message
        );
        // No lanzamos error, el servicio principal ya está creado
      }

      // Notificar al administrador
      try {
        await emailService.notificarVentaAdmin("revendedor", {
          clienteNombre: pago.cliente_nombre,
          clienteEmail: pago.cliente_email,
          monto: pago.monto,
          descripcion: `Plan Revendedor: ${plan.nombre} (${
            plan.account_type === "credit"
              ? `${plan.max_users} créditos`
              : `Válido hasta ${
                  revendedorCreado.expiration_date
                    ? new Date(
                        revendedorCreado.expiration_date
                      ).toLocaleDateString("es-AR")
                    : "N/A"
                }`
          })`,
          username: revendedorCreado.username,
        });
        console.log(
          "[TiendaRevendedores] ✅ Notificación enviada al administrador"
        );
      } catch (emailError: any) {
        console.error(
          "[TiendaRevendedores] ⚠️ Error notificando al admin:",
          emailError.message
        );
        // No lanzamos error, la venta ya está procesada
      }
    } catch (error: any) {
      console.error(
        "[TiendaRevendedores] ❌ Error creando revendedor:",
        error.message
      );
      // Revertir el estado del pago si falla la creación del revendedor
      this.db.actualizarEstadoPagoRevendedor(pagoId, "pendiente");
      throw error;
    }
  }

  /**
   * Obtiene información de un pago de revendedor
   */
  obtenerPago(pagoId: string): PagoRevendedor | null {
    return this.db.obtenerPagoRevendedorPorId(pagoId);
  }

  /**
   * Verifica y procesa un pago manualmente (para cuando el cliente vuelve de MP)
   */
  async verificarYProcesarPago(pagoId: string): Promise<PagoRevendedor | null> {
    console.log(`[TiendaRevendedores] 🔍 verificarYProcesarPago: ${pagoId}`);
    try {
      const pago = this.db.obtenerPagoRevendedorPorId(pagoId);
      console.log(`[TiendaRevendedores] ✅ Pago obtenido de BD:`, pago ? "SÍ" : "NO");
      
      if (!pago) {
        console.log(`[TiendaRevendedores] ❌ Pago no encontrado`);
        return null;
      }

      console.log(`[TiendaRevendedores] 📊 Estado del pago:`, pago.estado);

      // Si el pago ya está aprobado, solo devolver la información
      if (pago.estado === "aprobado") {
        console.log(`[TiendaRevendedores] ✅ Pago ya aprobado, devolviendo...`);
        return pago;
      }

      // Si está pendiente O rechazado, verificar en MercadoPago
      // (rechazado también porque el usuario puede haber hecho un segundo intento exitoso)
      if (pago.estado === "pendiente" || pago.estado === "rechazado") {
        console.log(`[TiendaRevendedores] 🌐 Pago ${pago.estado}, verificando en MercadoPago...`);
        const pagoMP = await this.mercadopago.verificarPagoPorReferencia(pagoId);
        console.log(`[TiendaRevendedores] 📊 Respuesta MercadoPago:`, pagoMP ? `ENCONTRADO (status: ${pagoMP.status}, id: ${pagoMP.id})` : "NO ENCONTRADO");

        if (pagoMP && pagoMP.status === "approved") {
          console.log(`[TiendaRevendedores] ✅ MercadoPago aprobado (payment_id: ${pagoMP.id}), creando revendedor...`);
          
          // Si el pago estaba rechazado, primero lo volvemos a pendiente para que confirmarPagoYCrearRevendedor funcione
          if (pago.estado === "rechazado") {
            console.log(`[TiendaRevendedores] 🔄 Pago rechazado tiene nuevo pago aprobado, reseteando a pendiente...`);
            this.db.actualizarEstadoPagoRevendedor(pagoId, "pendiente");
          }
          
          // Confirmar el pago y crear el revendedor
          await this.confirmarPagoYCrearRevendedor(pagoId, pagoMP.id);
          // Devolver el pago actualizado
          const pagoActualizado = this.db.obtenerPagoRevendedorPorId(pagoId);
          console.log(`[TiendaRevendedores] ✅ Revendedor creado, devolviendo pago actualizado`);
          return pagoActualizado;
        } else {
          console.log(`[TiendaRevendedores] ⚠️ MercadoPago no aprobado (status: ${pagoMP?.status || 'N/A'})`);
        }
      }

      console.log(`[TiendaRevendedores] ℹ️ Devolviendo pago con estado:`, pago.estado);
      return pago;
    } catch (error: any) {
      console.error(`[TiendaRevendedores] ❌ ERROR EN verificarYProcesarPago:`, error.message);
      console.error(`[TiendaRevendedores] Stack:`, error.stack);
      throw error;
    }
  }
}
