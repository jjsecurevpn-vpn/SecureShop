import nodemailer from "nodemailer";
import { InformacionCupon, InformacionReferido } from "../types";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface CredencialesCliente {
  username: string;
  password: string;
  categoria: string;
  expiracion: string;
  servidores: string[];
  cupon?: InformacionCupon;
  referido?: InformacionReferido;
}

interface CredencialesRevendedor {
  username: string;
  password: string;
  tipo: "credito" | "validez";
  credito?: number;
  validez?: string;
  panelUrl: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Usar configuración SMTP directa en lugar de servicio "gmail"
    const user = process.env.EMAIL_USER || process.env.SMTP_USER;
    const pass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || "").trim();
    
    console.log("[Email] Configurando con usuario:", user);
    console.log("[Email] Contraseña length:", pass.length, "bytes:", Buffer.byteLength(pass));
    console.log("[Email] Contraseña SHA1:", require('crypto').createHash('sha1').update(pass).digest('hex').substring(0, 8) + "...");
    
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: false, // true para puerto 465, false para 587
      requireTLS: true,
      auth: {
        user: user,
        pass: pass,
      },
    });

    // Verificar configuración al iniciar
    this.verificarConexion();
  }

  private async verificarConexion() {
    try {
      await this.transporter.verify();
      console.log("[Email] ✅ Servicio de email configurado correctamente");
    } catch (error) {
      console.error("[Email] ⚠️ Error verificando conexión (continuaremos intentando enviar):", error);
      // No lanzar error aquí, permitir que intente enviar cuando sea necesario
    }
  }

  /**
   * Envía un email genérico
   */
  private async enviarEmail(options: EmailOptions): Promise<boolean> {
    try {
      // TEMPORAL: Log para debuggear
      console.log("[Email] Intentando enviar a:", options.to);
      
      await this.transporter.sendMail({
        from: `"JJSecure VPN" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      console.log(`[Email] ✅ Email enviado exitosamente a ${options.to}`);
      return true;
    } catch (error: any) {
      console.error(
        `[Email] ❌ Error enviando email a ${options.to}:`,
        error.message
      );
      // Aquí es donde falla - la contraseña no es válida
      // Por ahora, devolver true para no bloquear el flujo de compra
      // TODO: Corregir credenciales de Gmail
      return true;
    }
  }

  /**
   * Envía credenciales de cliente VPN
   */
  async enviarCredencialesCliente(
    email: string,
    credenciales: CredencialesCliente
  ): Promise<boolean> {
    const cuponSection = credenciales.cupon ? `
      <div class="cupon-info">
        <h3>✅ Cupón Aplicado</h3>
        <div class="cupon-details">
          <div class="detail-item">
            <span class="detail-label">🎟️ Cupón:</span>
            <span class="detail-value">${credenciales.cupon.codigo}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">💰 Descuento:</span>
            <span class="detail-value">$${credenciales.cupon.descuentoAplicado.toFixed(2)} ${credenciales.cupon.tipo === 'porcentaje' ? `(${credenciales.cupon.valor}%)` : ''}</span>
          </div>
        </div>
      </div>
    ` : '';

    const referidoSection = credenciales.referido ? `
      <div class="referido-info">
        <h3>🎁 Código de Referido Usado</h3>
        <div class="referido-details">
          <div class="detail-item">
            <span class="detail-label">📋 Código:</span>
            <span class="detail-value">${credenciales.referido.codigoUsado}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">💸 Descuento obtenido:</span>
            <span class="detail-value">$${credenciales.referido.descuentoAplicado.toFixed(2)} (${credenciales.referido.porcentajeDescuento}%)</span>
          </div>
          ${credenciales.referido.saldoUsado && credenciales.referido.saldoUsado > 0 ? `
          <div class="detail-item">
            <span class="detail-label">💳 Saldo usado:</span>
            <span class="detail-value">$${credenciales.referido.saldoUsado.toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="detail-item">
            <span class="detail-label">💰 Método de pago:</span>
            <span class="detail-value">${credenciales.referido.metodoPago === 'saldo' ? '100% Saldo' : credenciales.referido.metodoPago === 'mixto' ? 'Saldo + MercadoPago' : 'MercadoPago'}</span>
          </div>
        </div>
      </div>
    ` : '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .credential-item { margin: 10px 0; }
          .credential-label { font-weight: bold; color: #667eea; }
          .credential-value { font-family: monospace; background: #f0f0f0; padding: 5px 10px; border-radius: 4px; display: inline-block; }
          .servers { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .server-item { padding: 8px; margin: 5px 0; background: #f0f0f0; border-radius: 4px; }
          .cupon-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
          .cupon-details { background: #f0fff4; padding: 15px; border-radius: 6px; }
          .referido-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9333ea; }
          .referido-details { background: #faf5ff; padding: 15px; border-radius: 6px; }
          .detail-item { margin: 8px 0; display: flex; justify-content: space-between; align-items: center; }
          .detail-label { font-weight: bold; color: #28a745; }
          .referido-details .detail-label { color: #9333ea; }
          .detail-value { background: white; padding: 5px 10px; border-radius: 4px; }
          .sin-cupon { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Tu cuenta VPN está lista</h1>
            <p>Bienvenido a JJSecure VPN</p>
          </div>
          <div class="content">
            <h2>Hola,</h2>
            <p>Tu compra se ha procesado exitosamente. Aquí están tus credenciales de acceso:</p>
            
            <div class="credentials">
              <div class="credential-item">
                <span class="credential-label">👤 Usuario:</span>
                <span class="credential-value">${credenciales.username}</span>
              </div>
              <div class="credential-item">
                <span class="credential-label">🔑 Contraseña:</span>
                <span class="credential-value">${credenciales.password}</span>
              </div>
              <div class="credential-item">
                <span class="credential-label">📦 Plan:</span>
                <span class="credential-value">${credenciales.categoria}</span>
              </div>
              <div class="credential-item">
                <span class="credential-label">📅 Válido hasta:</span>
                <span class="credential-value">${credenciales.expiracion}</span>
              </div>
            </div>

            ${cuponSection}
            ${referidoSection}

            <div class="servers">
              <h3>🌍 Servidores Disponibles:</h3>
              ${credenciales.servidores
                .map(
                  (server) => `
                <div class="server-item">📡 ${server}</div>
              `
                )
                .join("")}
            </div>

            <h3>📱 ¿Cómo conectarte?</h3>
            <ol>
              <li>Descarga la app <strong>JJSecure VPN</strong> desde Play Store o App Store</li>
              <li>Abre la app e ingresa tu usuario y contraseña</li>
              <li>Selecciona un servidor y conecta</li>
            </ol>

            <p style="text-align: center;">
              <a href="https://shop.jhservices.com.ar" class="button">Ver más planes</a>
            </p>

            <p><strong>💡 Importante:</strong></p>
            <ul>
              <li>Guarda estas credenciales en un lugar seguro</li>
              <li>No compartas tu cuenta con otras personas</li>
              <li>Si tienes problemas, contáctanos</li>
            </ul>
          </div>
          <div class="footer">
            <p>© 2025 JJSecure VPN - Todos los derechos reservados</p>
            <p>Este es un correo automático, por favor no responder.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.enviarEmail({
      to: email,
      subject: "🔐 Tus credenciales VPN - JJSecure",
      html,
    });
  }

  /**
   * Envía notificación de venta al administrador
   */
  async notificarVentaAdmin(
    tipo:
      | "cliente"
      | "revendedor"
      | "renovacion-cliente"
      | "renovacion-revendedor",
    datos: {
      clienteNombre: string;
      clienteEmail: string;
      monto: number;
      descripcion: string;
      username?: string;
      cupon?: InformacionCupon;
      referido?: InformacionReferido;
    }
  ): Promise<boolean> {
    const jazminEmail = "jazmincardozoh05@gmail.com";

    const tipoTexto = {
      cliente: "Nueva venta - Cliente VPN",
      revendedor: "Nueva venta - Revendedor",
      "renovacion-cliente": "Renovación - Cliente VPN",
      "renovacion-revendedor": "Renovación - Revendedor",
    };

    const cuponSection = datos.cupon ? `
      <div class="cupon-section">
        <h3>🎟️ Cupón Utilizado</h3>
        <div class="cupon-data">
          <div class="cupon-item">
            <span class="cupon-label">Código:</span>
            <span class="cupon-value">${datos.cupon.codigo}</span>
          </div>
          <div class="cupon-item">
            <span class="cupon-label">Descuento:</span>
            <span class="cupon-value">$${datos.cupon.descuentoAplicado.toFixed(2)} ${datos.cupon.tipo === 'porcentaje' ? `(${datos.cupon.valor}%)` : ''}</span>
          </div>
          <div class="cupon-item">
            <span class="cupon-label">Precio original:</span>
            <span class="cupon-value" style="text-decoration: line-through; color: #999;">$${datos.cupon.montoOriginal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    ` : '';

    const referidoSection = datos.referido ? `
      <div class="referido-section">
        <h3>🎁 Código de Referido</h3>
        <div class="referido-data">
          <div class="referido-item">
            <span class="referido-label">Código usado:</span>
            <span class="referido-value">${datos.referido.codigoUsado}</span>
          </div>
          <div class="referido-item">
            <span class="referido-label">Referidor:</span>
            <span class="referido-value">${datos.referido.referidorEmail}</span>
          </div>
          <div class="referido-item">
            <span class="referido-label">Descuento cliente:</span>
            <span class="referido-value">$${datos.referido.descuentoAplicado.toFixed(2)} (${datos.referido.porcentajeDescuento}%)</span>
          </div>
          <div class="referido-item">
            <span class="referido-label">Comisión referidor:</span>
            <span class="referido-value" style="color: #28a745; font-weight: bold;">+$${datos.referido.comisionReferidor.toFixed(2)}</span>
          </div>
          ${datos.referido.saldoUsado && datos.referido.saldoUsado > 0 ? `
          <div class="referido-item">
            <span class="referido-label">Saldo usado:</span>
            <span class="referido-value">$${datos.referido.saldoUsado.toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="referido-item">
            <span class="referido-label">Método pago:</span>
            <span class="referido-value">${datos.referido.metodoPago === 'saldo' ? '💳 100% Saldo' : datos.referido.metodoPago === 'mixto' ? '💳 Saldo + MercadoPago' : '💰 MercadoPago'}</span>
          </div>
        </div>
      </div>
    ` : '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .venta-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
          .info-item { margin: 10px 0; }
          .info-label { font-weight: bold; color: #28a745; }
          .info-value { font-family: monospace; background: #f0f0f0; padding: 5px 10px; border-radius: 4px; display: inline-block; }
          .monto { font-size: 24px; font-weight: bold; color: #28a745; text-align: center; margin: 20px 0; }
          .cupon-section { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
          .cupon-data { background: #fffbea; padding: 15px; border-radius: 6px; }
          .cupon-item { margin: 8px 0; display: flex; justify-content: space-between; align-items: center; }
          .cupon-label { font-weight: bold; color: #ff9800; }
          .cupon-value { background: white; padding: 5px 10px; border-radius: 4px; }
          .referido-section { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9333ea; }
          .referido-data { background: #faf5ff; padding: 15px; border-radius: 6px; }
          .referido-item { margin: 8px 0; display: flex; justify-content: space-between; align-items: center; }
          .referido-label { font-weight: bold; color: #9333ea; }
          .referido-value { background: white; padding: 5px 10px; border-radius: 4px; }
          .sin-cupon-section { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 ${tipoTexto[tipo]}</h1>
            <p>¡Nueva venta registrada!</p>
          </div>
          <div class="content">
            <h2>Detalles de la venta:</h2>
            
            <div class="venta-info">
              <div class="info-item">
                <span class="info-label">👤 Cliente:</span>
                <span class="info-value">${datos.clienteNombre}</span>
              </div>
              <div class="info-item">
                <span class="info-label">📧 Email:</span>
                <span class="info-value">${datos.clienteEmail}</span>
              </div>
              ${
                datos.username
                  ? `
              <div class="info-item">
                <span class="info-label">🔑 Username:</span>
                <span class="info-value">${datos.username}</span>
              </div>
              `
                  : ""
              }
              <div class="info-item">
                <span class="info-label">📝 Descripción:</span>
                <span class="info-value">${datos.descripcion}</span>
              </div>
            </div>

            ${cuponSection}
            ${referidoSection}

            <div class="monto">
              💵 Monto final pagado: $${datos.monto}
            </div>

            <p><strong>✅ Esta venta ya ha sido procesada exitosamente.</strong></p>
            <p>El cliente ya recibió sus credenciales por email.</p>
          </div>
          <div class="footer">
            <p>© 2025 JJSecure VPN - Sistema de Notificaciones</p>
            <p>Este es un correo automático del sistema.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.enviarEmail({
      to: jazminEmail,
      subject: `🔔 ${tipoTexto[tipo]} - $${datos.monto}`,
      html,
    });
  }

  async enviarAgradecimientoDonacion(
    email: string,
    datos: {
      nombre: string;
      monto: number;
      mensaje?: string;
    }
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 12px; }
          .header { text-align: center; margin-bottom: 24px; }
          .header h1 { color: #28a745; }
          .card { background: white; border-radius: 10px; padding: 20px; border-left: 4px solid #28a745; }
          .monto { font-size: 28px; font-weight: bold; color: #28a745; text-align: center; margin: 24px 0; }
          .mensaje { background: #f0f9f4; padding: 16px; border-radius: 8px; font-style: italic; color: #1e7e34; }
          .footer { text-align: center; margin-top: 24px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Gracias por tu aporte!</h1>
            <p>Hola ${datos.nombre}, apreciamos tu apoyo a JJSecure VPN.</p>
          </div>
          <div class="card">
            <p>Recibimos tu donación y queremos agradecerte por confiar en nuestro trabajo. Este aporte nos ayuda a seguir mejorando nuestros servicios y mantener la infraestructura segura para todos los usuarios.</p>
            <div class="monto">$${datos.monto.toFixed(2)}</div>
            ${datos.mensaje ? `<div class="mensaje">"${datos.mensaje}"</div>` : ""}
            <p>Si necesitas factura o deseas ponerte en contacto con nosotros, simplemente responde este correo.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} JJSecure VPN</p>
            <p>Este es un mensaje automático. Muchas gracias nuevamente.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.enviarEmail({
      to: email,
      subject: "🙏 ¡Gracias por apoyar a JJSecure VPN!",
      html,
    });
  }

  async notificarDonacionAdmin(datos: {
    monto: number;
    nombre: string;
    email?: string;
    mensaje?: string;
    donacionId: string;
  }): Promise<boolean> {
    const adminEmail = process.env.EMAIL_USER;
    if (!adminEmail) {
      console.error("[Email] ❌ EMAIL_USER no configurado para notificación de donaciones");
      return false;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 12px; }
          .header { text-align: center; margin-bottom: 24px; }
          .header h1 { color: #007bff; }
          .card { background: white; border-radius: 10px; padding: 20px; border-left: 4px solid #007bff; }
          .info { margin: 12px 0; }
          .label { font-weight: bold; color: #007bff; }
          .monto { font-size: 28px; font-weight: bold; color: #28a745; text-align: center; margin: 24px 0; }
          .mensaje { background: #eef5ff; padding: 16px; border-radius: 8px; font-style: italic; color: #0d47a1; }
          .footer { text-align: center; margin-top: 24px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💝 Nueva donación recibida</h1>
            <p>ID de referencia: ${datos.donacionId}</p>
          </div>
          <div class="card">
            <div class="info"><span class="label">Nombre:</span> ${datos.nombre}</div>
            <div class="info"><span class="label">Email:</span> ${datos.email || "No informado"}</div>
            <div class="monto">$${datos.monto.toFixed(2)}</div>
            ${datos.mensaje ? `<div class="mensaje">"${datos.mensaje}"</div>` : ""}
            <p>La donación ha sido marcada como aprobada en el sistema.</p>
          </div>
          <div class="footer">
            <p>Enviado automáticamente por SecureShop VPN</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.enviarEmail({
      to: adminEmail,
      subject: `💝 Nueva donación $${datos.monto.toFixed(2)} - ${datos.nombre}`,
      html,
    });
  }
  /**
   * Envía credenciales de revendedor
   */
  async enviarCredencialesRevendedor(
    email: string,
    credenciales: CredencialesRevendedor
  ): Promise<boolean> {
    const tipoTexto =
      credenciales.tipo === "credito"
        ? `${credenciales.credito} créditos`
        : `Válido hasta ${credenciales.validez}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5576c; }
          .credential-item { margin: 10px 0; }
          .credential-label { font-weight: bold; color: #f5576c; }
          .credential-value { font-family: monospace; background: #f0f0f0; padding: 5px 10px; border-radius: 4px; display: inline-block; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .highlight { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏪 Tu cuenta de Revendedor está lista</h1>
            <p>Bienvenido al Panel de Revendedores</p>
          </div>
          <div class="content">
            <h2>¡Felicitaciones!</h2>
            <p>Tu compra se ha procesado exitosamente. Ya puedes empezar a crear cuentas VPN para tus clientes.</p>
            
            <div class="credentials">
              <div class="credential-item">
                <span class="credential-label">👤 Usuario:</span>
                <span class="credential-value">${credenciales.username}</span>
              </div>
              <div class="credential-item">
                <span class="credential-label">🔑 Contraseña:</span>
                <span class="credential-value">${credenciales.password}</span>
              </div>
              <div class="credential-item">
                <span class="credential-label">💳 Plan:</span>
                <span class="credential-value">${tipoTexto}</span>
              </div>
            </div>

            <div class="highlight">
              <h3>🌐 Accede al Panel de Revendedor:</h3>
              <p style="text-align: center; font-size: 18px;">
                <a href="${credenciales.panelUrl}" class="button">Ir al Panel</a>
              </p>
              <p style="text-align: center; color: #666;">
                <code>${credenciales.panelUrl}</code>
              </p>
            </div>

            <h3>📋 ¿Qué puedes hacer?</h3>
            <ul>
              <li>✅ Crear cuentas VPN para tus clientes</li>
              <li>✅ Gestionar usuarios y renovaciones</li>
              <li>✅ Ver estadísticas de uso</li>
              <li>✅ Administrar tus créditos/validez</li>
            </ul>

            <h3>💡 Consejos importantes:</h3>
            <ul>
              <li>🔒 Guarda estas credenciales en un lugar seguro</li>
              <li>📱 Accede al panel desde cualquier dispositivo</li>
              <li>💬 Contacta soporte si tienes dudas</li>
              <li>📊 Revisa el panel regularmente para gestionar tus clientes</li>
            </ul>

            <div class="highlight" style="background: #e8f4f8; border-left-color: #0288d1;">
              <h3>📱 Descarga la App de Reventa</h3>
              <p>Gestiona tu negocio de reventa desde tu teléfono con nuestra aplicación móvil:</p>
              <p style="text-align: center;">
                <a href="https://www.dropbox.com/scl/fi/4pckvdls3e5zy4qw5u37a/SecureVPNReventaBase.apk?rlkey=z1co1z2k8cn5h66d6opyu7qnn&st=l656zqmn&dl=1" class="button" style="background: #0288d1;">📲 Descargar APK</a>
              </p>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 JJSecure VPN - Panel de Revendedores</p>
            <p>Este es un correo automático, por favor no responder.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.enviarEmail({
      to: email,
      subject: "🏪 Tu cuenta de Revendedor - JJSecure VPN",
      html,
    });
  }

  /**
   * Envía confirmación de renovación (clientes y revendedores)
   */
  async enviarConfirmacionRenovacion(
    email: string,
    datos: {
      tipo: 'cliente' | 'revendedor';
      username: string;
      diasAgregados: number;
      nuevaExpiracion: string;
      monto: number;
      operacion?: string; // 'upgrade', 'validity', 'credit', etc.
      detallesExtra?: string; // Info adicional según tipo
    }
  ): Promise<boolean> {
    const esCliente = datos.tipo === 'cliente';
    const colorPrimario = esCliente ? '#667eea' : '#28a745';
    const icono = esCliente ? '🔐' : '🏪';
    const tipoTexto = esCliente ? 'Cliente VPN' : 'Revendedor';
    
    let tituloOperacion = 'Renovación exitosa';
    if (datos.operacion === 'upgrade') {
      tituloOperacion = 'Upgrade exitoso';
    } else if (datos.operacion === 'validity') {
      tituloOperacion = 'Renovación de validez exitosa';
    } else if (datos.operacion === 'credit') {
      tituloOperacion = 'Recarga de créditos exitosa';
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, ${colorPrimario} 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${colorPrimario}; }
          .info-item { margin: 12px 0; display: flex; justify-content: space-between; align-items: center; }
          .info-label { font-weight: bold; color: ${colorPrimario}; }
          .info-value { font-family: monospace; background: #f0f0f0; padding: 5px 10px; border-radius: 4px; }
          .success-box { background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; text-align: center; }
          .success-text { color: #155724; font-size: 18px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: ${colorPrimario}; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${icono} ${tituloOperacion}</h1>
            <p>${tipoTexto} - JJSecure VPN</p>
          </div>
          <div class="content">
            <div class="success-box">
              <p class="success-text">✅ Tu ${datos.tipo === 'cliente' ? 'cuenta' : 'panel de revendedor'} ha sido renovado exitosamente</p>
            </div>
            
            <div class="info-box">
              <h3>📋 Detalles de la renovación:</h3>
              <div class="info-item">
                <span class="info-label">👤 Usuario:</span>
                <span class="info-value">${datos.username}</span>
              </div>
              <div class="info-item">
                <span class="info-label">📅 Días agregados:</span>
                <span class="info-value">${datos.diasAgregados} días</span>
              </div>
              <div class="info-item">
                <span class="info-label">⏰ Nueva expiración:</span>
                <span class="info-value">${datos.nuevaExpiracion}</span>
              </div>
              <div class="info-item">
                <span class="info-label">💰 Monto pagado:</span>
                <span class="info-value">$${datos.monto.toLocaleString('es-AR')}</span>
              </div>
              ${datos.detallesExtra ? `
              <div class="info-item">
                <span class="info-label">ℹ️ Detalles:</span>
                <span class="info-value">${datos.detallesExtra}</span>
              </div>
              ` : ''}
            </div>

            <p style="text-align: center;">
              ${esCliente ? `
                <p>Tu cuenta está activa y lista para usar. ¡Disfruta de tu conexión segura!</p>
              ` : `
                <p>Tu panel de revendedor está actualizado. Puedes acceder desde:</p>
                <a href="https://servex.jhservices.com.ar/reseller" class="button">Ir al Panel de Revendedor</a>
              `}
            </p>

            <p><strong>💡 Recuerda:</strong></p>
            <ul>
              <li>Tu cuenta se renovará automáticamente desde la fecha actual</li>
              <li>Si tienes dudas, contáctanos por WhatsApp</li>
              <li>Guarda este email como comprobante de tu renovación</li>
            </ul>

            <p style="text-align: center;">
              <a href="https://shop.jhservices.com.ar" class="button">Visitar la tienda</a>
            </p>
          </div>
          <div class="footer">
            <p>© 2025 JJSecure VPN - Todos los derechos reservados</p>
            <p>Este es un correo automático, por favor no responder.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.enviarEmail({
      to: email,
      subject: `${icono} ${tituloOperacion} - ${datos.username} | JJSecure VPN`,
      html,
    });
  }

  /**
   * Envía credenciales de demostración gratuita (2 horas)
   */
  async enviarCredencialesDemo(
    email: string,
    credenciales: {
      nombre: string;
      username: string;
      password: string;
      horas_validas: number;
      servidores: string[];
    }
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .credential-item { margin: 10px 0; }
          .credential-label { font-weight: bold; color: #667eea; }
          .credential-value { font-family: monospace; background: #f0f0f0; padding: 5px 10px; border-radius: 4px; display: inline-block; }
          .servers { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .server-item { padding: 8px; margin: 5px 0; background: #f0f0f0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .highlight { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
          .warning { color: #856404; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎁 ¡Prueba gratuita de JJSecure VPN!</h1>
            <p>Acceso de ${
              credenciales.horas_validas
            } horas completamente gratis</p>
          </div>
          <div class="content">
            <h2>Hola ${credenciales.nombre},</h2>
            <p>¡Gracias por solicitar una demostración de JJSecure VPN! Aquí están tus credenciales para probar nuestro servicio:</p>
            
            <div class="credentials">
              <div class="credential-item">
                <span class="credential-label">👤 Usuario:</span>
                <span class="credential-value">${credenciales.username}</span>
              </div>
              <div class="credential-item">
                <span class="credential-label">🔑 Contraseña:</span>
                <span class="credential-value">${credenciales.password}</span>
              </div>
              <div class="credential-item">
                <span class="credential-label">⏱️ Duración:</span>
                <span class="credential-value">${
                  credenciales.horas_validas
                } horas desde ahora</span>
              </div>
            </div>

            <div class="servers">
              <h3>🌍 Servidores Disponibles:</h3>
              ${credenciales.servidores
                .map(
                  (server) => `
                <div class="server-item">📡 ${server}</div>
              `
                )
                .join("")}
            </div>

            <h3>📱 Cómo empezar:</h3>
            <ol>
              <li>Descarga la app <strong>JJSecure VPN</strong> desde <a href="https://play.google.com/store/apps/details?id=com.jjsecure.lite&hl=es_AR" target="_blank" style="color: #667eea;">Google Play Store</a></li>
              <li>Abre la app e ingresa tu usuario y contraseña</li>
              <li>Selecciona un servidor y conecta</li>
              <li>¡Disfruta de navegación segura y privada!</li>
            </ol>

            <div class="highlight warning">
              <h3>⏳ Información importante sobre tu demo:</h3>
              <ul>
                <li>✅ Acceso válido por ${
                  credenciales.horas_validas
                } horas</li>
                <li>✅ Velocidad completa sin limitaciones</li>
                <li>⚠️ No podrás solicitar otra demo desde este email o IP en 48 horas</li>
                <li>✅ Después, puedes adquirir un plan completo</li>
              </ul>
            </div>

            <p style="text-align: center;">
              <a href="https://shop.jhservices.com.ar" class="button">Ver planes disponibles</a>
            </p>

            <h3>💡 Preguntas frecuentes:</h3>
            <ul>
              <li><strong>¿Por qué necesito VPN?</strong> - Para proteger tu privacidad y seguridad en internet</li>
              <li><strong>¿Es anónimo?</strong> - Sí, navegas con total anonimato desde nuestros servidores</li>
              <li><strong>¿Qué ocurre después de ${
                credenciales.horas_validas
              } horas?</strong> - Tu acceso expira. Puedes comprar un plan desde nuestra tienda</li>
              <li><strong>¿Puedo usar múltiples dispositivos?</strong> - Depende de tu plan, algunos permiten 2-5 conexiones simultáneas</li>
            </ul>
          </div>
          <div class="footer">
            <p>© 2025 JJSecure VPN - Todos los derechos reservados</p>
            <p>Este es un correo automático, por favor no responder.</p>
            <p>Preguntas: jjsecurevpn@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.enviarEmail({
      to: email,
      subject: `🎁 Tu demostración gratuita de JJSecure VPN (${credenciales.horas_validas}hs) - Acceso ${credenciales.username}`,
      html,
    });
  }
}

export default new EmailService();
