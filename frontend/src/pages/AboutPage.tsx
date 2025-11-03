import {
  Target,
  Wifi,
  Heart,
  Users,
  Shield,
  Star,
  Zap,
  Server,
  TrendingUp,
  MessageCircle,
  Share2,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import BottomSheet from "../components/BottomSheet";
import NavigationSidebar from "../components/NavigationSidebar";

interface AboutPageProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

const AboutPage = ({ isMobileMenuOpen, setIsMobileMenuOpen }: AboutPageProps) => {
  const [activeSection, setActiveSection] = useState("mision");

  const sections = [
    { id: "mision", label: "Misión", icon: <Target className="w-4 h-4" /> },
    {
      id: "tecnologia",
      label: "Tecnología",
      icon: <Wifi className="w-4 h-4" />,
    },
    { id: "valores", label: "Valores", icon: <Heart className="w-4 h-4" /> },
    {
      id: "comunidad",
      label: "Comunidad",
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: "compromiso",
      label: "Compromiso",
      icon: <Shield className="w-4 h-4" />,
    },
    {
      id: "testimonios",
      label: "Testimonios",
      icon: <Star className="w-4 h-4" />,
    },
  ];

  const TESTIMONIALS = [
    {
      name: "Carlos Rodríguez",
      rating: 5,
      message:
        "Excelente servicio! Llevo 3 meses usando JJSecure y nunca me ha fallado.",
      date: "Hace 2 días",
    },
    {
      name: "María González",
      rating: 5,
      message:
        "Perfecto para estudiar desde casa. Puedo ver videos en HD sin problemas.",
      date: "Hace 1 semana",
    },
    {
      name: "Luis Martínez",
      rating: 5,
      message: "La app es súper liviana y fácil de usar. Precio muy accesible.",
      date: "Hace 3 días",
    },
    {
      name: "Jazmin Cardozo",
      rating: 4,
      message:
        "Muy buena experiencia. La conexión es estable y me permite trabajar desde cualquier lugar.",
      date: "Hace 5 días",
    },
  ];

  const STATS = [
    { label: "Usuarios", value: "15K+" },
    { label: "Uptime", value: "99.9%" },
    { label: "Soporte", value: "24/7" },
  ];

  return (
    <div className="min-h-screen text-white font-sans">
      {/* Sidebar - Desktop */}
      <NavigationSidebar
        title="Sobre JJSecure"
        subtitle="Conoce nuestra visión"
        sections={sections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      >
        <div className="p-6 border-t border-white/5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Estadísticas
          </p>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Soporte</span>
              <span className="font-medium text-emerald-400">24/7</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Usuarios</span>
              <span className="font-medium text-purple-300">15K+</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Uptime</span>
              <span className="font-medium text-emerald-400">99.9%</span>
            </div>
          </div>
        </div>
      </NavigationSidebar>

      {/* Main Content */}
      <main className="md:ml-[312px] pt-4 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          {/* Hero */}
          <div className="mb-20 mt-16 md:mt-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-900/20 rounded-full mb-6 border border-purple-900/30">
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-purple-300">
                JJSecure VP-N
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 text-center lg:text-left">
              Democratizando el
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-emerald-400 to-purple-300">
                acceso a internet
              </span>
            </h1>

            <p className="text-lg text-gray-400 max-w-2xl leading-relaxed text-center lg:text-left">
              Conectividad sin barreras, tecnología abierta y una comunidad que
              cree en la libertad digital.
            </p>
          </div>

          <section
            id="mision"
            className={`mb-12 scroll-mt-24 ${
              activeSection === "mision"
                ? "ring-2 ring-purple-400 bg-purple-900/10 rounded-xl p-4"
                : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded bg-purple-900/20 flex items-center justify-center border border-purple-400/30">
                <Target className="w-4 h-4 text-purple-300" />
              </div>
              <h2 className="text-xl font-semibold">Nuestra Misión</h2>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="text-gray-300 leading-relaxed mb-6">
                Creemos que el acceso a internet es un derecho fundamental.
                Nuestra misión es proporcionar soluciones innovadoras que
                permitan mantenerse conectado, informado y productivo.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {STATS.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            id="tecnologia"
            className={`mb-12 scroll-mt-24 ${
              activeSection === "tecnologia"
                ? "ring-2 ring-purple-400 bg-purple-900/10 rounded-xl p-4"
                : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded bg-emerald-900/20 flex items-center justify-center border border-emerald-400/30">
                <Wifi className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold">Tecnología</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: <Server className="w-5 h-5" />,
                  title: "Proxy Inteligente",
                  desc: "Redirección dinámica a través de servidores optimizados.",
                  color: "purple",
                },
                {
                  icon: <TrendingUp className="w-5 h-5" />,
                  title: "Rotación Automática",
                  desc: "Métodos alternos para garantizar acceso continuo.",
                  color: "emerald",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-400/30 transition-all"
                >
                  <div
                    className={`w-10 h-10 rounded bg-${item.color}-900/20 flex items-center justify-center mb-4 border border-${item.color}-400/30`}
                  >
                    <div className={`text-${item.color}-400`}>{item.icon}</div>
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section
            id="valores"
            className={`mb-12 scroll-mt-24 ${
              activeSection === "valores"
                ? "ring-2 ring-purple-400 bg-purple-900/10 rounded-xl p-4"
                : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded bg-purple-900/20 flex items-center justify-center border border-purple-400/30">
                <Heart className="w-4 h-4 text-purple-300" />
              </div>
              <h2 className="text-xl font-semibold">Valores</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  emoji: "🎯",
                  title: "Innovación",
                  desc: "Mejoramos constantemente.",
                },
                {
                  emoji: "🤝",
                  title: "Transparencia",
                  desc: "Comunicación clara y honesta.",
                },
                {
                  emoji: "💪",
                  title: "Comunidad",
                  desc: "Juntos superamos barreras.",
                },
              ].map((val, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-xl p-6"
                >
                  <div className="text-2xl mb-3">{val.emoji}</div>
                  <h3 className="font-semibold mb-1">{val.title}</h3>
                  <p className="text-sm text-gray-400">{val.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section
            id="comunidad"
            className={`mb-12 scroll-mt-24 ${
              activeSection === "comunidad"
                ? "ring-2 ring-purple-400 bg-purple-900/10 rounded-xl p-4"
                : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded bg-emerald-900/20 flex items-center justify-center border border-emerald-400/30">
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold">Comunidad</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  platform: "Telegram",
                  icon: <MessageCircle className="w-5 h-5" />,
                  color: "purple",
                  link: "https://t.me/+rAuU1_uHGZthMWZh",
                  stats: ["5K+ miembros", "Respuesta <5 min"],
                },
                {
                  platform: "WhatsApp",
                  icon: <Share2 className="w-5 h-5" />,
                  color: "emerald",
                  link: "https://chat.whatsapp.com/LU16SUptp4xFQ4zTNta7Ja",
                  stats: ["Actualizaciones diarias", "Ofertas exclusivas"],
                },
              ].map((channel, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded bg-${channel.color}-900/20 flex items-center justify-center border border-${channel.color}-400/30`}
                    >
                      <div className={`text-${channel.color}-400`}>
                        {channel.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold">{channel.platform}</h3>
                      <p className="text-xs text-gray-500">
                        Soporte y noticias
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5 mb-5 text-sm text-gray-400">
                    {channel.stats.map((stat, sIndex) => (
                      <div key={sIndex} className="flex items-center gap-2">
                        <div
                          className={`w-1 h-1 rounded-full bg-${channel.color}-400`}
                        ></div>
                        {stat}
                      </div>
                    ))}
                  </div>
                  <a
                    href={channel.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block text-center py-2 px-4 rounded font-medium text-sm bg-${channel.color}-900/20 hover:bg-${channel.color}-900/30 border border-${channel.color}-400/30 text-${channel.color}-300`}
                  >
                    Unirse
                  </a>
                </div>
              ))}
            </div>
          </section>

          <section
            id="compromiso"
            className={`mb-12 scroll-mt-24 ${
              activeSection === "compromiso"
                ? "ring-2 ring-purple-400 bg-purple-900/10 rounded-xl p-4"
                : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded bg-emerald-900/20 flex items-center justify-center border border-emerald-400/30">
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold">Compromiso</h2>
            </div>

            <div className="bg-emerald-900/10 border border-emerald-400/20 rounded-xl p-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded bg-emerald-900/20 flex items-center justify-center flex-shrink-0 border border-emerald-400/30 mt-1">
                  <AlertTriangle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-300 mb-2">
                    Transparencia Total
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Los bloqueos son parte del juego. Trabajamos 24/7 en nuevas
                    soluciones y te informamos al instante.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section
            id="testimonios"
            className={`mb-12 scroll-mt-24 ${
              activeSection === "testimonios"
                ? "ring-2 ring-purple-400 bg-purple-900/10 rounded-xl p-4"
                : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded bg-purple-900/20 flex items-center justify-center border border-purple-400/30">
                <Star className="w-4 h-4 text-purple-300" />
              </div>
              <h2 className="text-xl font-semibold">Testimonios</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-300">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 pr-4">Nombre</th>
                    <th className="text-left py-3">Mensaje</th>
                    <th className="text-left py-3 pr-4">Calificación</th>
                    <th className="text-left py-3">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {TESTIMONIALS.map((t, i) => (
                    <tr
                      key={i}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="py-3 pr-4 font-medium">{t.name}</td>
                      <td className="py-3">{t.message}</td>
                      <td className="py-3">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }, (_, j) => (
                            <Star
                              key={j}
                              className={`w-3 h-3 ${
                                j < t.rating
                                  ? "text-emerald-400 fill-emerald-400"
                                  : "text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-3 text-gray-500">{t.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center bg-white/5 border border-white/10 rounded-xl p-8 mt-12">
            <h2 className="text-2xl font-bold mb-3">¿Listo para conectar?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Únete a miles de personas con acceso ilimitado a internet.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-purple-900/20 hover:bg-emerald-900/20 text-purple-300 hover:text-emerald-400 border border-purple-400/30 hover:border-emerald-400/30 px-6 py-3 rounded font-medium transition-all"
            >
              Comenzar Ahora
              <Zap className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Sheet */}
      <BottomSheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Navegación"
        subtitle="Secciones"
      >
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              setActiveSection(section.id);
              setIsMobileMenuOpen(false);
              setTimeout(() => {
                document
                  .getElementById(section.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 300);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${
              activeSection === section.id
                ? "bg-purple-900/20 text-purple-300"
                : "text-gray-400 hover:bg-white/5"
            }`}
          >
            {section.icon}
            {section.label}
          </button>
        ))}
      </BottomSheet>
    </div>
  );
};

export default AboutPage;
