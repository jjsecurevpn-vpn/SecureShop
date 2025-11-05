import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Shield,
  Zap,
  Timer,
  Check,
  MessageCircle,
  Signal,
  Phone,
  RefreshCw,
  Wifi,
  Smartphone,
} from "lucide-react";
import RenovacionModal from "../components/RenovacionModal";
import DemoModal from "../components/DemoModal";
import NavigationSidebar from "../components/NavigationSidebar";
import BottomSheet from "../components/BottomSheet";
import { PromoTimer } from "../components/PromoTimer";
import { Plan } from "../types";
import { apiService } from "../services/api.service";
import { useServerStats } from "../hooks/useServerStats";
import { useHeroConfig } from "../hooks/useHeroConfig";

interface PlanesPageProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

export default function PlanesPage({ isMobileMenuOpen, setIsMobileMenuOpen }: PlanesPageProps) {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [mostrarRenovacion, setMostrarRenovacion] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [diasSeleccionados, setDiasSeleccionados] = useState(30);
  const [dispositivosSeleccionados, setDispositivosSeleccionados] = useState(1);
  const [activeSection, setActiveSection] = useState("selector");

  const { totalUsers, onlineServers } = useServerStats(10000);
  const { config: heroConfig } = useHeroConfig();

  const secciones = [
    { id: "selector", label: "Selector de Planes", icon: <Zap className="w-4 h-4" /> },
    { id: "beneficios", label: "Beneficios", icon: <Check className="w-4 h-4" /> },
    { id: "soporte", label: "Soporte", icon: <MessageCircle className="w-4 h-4" /> },
  ];

  useEffect(() => {
    cargarPlanes();
  }, []);

  const cargarPlanes = async () => {
    try {
      const planesObtenidos = await apiService.obtenerPlanes();
      setPlanes(planesObtenidos);
    } catch (err: any) {
      console.error("Error cargando planes:", err);
    }
  };

  const diasDisponibles = Array.from(new Set(planes.map((p) => p.dias))).sort((a, b) => a - b);
  const dispositivosDisponibles = Array.from(
    new Set(planes.map((p) => p.connection_limit))
  ).sort((a, b) => a - b);

  const planSeleccionado = planes.find(
    (p) => p.dias === diasSeleccionados && p.connection_limit === dispositivosSeleccionados
  );

  const precioPorDia = planSeleccionado
    ? (planSeleccionado.precio / planSeleccionado.dias).toFixed(0)
    : 0;

  return (
    <div className="min-h-screen bg-[#181818]">
      <NavigationSidebar
        title="Planes VPN"
        subtitle="Navega las secciones"
        sections={secciones}
        activeSection={activeSection}
        onSectionChange={(id) => {
          setActiveSection(id);
          const element = document.getElementById(`section-${id}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }}
        sectionIdPrefix="section-"
      />

      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />

      <main className="md:ml-[312px] pt-16 md:pt-0">
        {/* Hero Section */}
        <section className="pt-6 pb-16 md:pt-16 md:pb-20 border-b border-neutral-800">
          <div className="max-w-4xl mx-auto px-6 md:px-8">
            {heroConfig?.promocion?.habilitada && (
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg px-3 py-1.5 text-xs font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  {heroConfig.promocion.texto}
                </div>
              </div>
            )}

            <h1 className="text-5xl md:text-6xl font-bold text-neutral-50 mb-4">
              {heroConfig?.titulo || "Planes VPN Premium"}
            </h1>

            <p className="text-lg text-neutral-400 mb-12 max-w-2xl">
              {heroConfig?.descripcion ||
                "Conecta de forma segura y privada. Elige el plan perfecto para ti."}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: "99.9%", label: "Uptime", icon: Signal },
                { value: "24/7", label: "Soporte", icon: MessageCircle },
                { value: totalUsers > 0 ? `${totalUsers}+` : "—", label: "Usuarios", icon: Users },
                { value: onlineServers > 0 ? onlineServers : "—", label: "Servidores", icon: Shield },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-4 h-4 text-neutral-400" />
                      <span className="text-2xl font-bold text-neutral-50">{stat.value}</span>
                    </div>
                    <p className="text-xs text-neutral-500">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section id="section-beneficios" className="py-16 border-b border-neutral-800">
          <div className="max-w-4xl mx-auto px-6 md:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { icon: Zap, title: "Velocidad ilimitada", desc: "Sin restricciones de ancho de banda" },
                { icon: Shield, title: "Cifrado seguro", desc: "Protección de nivel militar" },
                { icon: MessageCircle, title: "Soporte 24/7", desc: "Disponible en múltiples canales" },
                { icon: Check, title: "Activación instantánea", desc: "Acceso inmediato a tu plan" },
              ].map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                        <Icon className="w-5 h-5 text-purple-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-50 mb-1">{benefit.title}</h3>
                      <p className="text-sm text-neutral-400">{benefit.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Promo Timer */}
        <section className="py-12 border-b border-neutral-800">
          <div className="max-w-4xl mx-auto px-6 md:px-8">
            <PromoTimer />
          </div>
        </section>

        {/* Plans Selector */}
        <section id="section-selector" className="py-16 border-b border-neutral-800">
          <div className="max-w-4xl mx-auto px-6 md:px-8">
            <div className="space-y-8">
              {/* Duration Selection */}
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-neutral-50 uppercase tracking-wide">
                    Duración del plan
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">Selecciona cuántos días necesitas</p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {diasDisponibles.map((dias) => (
                    <button
                      key={dias}
                      onClick={() => setDiasSeleccionados(dias)}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        diasSeleccionados === dias
                          ? "bg-purple-600 text-white"
                          : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                      }`}
                    >
                      {dias}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Devices Selection */}
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-neutral-50 uppercase tracking-wide">
                    Dispositivos simultáneos
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">¿Cuántos dispositivos necesitas conectar?</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {dispositivosDisponibles.map((dispositivos) => (
                    <button
                      key={dispositivos}
                      onClick={() => setDispositivosSeleccionados(dispositivos)}
                      className={`relative p-4 rounded-lg border transition-all duration-200 ${
                        dispositivosSeleccionados === dispositivos
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-neutral-700 bg-neutral-900/50 hover:border-neutral-600"
                      }`}
                    >
                      {dispositivosSeleccionados === dispositivos && (
                        <div className="absolute -top-2 -right-2 bg-purple-600 rounded-full p-1">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <p className="text-xl font-bold text-neutral-50">{dispositivos}</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {dispositivos === 1 ? "Dispositivo" : "Dispositivos"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Plan Summary */}
              {planSeleccionado && (
                <div className="space-y-6">
                  <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-neutral-400 text-sm">Costo diario</span>
                      <span className="text-emerald-400 text-lg font-semibold">${precioPorDia}/día</span>
                    </div>
                    <div className="border-t border-neutral-800 pt-4 flex justify-between items-baseline">
                      <span className="text-neutral-50 font-medium">Total</span>
                      <span className="text-4xl font-bold text-neutral-50">${planSeleccionado.precio.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setIsDemoOpen(true)}
                      className="flex-1 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-semibold text-neutral-200 transition-colors"
                    >
                      Prueba gratis (2 horas)
                    </button>
                    <button
                      onClick={() => navigate(`/checkout?planId=${planSeleccionado.id}`)}
                      className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold text-white transition-colors"
                    >
                      Comprar ahora
                    </button>
                  </div>

                  {/* Features List */}
                  <div className="space-y-4 pt-4">
                    {[
                      {
                        icon: Timer,
                        title: `${planSeleccionado.dias} días de acceso`,
                        desc: "Acceso completo a toda nuestra red de servidores VPN",
                      },
                      {
                        icon: Smartphone,
                        title: `${dispositivosSeleccionados} dispositivo${dispositivosSeleccionados !== 1 ? "s" : ""} simultáneamente`,
                        desc: "Conecta desde múltiples dispositivos al mismo tiempo",
                      },
                      {
                        icon: Wifi,
                        title: "Velocidad ilimitada",
                        desc: "Disfruta de velocidades máximas sin restricciones",
                      },
                    ].map((feature, i) => {
                      const Icon = feature.icon;
                      return (
                        <div key={i} className="flex gap-3">
                          <Icon className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-50">{feature.title}</p>
                            <p className="text-xs text-neutral-500 mt-0.5">{feature.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Renewal Action */}
        <section className="py-12 border-b border-neutral-800">
          <div className="max-w-4xl mx-auto px-6 md:px-8">
            <button
              onClick={() => setMostrarRenovacion(true)}
              className="w-full px-6 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg font-medium text-neutral-200 transition-colors inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Renovar plan existente
            </button>
          </div>
        </section>

        {/* Support Section */}
        <section id="section-soporte" className="py-20">
          <div className="max-w-4xl mx-auto px-6 md:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-neutral-50 mb-2">¿Necesitas ayuda?</h2>
              <p className="text-neutral-400">Disponibles 24/7 en múltiples canales</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <a
                href="https://t.me/+rAuU1_uHGZthMWZh"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 bg-neutral-900/50 border border-neutral-800 hover:border-purple-500/50 rounded-lg transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-neutral-50 mb-1">Telegram</h3>
                    <p className="text-sm text-neutral-400">Respuesta inmediata</p>
                  </div>
                  <MessageCircle className="w-5 h-5 text-neutral-500 group-hover:text-purple-400 transition-colors" />
                </div>
              </a>

              <a
                href="https://chat.whatsapp.com/LU16SUptp4xFQ4zTNta7Ja"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 bg-neutral-900/50 border border-neutral-800 hover:border-purple-500/50 rounded-lg transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-neutral-50 mb-1">WhatsApp</h3>
                    <p className="text-sm text-neutral-400">Ayuda especializada</p>
                  </div>
                  <Phone className="w-5 h-5 text-neutral-500 group-hover:text-purple-400 transition-colors" />
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>

      <RenovacionModal
        isOpen={mostrarRenovacion}
        onClose={() => setMostrarRenovacion(false)}
      />

      <BottomSheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Menú"
        subtitle="Navega las secciones"
      >
        {secciones.map((seccion) => (
          <button
            key={seccion.id}
            onClick={() => {
              const element = document.getElementById(`section-${seccion.id}`);
              if (element) {
                element.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-4 border-b border-neutral-800/30 text-left ${
              activeSection === seccion.id
                ? "bg-purple-600/10 border-l-4 border-purple-500"
                : "hover:bg-neutral-800/50"
            }`}
          >
            {seccion.icon}
            <div>
              <div className="font-medium text-neutral-200">{seccion.label}</div>
            </div>
          </button>
        ))}
      </BottomSheet>
    </div>
  );
}