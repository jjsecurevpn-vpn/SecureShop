import { useMemo } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  Ban,
  CreditCard,
  FileWarning,
  CheckCircle,
} from 'lucide-react';

const sectionsData = [
  {
    title: 'Aceptación de Términos',
    icon: ShieldCheck,
    variant: 'success' as const,
    content: (
      <div className="space-y-4">
        <p className="text-gray-300 leading-relaxed">
          Al acceder y utilizar JJSecure VPN, confirmas que has leído, entendido
          y aceptas estos términos. Si no estás de acuerdo, no debes usar el
          servicio.
        </p>
      </div>
    ),
  },
  {
    title: 'Descripción del Servicio',
    icon: RefreshCw,
    variant: 'default' as const,
    content: (
      <div className="space-y-4">
        <p className="text-gray-300 mb-4">
          JJSecure VPN es un servicio de proxy/VPN que te permite:
        </p>
        <ul className="space-y-3">
          {[
            'Navegar de forma más privada y segura',
            'Acceder a contenido con restricciones geográficas',
            'Proteger tu conexión en redes WiFi públicas',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <span className="text-gray-400">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    title: 'Uso Responsable',
    icon: CheckCircle,
    variant: 'default' as const,
    content: (
      <div className="space-y-4">
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <p className="text-purple-300 font-medium mb-2">
            Compromiso del usuario:
          </p>
          <p className="text-purple-200 text-sm">
            Te comprometes a usar el servicio de manera responsable y legal.
          </p>
        </div>

        <p className="text-gray-300 mb-4">
          Está prohibido usar el servicio para:
        </p>
        <ul className="space-y-3">
          {[
            'Actividades ilegales o maliciosas',
            'Spam, phishing o distribución de malware',
            'Ataques contra otros servicios o usuarios',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
              <span className="text-gray-400">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    title: 'Limitaciones del Servicio',
    icon: FileWarning,
    variant: 'warning' as const,
    content: (
      <div className="space-y-4">
        <p className="text-gray-300 mb-4">
          El servicio se proporciona "tal como es", con las siguientes
          consideraciones:
        </p>
        <ul className="space-y-3">
          {[
            'Puede haber interrupciones ocasionales por mantenimiento',
            'La velocidad puede variar según la congestión de la red',
            'Nos reservamos el derecho de limitar conexiones simultáneas',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
              <span className="text-gray-400">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    title: 'Responsabilidad y Garantías',
    icon: Ban,
    variant: 'warning' as const,
    content: (
      <div className="space-y-4">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <p className="text-amber-300 font-medium mb-2">
            Limitación de responsabilidad:
          </p>
          <p className="text-amber-200 text-sm">
            JJSecure VPN no se hace responsable de daños directos o indirectos
            derivados del uso del servicio.
          </p>
        </div>

        <p className="text-gray-300">
          El usuario es el único responsable de sus actividades mientras usa el
          servicio.
        </p>
      </div>
    ),
  },
  {
    title: 'Reembolso y Compra de Logins',
    icon: CreditCard,
    variant: 'default' as const,
    content: (
      <div className="space-y-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-300 font-medium mb-2">
            Política de reembolso:
          </p>
          <p className="text-blue-200 text-sm mb-3">
            En caso de que un usuario compre un login para acceder al servicio,
            tendrá derecho al reembolso solamente si se comprueba que el
            problema está relacionado con nuestros servidores y no con bloqueos
            de las operadoras.
          </p>
          <p className="text-blue-200 text-sm">
            Para solicitar el reembolso, el usuario debe proporcionar pruebas
            del problema y aguardar el análisis de nuestro equipo técnico.
          </p>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <p className="text-purple-300 font-medium mb-2">
            Congelamiento de planes
          </p>
          <p className="text-purple-200 text-sm mb-3">
            En casos de bloqueos por parte de las operadoras telefónicas, los
            planes se congelarán automáticamente hasta que se encuentre un nuevo
            método funcional. Una vez solucionado el bloqueo, se reintegrarán
            todos los días que restaban en su plan.
          </p>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-300 font-medium mb-2">Importante:</p>
          <p className="text-red-200 text-sm">
            No se realizarán reembolsos por problemas relacionados con bloqueos
            de operadoras telefónicas o problemas de conectividad del usuario,
            pero los días pagados se preservarán mediante el sistema de
            congelamiento.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Modificaciones',
    icon: FileWarning,
    variant: 'default' as const,
    content: (
      <div className="space-y-4">
        <p className="text-gray-300 leading-relaxed">
          Nos reservamos el derecho de modificar estos términos en cualquier
          momento. Los cambios entrarán en vigor inmediatamente después de su
          publicación.
        </p>
      </div>
    ),
  },
  {
    title: 'Contacto y Soporte',
    icon: ShieldCheck,
    variant: 'success' as const,
    content: (
      <div className="space-y-4">
        <p className="text-gray-300 leading-relaxed">
          Para consultas o soporte, contáctanos por Telegram
        </p>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <p className="text-purple-200 text-sm">
            Soporte oficial:{' '}
            <a
              href="https://t.me/SoporteJHS_bot"
              className="text-purple-400 hover:text-purple-300 font-medium underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              @SoporteJHS_bot
            </a>
          </p>
        </div>
      </div>
    ),
  },
];

interface SectionProps {
  title: string;
  children: React.ReactNode;
  icon: React.ElementType;
  variant?: 'default' | 'warning' | 'success';
}

const Section = ({ title, children, icon: Icon, variant = 'default' }: SectionProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'warning':
        return {
          border: 'border-amber-500/20',
          iconBg: 'bg-amber-500/10',
          iconColor: 'text-amber-400',
        };
      case 'success':
        return {
          border: 'border-purple-500/20',
          iconBg: 'bg-purple-500/10',
          iconColor: 'text-purple-400',
        };
      default:
        return {
          border: 'border-gray-700/50',
          iconBg: 'bg-gray-800/50',
          iconColor: 'text-gray-400',
        };
    }
  };

  const classes = getVariantClasses();

  return (
    <section
      className={`bg-gray-800/30 border ${classes.border} rounded-xl p-6 sm:p-8 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300`}
    >
      <div className="flex items-start gap-4 mb-6">
        <div className={`p-3 rounded-lg ${classes.iconBg} flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${classes.iconColor}`} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        </div>
      </div>
      <div className="ml-0 sm:ml-16">{children}</div>
    </section>
  );
};

const TermsPage = () => {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 pt-20 md:pt-24">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-purple-950/30 to-transparent py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <ShieldCheck className="w-4 h-4" />
              Términos Legales
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Términos y Condiciones
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Bienvenido a JJSecure VPN. Al usar nuestra aplicación, aceptas los
              siguientes términos y condiciones.
            </p>

            <div className="mt-8 text-sm text-gray-500">
              Última actualización:{' '}
              {new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {sectionsData.map((section) => (
              <Section
                key={section.title}
                title={section.title}
                icon={section.icon}
                variant={section.variant}
              >
                {section.content}
              </Section>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-16 p-8 bg-purple-950/20 border border-purple-500/20 rounded-2xl shadow-lg shadow-purple-500/10">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                ¿Tienes preguntas?
              </h2>
              <p className="text-gray-300 mb-6">
                Nuestro equipo de soporte está disponible para ayudarte con
                cualquier duda sobre estos términos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://t.me/SoporteJHS_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium"
                >
                  Soporte en Telegram
                </a>
                <a
                  href="https://wa.me/5493812531123"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-purple-500/50 text-purple-300 px-6 py-3 rounded-lg hover:bg-purple-500/10 transition-colors font-medium"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 bg-gray-950 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500">
            © {currentYear} JJSECURE VPN - Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
