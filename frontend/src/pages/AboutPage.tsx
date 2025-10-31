import {
  Users,
  Zap,
  Globe,
  Wifi,
  Server,
  AlertTriangle,
  MessageCircle,
  Star,
  Share2,
  Target,
  Heart,
  Shield,
  TrendingUp,
  Menu,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const AboutPage = () => {
  const [activeSection, setActiveSection] = useState("mision");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sections = [
    {
      id: "mision",
      label: "Nuestra Misión",
      icon: <Target className="w-4 h-4" />,
    },
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

  return (
    <div className="min-h-screen bg-[#181818]">
      {/* Mobile Header */}
      <div className="md:hidden bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex items-center justify-between fixed top-12 left-0 right-0 z-30">
        <h1 className="text-lg font-semibold text-white">Sobre Nosotros</h1>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5 text-neutral-400" />
        </button>
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:block w-72 border-r border-neutral-800 bg-neutral-900/50 fixed left-14 top-12 bottom-0 overflow-y-auto z-10 transition-all duration-300">
        <div className="p-6 border-b border-neutral-800">
          <h2 className="text-2xl font-bold text-white mb-2">Sobre Nosotros</h2>
          <p className="text-sm text-neutral-400">Conoce JJSecure VP-N</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => {
                    setActiveSection(section.id);
                    document
                      .getElementById(section.id)
                      ?.scrollIntoView({ behavior: "instant" });
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                    activeSection === section.id
                      ? "bg-purple-600/10 text-purple-400 border border-purple-500/20"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                  }`}
                >
                  {section.icon}
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-6 border-t border-neutral-800">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
            Estadísticas
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Soporte</span>
              <span className="text-lg font-bold text-purple-400">24/7</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Usuarios</span>
              <span className="text-lg font-bold text-purple-400">15K+</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Uptime</span>
              <span className="text-lg font-bold text-purple-400">99%</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      {/* Main Content */}
      <main className="lg:ml-[21.5rem] min-h-screen pt-28">
        <div className="container mx-auto px-6 py-12 max-w-5xl">
          {/* Hero */}
          <div className="mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600/10 border border-purple-500/20 rounded-full mb-6">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
              <span className="text-xs font-medium text-purple-400">
                Sobre JJSecure VP-N
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              Democratizando el
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                acceso a internet
              </span>
            </h1>

            <p className="text-xl text-neutral-400 max-w-3xl leading-relaxed">
              Una comunidad dedicada a mantener la conectividad con tecnologías
              innovadoras, superando las limitaciones económicas y técnicas.
            </p>
          </div>

          {/* Misión */}
          <section id="mision" className="mb-20 scroll-mt-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Nuestra Misión</h2>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 via-neutral-900/50 to-blue-900/20 border border-purple-500/20 rounded-2xl p-8 lg:p-10">
              <p className="text-lg text-neutral-300 leading-relaxed mb-6">
                Creemos que el acceso a internet es un derecho fundamental.
                Nuestra misión es proporcionar soluciones innovadoras que
                permitan mantenerse conectado, informado y productivo.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    15K+
                  </div>
                  <div className="text-sm text-neutral-400">
                    Usuarios conectados
                  </div>
                </div>
                <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    99%
                  </div>
                  <div className="text-sm text-neutral-400">Tiempo activo</div>
                </div>
                <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    24/7
                  </div>
                  <div className="text-sm text-neutral-400">Soporte</div>
                </div>
              </div>
            </div>
          </section>

          {/* Tecnología */}
          <section id="tecnologia" className="mb-20 scroll-mt-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">¿Cómo Funciona?</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 hover:border-purple-500/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:bg-purple-600/20 transition-colors">
                  <Server className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Tecnología Proxy
                </h3>
                <p className="text-neutral-400 leading-relaxed">
                  Redirección inteligente a través de servidores intermediarios,
                  aprovechando URLs que siguen funcionando.
                </p>
              </div>

              <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 hover:border-blue-500/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-600/20 transition-colors">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Sistema Inteligente
                </h3>
                <p className="text-neutral-400 leading-relaxed">
                  Rotación entre diferentes métodos asegurando acceso continuo a
                  servicios esenciales.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-5 hover:border-purple-500/30 transition-all">
                <div className="text-purple-400 mb-3">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="text-base font-semibold text-white mb-2">
                  Tecnología Proxy
                </h4>
                <p className="text-neutral-300 text-sm">
                  Redirección inteligente para mantener conectividad.
                </p>
              </div>
              <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-5 hover:border-purple-500/30 transition-all">
                <div className="text-purple-400 mb-3">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="text-base font-semibold text-white mb-2">
                  Conectividad Universal
                </h4>
                <p className="text-neutral-300 text-sm">
                  Acceso incluso cuando el crédito se agota.
                </p>
              </div>
              <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-5 hover:border-purple-500/30 transition-all">
                <div className="text-purple-400 mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="text-base font-semibold text-white mb-2">
                  Comunidad Activa
                </h4>
                <p className="text-neutral-300 text-sm">
                  Red de personas por la inclusión digital.
                </p>
              </div>
              <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-5 hover:border-purple-500/30 transition-all">
                <div className="text-purple-400 mb-3">
                  <Server className="w-5 h-5" />
                </div>
                <h4 className="text-base font-semibold text-white mb-2">
                  Servidores Optimizados
                </h4>
                <p className="text-neutral-300 text-sm">
                  Infraestructura robusta y confiable.
                </p>
              </div>
            </div>
          </section>

          {/* Valores */}
          <section id="valores" className="mb-20 scroll-mt-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">
                Nuestros Valores
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-900/10 to-transparent border border-neutral-800 rounded-2xl p-6 hover:border-purple-500/30 transition-all">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Innovación
                </h3>
                <p className="text-sm text-neutral-400">
                  Constantemente mejoramos y optimizamos nuestro servicio.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-900/10 to-transparent border border-neutral-800 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
                <div className="text-3xl mb-3">🤝</div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Transparencia
                </h3>
                <p className="text-sm text-neutral-400">
                  Comunicación clara sobre limitaciones y cambios.
                </p>
              </div>

              <div className="bg-gradient-to-br from-pink-900/10 to-transparent border border-neutral-800 rounded-2xl p-6 hover:border-pink-500/30 transition-all">
                <div className="text-3xl mb-3">💪</div>
                <h3 className="text-lg font-bold text-white mb-2">Comunidad</h3>
                <p className="text-sm text-neutral-400">
                  Red de apoyo y colaboración constante.
                </p>
              </div>
            </div>
          </section>

          {/* Comunidad */}
          <section id="comunidad" className="mb-20 scroll-mt-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">
                Nuestra Comunidad
              </h2>
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 mb-8">
              <p className="text-lg text-neutral-300 leading-relaxed mb-6">
                Somos más que un servicio VPN. Una comunidad que cree en el
                poder de la tecnología para superar barreras.
              </p>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-semibold">
                    15,000+ usuarios activos
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-semibold">
                    5,000+ en Telegram
                  </span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="group bg-gradient-to-br from-purple-900/10 to-transparent border border-neutral-800 rounded-2xl p-6 hover:border-purple-500/30 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Grupo Telegram
                    </h3>
                    <p className="text-xs text-neutral-500">Soporte 24/7</p>
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    +5,000 miembros activos
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    Respuesta en 5 min
                  </div>
                </div>
                <a
                  href="https://t.me/+rAuU1_uHGZthMWZh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 px-4 rounded-xl transition-colors text-sm w-full text-center block"
                >
                  Unirse al Grupo
                </a>
              </div>

              <div className="group bg-gradient-to-br from-blue-900/10 to-transparent border border-neutral-800 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Canal WhatsApp
                    </h3>
                    <p className="text-xs text-neutral-500">Actualizaciones</p>
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    Actualizaciones diarias
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    Ofertas exclusivas
                  </div>
                </div>
                <a
                  href="https://chat.whatsapp.com/LU16SUptp4xFQ4zTNta7Ja"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-xl transition-colors text-sm w-full text-center block"
                >
                  Unirse al Canal
                </a>
              </div>
            </div>
          </section>

          {/* Compromiso */}
          <section id="compromiso" className="mb-20 scroll-mt-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">
                Nuestro Compromiso
              </h2>
            </div>

            <div className="bg-gradient-to-br from-yellow-900/10 via-neutral-900/50 to-orange-900/10 border border-yellow-500/20 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-600/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-yellow-100 mb-3">
                    Transparencia Total
                  </h3>
                  <p className="text-yellow-200/80 leading-relaxed mb-4">
                    Las operadoras pueden bloquear métodos periódicamente.
                    Trabajamos constantemente en nuevas alternativas para
                    mantener el servicio activo.
                  </p>
                  <p className="text-yellow-200/80 leading-relaxed">
                    Informamos inmediatamente sobre cambios que puedan afectar
                    tu experiencia.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonios */}
          <section id="testimonios" className="mb-20 scroll-mt-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-600 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Testimonios</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-5 hover:border-purple-500/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-white">{t.name}</h4>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }, (_, j) => (
                        <Star
                          key={j}
                          className={`w-3.5 h-3.5 ${
                            j < t.rating
                              ? "text-purple-400 fill-current"
                              : "text-neutral-600"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-neutral-300 text-sm mb-4">{t.message}</p>
                  <div className="text-xs text-neutral-500">{t.date}</div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 border border-purple-500/20 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Listo para empezar?
            </h2>
            <p className="text-neutral-400 mb-8 max-w-2xl mx-auto">
              Únete a miles de usuarios con conectividad sin límites
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105"
            >
              Comenzar Ahora
              <Zap className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Sheet */}
      <>
        {/* Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Bottom Sheet */}
        <div
          className={`fixed bottom-0 left-0 right-0 bg-neutral-900 text-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
            isMobileMenuOpen ? "translate-y-0" : "translate-y-full"
          } max-h-[80vh] rounded-t-lg overflow-hidden`}
        >
          {/* Header */}
          <div className="p-4 border-b border-neutral-700 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Navegación</h2>
              <p className="text-sm text-gray-400">Secciones de la página</p>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-400 hover:text-white p-2"
            >
              ✕
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto max-h-[60vh]">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  document
                    .getElementById(section.id)
                    ?.scrollIntoView({ behavior: "instant" });
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-4 border-b border-neutral-800/30 ${
                  activeSection === section.id
                    ? "bg-purple-600/10 border-l-4 border-purple-500"
                    : "hover:bg-neutral-800"
                }`}
              >
                {section.icon}
                <span className="text-left">{section.label}</span>
              </button>
            ))}
          </div>
        </div>
      </>
    </div>
  );
};

export default AboutPage;
