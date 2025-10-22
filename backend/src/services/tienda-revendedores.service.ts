import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from './database.service';
import { ServexService } from './servex.service';
import { MercadoPagoService } from './mercadopago.service';
import emailService from './email.service';
import { PlanRevendedor, PagoRevendedor, CrearPagoRevendedorInput, RevendedorServex } from '../types';

export class TiendaRevendedoresService {
  constructor(
    private db: DatabaseService,
    private servex: ServexService,
    private mercadopago: MercadoPagoService
  ) {}

  /**
   * Obtiene todos los planes de revendedores activos
   */
  obtenerPlanesRevendedores(): PlanRevendedor[] {
    return this.db.obtenerPlanesRevendedores();
  }

  /**
   * Procesa una nueva compra de plan de revendedor
   */
  async procesarCompra(input: CrearPagoRevendedorInput): Promise<{
    pago: PagoRevendedor;
    linkPago: string;
  }> {
    // 1. Validar que el plan existe
    const plan = this.db.obtenerPlanRevendedorPorId(input.planRevendedorId);
    if (!plan) {
      throw new Error('Plan de revendedor no encontrado');
    }

    if (!plan.activo) {
      throw new Error('Plan no disponible');
    }

    // 2. Crear registro de pago en la base de datos
    const pagoId = uuidv4();
    const pago = this.db.crearPagoRevendedor({
      id: pagoId,
      plan_revendedor_id: plan.id,
      monto: plan.precio,
      estado: 'pendiente',
      metodo_pago: 'mercadopago',
      cliente_email: input.clienteEmail,
      cliente_nombre: input.clienteNombre,
    });

    console.log('[TiendaRevendedores] Pago creado:', pagoId);

    // 3. Crear preferencia en MercadoPago
    try {
      const { id: preferenceId, initPoint } = await this.mercadopago.crearPreferencia(
        pagoId,
        plan.nombre,
        plan.precio,
        input.clienteEmail,
        input.clienteNombre,
        'revendedor'
      );

      console.log('[TiendaRevendedores] Preferencia de MercadoPago creada:', preferenceId);

      return {
        pago,
        linkPago: initPoint,
      };
    } catch (error: any) {
      // Si falla la creación de la preferencia, marcar el pago como rechazado
      this.db.actualizarEstadoPagoRevendedor(pagoId, 'rechazado');
      throw new Error(`Error creando link de pago: ${error.message}`);
    }
  }

  /**
   * Procesa un webhook de MercadoPago para revendedores
   */
  async procesarWebhook(body: any): Promise<void> {
    console.log('[TiendaRevendedores] Procesando webhook...');

    const resultado = await this.mercadopago.procesarWebhook(body);

    if (!resultado.procesado || !resultado.pagoId) {
      console.log('[TiendaRevendedores] Webhook no procesado o sin referencia de pago');
      return;
    }

    const { pagoId, mpPaymentId, estado } = resultado;

    // Obtener el pago de nuestra base de datos
    const pago = this.db.obtenerPagoRevendedorPorId(pagoId);
    if (!pago) {
      console.error('[TiendaRevendedores] Pago no encontrado:', pagoId);
      return;
    }

    console.log('[TiendaRevendedores] Estado del pago en MercadoPago:', estado);

    // Actualizar estado según la respuesta de MercadoPago
    if (estado === 'approved') {
      // Procesar si el pago está pendiente o rechazado (ya que puede llegar primero el webhook de rejected)
      if (pago.estado === 'pendiente' || pago.estado === 'rechazado') {
        await this.confirmarPagoYCrearRevendedor(pagoId, mpPaymentId!);
      } else {
        console.log('[TiendaRevendedores] Pago ya procesado anteriormente');
      }
    } else if (estado === 'rejected' || estado === 'cancelled') {
      // Solo marcar como rechazado si aún está pendiente
      if (pago.estado === 'pendiente') {
        this.db.actualizarEstadoPagoRevendedor(pagoId, 'rechazado', mpPaymentId);
        console.log('[TiendaRevendedores] Pago marcado como rechazado');
      }
    }
  }

  /**
   * Confirma un pago y crea el revendedor en Servex
   */
  private async confirmarPagoYCrearRevendedor(pagoId: string, mpPaymentId: string): Promise<void> {
    console.log('[TiendaRevendedores] Confirmando pago y creando revendedor:', pagoId);

    // Obtener pago y plan
    const pago = this.db.obtenerPagoRevendedorPorId(pagoId);
    if (!pago) {
      throw new Error('Pago no encontrado');
    }

    const plan = this.db.obtenerPlanRevendedorPorId(pago.plan_revendedor_id);
    if (!plan) {
      throw new Error('Plan no encontrado');
    }

    try {
      // 1. Actualizar estado del pago
      this.db.actualizarEstadoPagoRevendedor(pagoId, 'aprobado', mpPaymentId);

      // 2. Generar credenciales usando el nombre del cliente
      const { username, password, name } = this.servex.generarCredencialesRevendedor(pago.cliente_nombre);
      console.log(`[TiendaRevendedores] Username generado: ${username} para cliente: ${pago.cliente_nombre}`);

      // 3. Obtener categorías activas (no expiradas)
      const categorias = await this.servex.obtenerCategoriasActivas();
      if (categorias.length === 0) {
        throw new Error('No hay categorías activas disponibles en Servex. Por favor contacte al administrador.');
      }
      
      // Usar todas las categorías activas disponibles
      const categoryIds = categorias.map(c => c.id);
      console.log(`[TiendaRevendedores] Usando ${categoryIds.length} categorías activas: [${categoryIds.join(', ')}]`);

      // 4. Preparar datos del revendedor
      const revendedorData: RevendedorServex = {
        name: `${name} - ${pago.cliente_nombre}`,
        username,
        password,
        max_users: plan.max_users,
        account_type: plan.account_type,
        category_ids: categoryIds,
        obs: `Cliente: ${pago.cliente_nombre} - Email: ${pago.cliente_email} - Plan: ${plan.nombre}`,
      };

      // Si es cuenta de validez, agregar fecha de expiración
      if (plan.account_type === 'validity' && plan.dias) {
        const fechaExpiracion = new Date();
        fechaExpiracion.setDate(fechaExpiracion.getDate() + plan.dias);
        revendedorData.expiration_date = fechaExpiracion.toISOString().split('T')[0]; // YYYY-MM-DD
      }

      // 5. Crear revendedor en Servex
      const revendedorCreado = await this.servex.crearRevendedor(revendedorData);

      // 6. Guardar información del revendedor en la base de datos
      this.db.guardarRevendedorServex(
        pagoId,
        revendedorCreado.id,
        revendedorCreado.username,
        password, // Guardamos la contraseña generada, no la que devuelve Servex
        revendedorCreado.max_users,
        revendedorCreado.account_type,
        revendedorCreado.expiration_date,
        plan.dias // Guardar la duración en días del plan
      );

      console.log('[TiendaRevendedores] ✅ Revendedor creado exitosamente:', revendedorCreado.username);

      // Enviar email con las credenciales
      try {
        await emailService.enviarCredencialesRevendedor(pago.cliente_email, {
          username: revendedorCreado.username,
          password: password,
          tipo: plan.account_type === 'credit' ? 'credito' : 'validez',
          credito: plan.account_type === 'credit' ? plan.max_users : undefined,
          validez: plan.account_type === 'validity' && revendedorCreado.expiration_date 
            ? new Date(revendedorCreado.expiration_date).toLocaleDateString('es-AR') 
            : undefined,
          panelUrl: 'https://front.servex.ws/login'
        });
        console.log('[TiendaRevendedores] ✅ Email enviado a:', pago.cliente_email);
      } catch (emailError: any) {
        console.error('[TiendaRevendedores] ⚠️ Error enviando email:', emailError.message);
        // No lanzamos error, el servicio principal ya está creado
      }

    } catch (error: any) {
      console.error('[TiendaRevendedores] ❌ Error creando revendedor:', error.message);
      // Revertir el estado del pago si falla la creación del revendedor
      this.db.actualizarEstadoPagoRevendedor(pagoId, 'pendiente');
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
    const pago = this.db.obtenerPagoRevendedorPorId(pagoId);
    if (!pago) {
      return null;
    }

    // Si el pago ya está aprobado, solo devolver la información
    if (pago.estado === 'aprobado') {
      return pago;
    }

    // Si está pendiente, verificar en MercadoPago
    if (pago.estado === 'pendiente') {
      const pagoMP = await this.mercadopago.verificarPagoPorReferencia(pagoId);

      if (pagoMP && pagoMP.status === 'approved') {
        // Confirmar el pago y crear el revendedor
        await this.confirmarPagoYCrearRevendedor(pagoId, pagoMP.id);
        // Devolver el pago actualizado
        return this.db.obtenerPagoRevendedorPorId(pagoId);
      }
    }

    return pago;
  }
}
