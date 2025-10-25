import {
  Users,
  Zap,
  Globe,
  Wifi,
  Server,
  AlertTriangle,
} from 'lucide-react';

interface Feature {
  icon: JSX.Element;
  title: string;
  description: string;
}

interface FeatureCardProps {
  icon: JSX.Element;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/60 rounded-lg p-6 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
    <div className="text-purple-400 mb-4">{icon}</div>
    <h4 className="text-lg font-semibold text-gray-100 mb-3">{title}</h4>
    <p className="text-gray-300 leading-relaxed">{description}</p>
  </div>
);

interface StatProps {
  value: string;
  label: string;
}

const Stat = ({ value, label }: StatProps) => (
  <div className="text-center">
    <div className="text-2xl font-bold text-gray-100">{value}</div>
    <div className="text-sm text-gray-300">{label}</div>
  </div>
);

const AboutSection = () => {
  const features: Feature[] = [
    {
      icon: <Zap className="w-7 h-7" />,
      title: 'Tecnología Proxy',
      description:
        'Redirección inteligente a través de servidores intermediarios para mantener la conectividad.',
    },
    {
      icon: <Globe className="w-7 h-7" />,
      title: 'Conectividad Universal',
      description:
        'Acceso a internet incluso cuando el crédito con la operadora se ha agotado.',
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: 'Comunidad Activa',
      description:
        'Una red de personas apasionadas trabajando por la inclusión digital.',
    },
    {
      icon: <Server className="w-7 h-7" />,
      title: 'Servidores Optimizados',
      description:
        'Infraestructura robusta que garantiza la calidad de tu conexión.',
    },
  ];

  const stats: StatProps[] = [
    { value: '24/7', label: 'Soporte' },
    { value: '15K+', label: 'Usuarios' },
    { value: '99%', label: 'Uptime' },
  ];

  return (
    <section id="about-section" className="bg-gray-950 py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-500/15 text-purple-300 rounded-full px-4 py-2 mb-6 border border-purple-500/30">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">JHSecure VPN</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Sobre Nosotros
            </h2>

            <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              Somos una comunidad dedicada a democratizar el acceso a internet,
              desarrollando tecnologías innovadoras que mantienen la
              conectividad universal sin importar las limitaciones.
            </p>
          </div>

          {/* How it Works */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/60 rounded-lg p-8 mb-16 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-500/15 border border-purple-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Wifi className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  ¿Cómo Funciona?
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Utilizamos tecnología de proxy avanzada que redirige tu
                  conexión a través de servidores intermediarios. Cuando tu
                  crédito se agota, ciertas URLs específicas siguen funcionando,
                  y nosotros aprovechamos esa ventana para mantenerte conectado.
                </p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>

          {/* Important Notice */}
          <div className="bg-gradient-to-br from-amber-950/50 to-gray-950 border border-amber-800/40 rounded-lg p-8 mb-16 hover:border-amber-700/50 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-amber-100 mb-3">
                  Importante Saber
                </h4>
                <p className="text-amber-200/80 leading-relaxed">
                  Las operadoras pueden bloquear métodos de conexión
                  periódicamente. Trabajamos constantemente para encontrar
                  nuevas alternativas y mantener el servicio activo para nuestra
                  comunidad.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-800/60">
            {stats.map((stat, index) => (
              <Stat key={index} {...stat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
