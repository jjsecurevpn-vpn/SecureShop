import { useMemo } from 'react';
import {
  ShieldCheck,
  Database,
  Lock,
  UserX,
  Eye,
  MessageCircle,
} from 'lucide-react';

const sectionsData = [
  {
    title: 'Información que Recopilamos',
    icon: Database,
    variant: 'default' as const,
    content: (
      <div className="space-y-4">
        <p className="text-gray-300 mb-4">
          Para el funcionamiento del servicio, recopilamos mínima información:
        </p>
        <ul className="space-y-3">
          {[
            'Device ID (removido automáticamente cada 24 horas)',
            'Información básica de conexión para control de límites',
            'Datos técnicos necesarios para el funcionamiento del proxy',
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
    title: 'Uso de la Información',
    icon: Eye,
    variant: 'default' as const,
    content: (
      <div className="space-y-4">
        <p className="text-gray-300 mb-4">
          La información recopilada se utiliza exclusivamente para:
        </p>
        <ul className="space-y-3">
          {[
            'Controlar límites de conexiones simultáneas',
            'Mantener la estabilidad del servicio',
            'Proveer soporte técnico cuando sea necesario',
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
    title: 'Protección de Datos',
    icon: Lock,
    variant: 'success' as const,
    content: (
      <div className="space-y-4">
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <p className="text-purple-300 font-medium mb-2">
            Compromiso de seguridad:
          </p>
          <p className="text-purple-200 text-sm">
            No almacenamos historial de navegación, contenido de comunicaciones
            ni datos personales identificables.
          </p>
        </div>

        <p className="text-gray-300">
          Los datos temporales (como Device ID) se eliminan automáticamente de
          nuestros servidores cada 24 horas.
        </p>
      </div>
    ),
  },
  {
    title: 'Compartir Información',
    icon: UserX,
    variant: 'warning' as const,
    content: (
      <div className="space-y-4">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <p className="text-amber-300 font-medium mb-2">Política estricta:</p>
          <p className="text-amber-200 text-sm">
            No vendemos, alquilamos ni compartimos tu información personal con
            terceros.
          </p>
        </div>

        <p className="text-gray-300">
          Solo podríamos divulgar información si fuera requerido por ley y con
          orden judicial válida.
        </p>
      </div>
    ),
  },
  {
    title: 'Tus Derechos',
    icon: ShieldCheck,
    variant: 'success' as const,
    content: (
      <div className="space-y-4">
        <p className="text-gray-300 mb-4">Como usuario, tienes derecho a:</p>
        <ul className="space-y-3">
          {[
            'Solicitar información sobre los datos que almacenamos',
            'Pedir la eliminación de tus datos',
            'Dejar de usar el servicio en cualquier momento',
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
    title: 'Contacto',
    icon: MessageCircle,
    variant: 'success' as const,
    content: (
      <div className="space-y-4">
        <p className="text-gray-300 leading-relaxed">
          Para consultas sobre privacidad, contáctanos por Telegram
        </p>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <p className="text-purple-200 text-sm">
            💬 Soporte oficial:{' '}
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
          iconBg: 'bg-amber-500/10',
          iconColor: 'text-amber-400',
          border: 'border-amber-500/20',
        };
      case 'success':
        return {
          iconBg: 'bg-purple-500/10',
          iconColor: 'text-purple-400',
          border: 'border-purple-500/20',
        };
      default:
        return {
          iconBg: 'bg-gray-800/50',
          iconColor: 'text-gray-400',
          border: 'border-gray-700/50',
        };
    }
  };

  const classes = getVariantClasses();

  return (
    <div
      className={`bg-gray-800/30 rounded-xl border ${classes.border} shadow-sm overflow-hidden hover:shadow-lg hover:shadow-purple-500/10 transition-all`}
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className={`p-3 rounded-lg ${classes.iconBg} flex-shrink-0`}>
            <Icon className={`w-6 h-6 ${classes.iconColor}`} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{title}</h2>
          </div>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

const PrivacyPage = () => {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 pt-20 md:pt-24">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-purple-950/30 to-transparent py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <ShieldCheck className="w-4 h-4" />
              Privacidad y Seguridad
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Políticas de Privacidad
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Esta política explica cómo recopilamos, usamos y protegemos tu
              información al utilizar JJSecure VPN.
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

      {/* Content Sections */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
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
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-purple-950/20 border-y border-purple-500/10 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-gray-800/50 border border-purple-500/20 rounded-2xl shadow-lg shadow-purple-500/10 p-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                ¿Tienes preguntas sobre privacidad?
              </h2>
              <p className="text-gray-300 mb-6">
                Nuestro equipo está disponible para resolver cualquier duda
                sobre cómo protegemos tu información.
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

export default PrivacyPage;
