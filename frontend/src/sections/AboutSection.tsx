import { Users, Zap, Globe, Wifi, Server, AlertTriangle } from "lucide-react";

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
  <div className="group bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-5 hover:border-purple-500/30 hover:bg-neutral-800/80 transition-all">
    <div className="text-purple-400 mb-3">{icon}</div>
    <h4 className="text-base font-semibold text-white mb-2">{title}</h4>
    <p className="text-neutral-300 leading-relaxed text-sm">{description}</p>
  </div>
);

interface StatProps {
  value: string;
  label: string;
}

const Stat = ({ value, label }: StatProps) => (
  <div className="text-center">
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-sm text-neutral-400">{label}</div>
  </div>
);

const AboutSection = () => {
  const features: Feature[] = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Tecnología Proxy",
      description:
        "Redirección inteligente a través de servidores intermediarios para mantener la conectividad.",
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Conectividad Universal",
      description:
        "Acceso a internet incluso cuando el crédito con la operadora se ha agotado.",
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Comunidad Activa",
      description:
        "Una red de personas apasionadas trabajando por la inclusión digital.",
    },
    {
      icon: <Server className="w-5 h-5" />,
      title: "Servidores Optimizados",
      description:
        "Infraestructura robusta que garantiza la calidad de tu conexión.",
    },
  ];

  const stats: StatProps[] = [
    { value: "24/7", label: "Soporte" },
    { value: "15K+", label: "Usuarios" },
    { value: "99%", label: "Uptime" },
  ];

  return (
    <section id="about-section" className="py-16">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header compacto */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-full mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
            <span className="text-xs text-neutral-400">Sobre Nosotros</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            JHSecure VPN
          </h2>

          <p className="text-sm text-neutral-400 max-w-2xl mx-auto">
            Comunidad dedicada a democratizar el acceso a internet con
            tecnologías innovadoras.
          </p>
        </div>

        {/* How it Works */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-6 hover:border-purple-500/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-neutral-700 border border-neutral-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Wifi className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-3">
                  ¿Cómo Funciona?
                </h3>
                <p className="text-neutral-300 leading-relaxed text-sm">
                  Utilizamos tecnología de proxy avanzada que redirige tu
                  conexión a través de servidores intermediarios. Cuando tu
                  crédito se agota, ciertas URLs específicas siguen funcionando,
                  y nosotros aprovechamos esa ventana para mantenerte conectado.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="grid md:grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>

        {/* Important Notice */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-6 hover:border-yellow-500/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-neutral-700 border border-neutral-600 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-yellow-100 mb-2">
                  Importante Saber
                </h4>
                <p className="text-yellow-200/80 leading-relaxed text-sm">
                  Las operadoras pueden bloquear métodos de conexión
                  periódicamente. Trabajamos constantemente para encontrar
                  nuevas alternativas y mantener el servicio activo para nuestra
                  comunidad.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-neutral-700/50">
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
