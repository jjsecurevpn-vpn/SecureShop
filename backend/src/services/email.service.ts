import nodemailer from "nodemailer";

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
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
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
      console.error("[Email] ❌ Error configurando email:", error);
    }
  }

  /**
   * Envía un email genérico
   */
  private async enviarEmail(options: EmailOptions): Promise<boolean> {
    try {
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
      return false;
    }
  }

  /**
   * Envía credenciales de cliente VPN
   */
  async enviarCredencialesCliente(
    email: string,
    credenciales: CredencialesCliente
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
    }
  ): Promise<boolean> {
    const adminEmail = process.env.EMAIL_USER;
    if (!adminEmail) {
      console.error(
        "[Email] ❌ EMAIL_USER no configurado para notificaciones al admin"
      );
      return false;
    }

    const tipoTexto = {
      cliente: "Nueva venta - Cliente VPN",
      revendedor: "Nueva venta - Revendedor",
      "renovacion-cliente": "Renovación - Cliente VPN",
      "renovacion-revendedor": "Renovación - Revendedor",
    };

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

            <div class="monto">
              💵 Monto: $${datos.monto}
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
      to: adminEmail,
      subject: `🔔 ${tipoTexto[tipo]} - $${datos.monto}`,
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
   * Envía credenciales de demostración gratuita (24 horas)
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
              <li>Descarga la app <strong>JJSecure VPN</strong> desde Play Store o App Store</li>
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
