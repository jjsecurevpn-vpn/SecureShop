import {
  Target,
  Wifi,
  Heart,
  Shield,
  Star,
  Zap,
  Server,
  TrendingUp,
  Smartphone,
  Lock,
  CheckCircle,
  Globe,
} from "lucide-react";
import { useState } from "react";
import NavigationSidebar from "../components/NavigationSidebar";
import BottomSheet from "../components/BottomSheet";

interface AboutPageProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

export default function AboutPage({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: AboutPageProps) {
  const [activeSection, setActiveSection] = useState("mision");

  const sections = [
    { id: "mision", label: "Misión", icon: <Target className="w-4 h-4" /> },
    { id: "como-funciona", label: "Cómo Funciona", icon: <Wifi className="w-4 h-4" /> },
    { id: "tecnologia", label: "Tecnología", icon: <Lock className="w-4 h-4" /> },
    { id: "valores", label: "Valores", icon: <Heart className="w-4 h-4" /> },
    { id: "casos-uso", label: "Casos de Uso", icon: <Smartphone className="w-4 h-4" /> },
    { id: "testimonios", label: "Testimonios", icon: <Star className="w-4 h-4" /> },
  ];

  const TESTIMONIALS = [
    {
      name: "Carlos Rodríguez",
      rating: 5,
      message: "Sin saldo y pude seguir usando internet. JJSecure me salvó el trabajo.",
      date: "Hace 2 días",
    },
    {
      name: "María González",
      rating: 5,
      message: "Tenía mis gigas congelados y gracias a JJSecure pude estudiar desde casa.",
      date: "Hace 1 semana",
    },
    {
      name: "Luis Martínez",
      rating: 5,
      message: "App ligera, funciona cuando otros no. Nunca más sin conexión.",
      date: "Hace 3 días",
    },
    {
      name: "Jazmin Cardozo",
      rating: 5,
      message: "El soporte responde rápido y la conexión VPN es súper estable.",
      date: "Hace 5 días",
    },
  ];

  const STATS = [
    { label: "Usuarios Activos", value: "15K+" },
    { label: "Disponibilidad", value: "99.9%" },
    { label: "Soporte", value: "24/7" },
  ];

  return (
    <div className="min-h-screen bg-[#181818]">
      {/* Sidebar - Desktop */}
      <NavigationSidebar
        title="Sobre JJSecure"
        subtitle="Conoce nuestra visión"
        sections={sections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      >
        <div className="p-6 border-t border-neutral-800">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
            Estadísticas
          </p>
          <div className="space-y-3 text-sm">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex justify-between">
                <span className="text-neutral-400">{stat.label}</span>
                <span className="font-medium text-purple-400">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </NavigationSidebar>

      {/* Main Content */}
      <main className="md:ml-[312px] pt-8 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {/* Hero */}
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-800 rounded-full mb-6 border border-neutral-700">
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-neutral-400">JJSecure VPN</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
              Nunca más sin
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                conexión a internet
              </span>
            </h1>

            <p className="text-xl text-neutral-400 leading-relaxed max-w-2xl">
              Somos una VPN especializada en mantener tu conexión activa cuando no tienes saldo. Ante bloqueos de operadora, trabajamos constantemente en nuevas soluciones para que sigas conectado.
            </p>
          </div>

          {/* Misión */}
          <section id="mision" className="mb-20 scroll-mt-24">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              Nuestra Misión
            </h2>

            <div className="space-y-6">
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-8">
                <h3 className="text-xl font-bold mb-6 text-white">¿Qué Hacemos Exactamente?</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-neutral-200">Acceso sin saldo</div>
                      <div className="text-sm text-neutral-500">Cuando tu saldo se agota, nosotros te mantenemos conectado</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-neutral-200">Servidor especial que congela megas</div>
                      <div className="text-sm text-neutral-500">Tus datos no se gastan cuando te conectas a nuestro servidor</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-neutral-200">Bloqueos de operadora</div>
                      <div className="text-sm text-neutral-500">Innovamos constantemente para superar nuevos bloqueos</div>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-8">
                <h3 className="text-xl font-bold mb-4 text-white">Nuestra Promesa</h3>
                <p className="text-neutral-300 mb-6 leading-relaxed">
                  Nos comprometemos a mantener tu conexión activa cuando no tienes saldo. Si la operadora implementa bloqueos, trabajamos sin parar para traer nuevos métodos lo antes posible. Tu conectividad es nuestra prioridad.
                </p>
                <div className="bg-neutral-800 border-l-4 border-purple-400 pl-4 py-3 rounded-r-lg">
                  <p className="text-purple-300 font-medium">
                    "Innovar constantemente para que nunca te quedes sin opciones"
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Cómo Funciona */}
          <section id="como-funciona" className="mb-20 scroll-mt-24">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl flex items-center justify-center">
                <Wifi className="w-5 h-5 text-purple-400" />
              </div>
              Cómo Funciona
            </h2>

            <div className="space-y-4 mb-8">
              {[
                {
                  step: "01",
                  title: "Descarga JJSecure",
                  desc: "Instala nuestra app VPN en tu celular. Es rápida, liviana y fácil de usar.",
                  icon: <Smartphone className="w-5 h-5" />,
                },
                {
                  step: "02",
                  title: "Activa la Conexión VPN",
                  desc: "Presiona un botón y conecta. Nuestra tecnología VPN redirige tu conexión.",
                  icon: <Wifi className="w-5 h-5" />,
                },
                {
                  step: "03",
                  title: "Navega sin Límites",
                  desc: "Accede a internet sin saldo. Siempre buscamos nuevos métodos ante los bloqueos.",
                  icon: <Globe className="w-5 h-5" />,
                },
              ].map((item, i) => (
                <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 flex gap-4 group hover:border-purple-500/30 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <div className="text-purple-400">{item.icon}</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-purple-400/60 mb-1">{item.step}</div>
                    <div className="font-semibold text-neutral-200">{item.title}</div>
                    <p className="text-sm text-neutral-500 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
              <h4 className="font-semibold text-blue-300 mb-2">¿Cómo funciona?</h4>
              <p className="text-sm text-neutral-300">
                JJSecure mantiene tu conexión activa cuando no tienes saldo. Ante bloqueos de operadora, trabajamos continuamente en nuevas soluciones para adaptarnos rápidamente.
              </p>
            </div>
          </section>

          {/* Casos de Uso */}
          <section id="casos-uso" className="mb-20 scroll-mt-24">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-purple-400" />
              </div>
              Casos de Uso
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "Sin Saldo",
                  desc: "Tu saldo se acabó pero necesitas seguir conectado.",
                  emoji: "📱",
                },
                {
                  title: "Conexión Bloqueada",
                  desc: "Tu operadora ha bloqueado tu número.",
                  emoji: "🚫",
                },
                {
                  title: "Emergencias",
                  desc: "Situaciones críticas donde necesitas comunicarte.",
                  emoji: "🆘",
                },
                {
                  title: "Viajes",
                  desc: "Necesitas internet en cualquier lugar.",
                  emoji: "✈️",
                },
              ].map((use, i) => (
                <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 hover:border-purple-500/30 transition-colors">
                  <div className="text-3xl mb-3">{use.emoji}</div>
                  <h3 className="font-semibold text-neutral-200 mb-1">{use.title}</h3>
                  <p className="text-sm text-neutral-500">{use.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tecnología */}
          <section id="tecnologia" className="mb-20 scroll-mt-24">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-purple-400" />
              </div>
              Tecnología VPN
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                {
                  icon: <Server className="w-5 h-5" />,
                  title: "Servidores Inteligentes",
                  desc: "Red de servidores optimizados que detectan y evitan bloqueos.",
                },
                {
                  icon: <TrendingUp className="w-5 h-5" />,
                  title: "Rotación Automática",
                  desc: "Si un servidor es bloqueado, automáticamente se activa otro.",
                },
                {
                  icon: <Zap className="w-5 h-5" />,
                  title: "Conexión Ultra Rápida",
                  desc: "VPN optimizada para móviles que no consume casi batería.",
                },
                {
                  icon: <Shield className="w-5 h-5" />,
                  title: "Encriptación Segura",
                  desc: "Tu tráfico está protegido. Privacidad garantizada.",
                },
              ].map((tech, i) => (
                <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 group hover:border-purple-500/30 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-purple-400">{tech.icon}</div>
                  </div>
                  <h3 className="font-semibold text-neutral-200 text-sm mb-1">{tech.title}</h3>
                  <p className="text-sm text-neutral-500">{tech.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-8">
              <h3 className="font-bold text-lg mb-4">¿Por Qué JJSecure VPN Es Diferente?</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-neutral-400 text-sm">
                <li>✓ Acceso sin saldo mobile</li>
                <li>✓ Responde a bloqueos en minutos</li>
                <li>✓ Diseñada para Argentina</li>
                <li>✓ Soporte 24/7 activo</li>
                <li>✓ App liviana y rápida</li>
                <li>✓ Sin logs, privacidad primero</li>
              </ul>
            </div>
          </section>

          {/* Valores */}
          <section id="valores" className="mb-20 scroll-mt-24">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-purple-400" />
              </div>
              Nuestros Valores
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  emoji: "🎯",
                  title: "Accesibilidad",
                  desc: "Internet es un derecho. Trabajamos para que nadie quede desconectado.",
                },
                {
                  emoji: "🤝",
                  title: "Transparencia",
                  desc: "Sin secretos. Te decimos qué hacemos y por qué.",
                },
                {
                  emoji: "💪",
                  title: "Resiliencia",
                  desc: "Los bloqueos son parte del juego. Nunca nos rendimos.",
                },
              ].map((val, i) => (
                <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 text-center hover:border-purple-500/30 transition-colors">
                  <div className="text-4xl mb-3">{val.emoji}</div>
                  <h3 className="font-semibold text-neutral-200 mb-2">{val.title}</h3>
                  <p className="text-sm text-neutral-500">{val.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Testimonios */}
          <section id="testimonios" className="mb-20 scroll-mt-24">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-400" />
              </div>
              Testimonios
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 hover:border-purple-500/30 transition-colors">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }, (_, j) => (
                      <Star
                        key={j}
                        className={`w-4 h-4 ${
                          j < t.rating
                            ? "text-purple-400 fill-purple-400"
                            : "text-neutral-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-neutral-300 mb-4 text-sm italic">"{t.message}"</p>
                  <div className="flex justify-between items-center text-xs">
                    <div className="font-semibold text-neutral-300">{t.name}</div>
                    <div className="text-neutral-600">{t.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Final */}
          <section className="bg-gradient-to-r from-purple-600/20 via-purple-500/10 to-purple-600/20 border border-neutral-800 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">¿Listo para conectarte?</h2>
            <p className="text-neutral-400 mb-8 max-w-2xl mx-auto">
              No pierdas más tiempo sin conexión. JJSecure te mantiene conectado sin importar qué.
            </p>
            <button className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-xl font-semibold transition-colors">
              Descargar JJSecure Ahora
              <Zap className="w-5 h-5" />
            </button>
          </section>
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
                document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 300);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeSection === section.id
                ? "bg-purple-900/20 text-purple-300"
                : "text-neutral-400 hover:bg-neutral-800"
            }`}
          >
            {section.icon}
            {section.label}
          </button>
        ))}
      </BottomSheet>
    </div>
  );
}
