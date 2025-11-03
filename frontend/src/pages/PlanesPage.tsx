import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Shield,
  Zap,
  Crown,
  Star,
  Timer,
  Check,
  MessageCircle,
  Signal,
  Phone,
  RefreshCw,
  ChevronRight,
  Wifi,
  Smartphone,
  Gauge,
  Sparkles,
} from "lucide-react";
import RenovacionModal from "../components/RenovacionModal";
import DemoModal from "../components/DemoModal";
import BottomSheet from "../components/BottomSheet";
import NavigationSidebar from "../components/NavigationSidebar";
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
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [mostrarRenovacion, setMostrarRenovacion] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("3-días");

  const { totalUsers, onlineServers } = useServerStats(10000);
  const { config: heroConfig } = useHeroConfig();

  const planSections = [
    {
      id: "3-días",
      label: "3 días",
      subtitle: "Prueba rápida",
      icon: <Timer className="w-4 h-4" />,
    },
    {
      id: "7-días",
      label: "7 días",
      subtitle: "Ideal para probar",
      icon: <Timer className="w-4 h-4" />,
    },
    {
      id: "15-días",
      label: "15 días",
      subtitle: "Balance perfecto",
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: "20-días",
      label: "20 días",
      subtitle: "Duración media",
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: "25-días",
      label: "25 días",
      subtitle: "Casi mensual",
      icon: <Star className="w-4 h-4" />,
    },
    {
      id: "30-días",
      label: "30 días",
      subtitle: "Mejor valor",
      icon: <Crown className="w-4 h-4" />,
    },
  ];

  useEffect(() => {
    cargarPlanes();
  }, []);

  const cargarPlanes = async () => {
    try {
      const planesObtenidos = await apiService.obtenerPlanes();
      console.log("Planes obtenidos:", planesObtenidos.length, "planes");
      planesObtenidos.forEach((plan) => {
        console.log(
          `Plan ID ${plan.id}: ${plan.nombre} - ${plan.dias} días - $${plan.precio}`
        );
      });
      setPlanes(planesObtenidos);
    } catch (err: any) {
      console.error("Error cargando planes:", err);
    }
  };

  const togglePlan = (planId: number) => {
    setExpandedPlanId(expandedPlanId === planId ? null : planId);
  };

  const groupedPlans = [
    {
      title: "3 días",
      subtitle: "Prueba rápida",
      accent: "bg-blue-500/10 border-blue-500/20",
      accentText: "text-blue-400",
      icon: <Timer className="w-5 h-5" />,
      items: planes.filter((p) => p.dias === 3),
    },
    {
      title: "7 días",
      subtitle: "Ideal para probar",
      accent: "bg-emerald-500/10 border-emerald-500/20",
      accentText: "text-emerald-400",
      icon: <Timer className="w-5 h-5" />,
      items: planes.filter((p) => p.dias === 7),
    },
    {
      title: "15 días",
      subtitle: "Balance perfecto",
      accent: "bg-purple-500/10 border-purple-500/20",
      accentText: "text-purple-400",
      icon: <Zap className="w-5 h-5" />,
      items: planes.filter((p) => p.dias === 15),
    },
    {
      title: "20 días",
      subtitle: "Duración media",
      accent: "bg-cyan-500/10 border-cyan-500/20",
      accentText: "text-cyan-400",
      icon: <Zap className="w-5 h-5" />,
      items: planes.filter((p) => p.dias === 20),
    },
    {
      title: "25 días",
      subtitle: "Casi mensual",
      accent: "bg-indigo-500/10 border-indigo-500/20",
      accentText: "text-indigo-400",
      icon: <Star className="w-5 h-5" />,
      items: planes.filter((p) => p.dias === 25),
    },
    {
      title: "30 días",
      subtitle: "Mejor valor",
      accent: "bg-amber-500/10 border-amber-500/20",
      accentText: "text-amber-400",
      icon: <Crown className="w-5 h-5" />,
      recommended: true,
      items: planes.filter((p) => p.dias === 30),
    },
  ];

  return (
    <div className="min-h-screen bg-[#181818]">
      {/* Sidebar */}
      <NavigationSidebar
        title="Planes VPN"
        subtitle="Elige tu plan"
        sections={planSections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        sectionIdPrefix="plan-"
      />

      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />

      {/* Main Content */}
      <main className="md:ml-[312px] pt-16 md:pt-0">
        {/* Hero Section */}
        <section className="relative pt-36 pb-16 md:pt-36 md:pb-20">
          <div className="max-w-[1400px] mx-auto px-6 md:px-8">
            <div className="max-w-3xl mx-auto text-center">
              {/* Banner de Promoción - Más prominente */}
              {heroConfig?.promocion?.habilitada && (
                <div className="mb-8">
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-rose-600/20 to-pink-600/20 border border-rose-500/30 text-rose-300 rounded-full px-6 py-3 shadow-lg shadow-rose-500/20">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                    <span className="text-sm font-semibold">
                      {heroConfig.promocion.texto}
                    </span>
                  </div>
                </div>
              )}

              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">VPN Premium</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-neutral-200 mb-6">
                {heroConfig?.titulo || "Planes VPN Premium"}
              </h1>

              <p className="text-lg text-neutral-400 mb-8">
                {heroConfig?.descripcion ||
                  "Conecta de forma segura y privada. Elige el plan perfecto para ti."}
              </p>

              {/* Temporizador de Promoción - Más prominente */}
              <div className="mb-8">
                <PromoTimer />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {[
                  {
                    value: "99.9%",
                    label: "Uptime",
                    icon: <Signal className="w-4 h-4" />,
                  },
                  {
                    value: "24/7",
                    label: "Soporte",
                    icon: <MessageCircle className="w-4 h-4" />,
                  },
                  {
                    value: totalUsers > 0 ? `${totalUsers}+` : "...",
                    label: "Usuarios",
                    icon: <Users className="w-4 h-4" />,
                  },
                  {
                    value: onlineServers > 0 ? onlineServers : "...",
                    label: "Servidores",
                    icon: <Shield className="w-4 h-4" />,
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex justify-center mb-2 text-purple-400">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-neutral-200 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs text-neutral-500">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setIsDemoOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold text-white transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Prueba gratis (2 horas)
                </button>
                <button
                  onClick={() => setMostrarRenovacion(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-sm font-semibold text-neutral-200 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Renovar plan
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Banner */}
        <section className="pb-16">
          <div className="max-w-[1400px] mx-auto px-6 md:px-8">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-2 font-semibold text-neutral-200">
                  <Shield className="w-4 h-4 text-purple-400" />
                  Todos los planes incluyen:
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-purple-400" /> Velocidad
                    ilimitada
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-purple-400" /> Cifrado
                    seguro
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-purple-400" /> Soporte
                    24/7
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-purple-400" /> Activación
                    instantánea
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Plans Section */}
        <section className="pb-20">
          <div className="max-w-[1400px] mx-auto px-6 md:px-8">
            <div className="space-y-12">
              {groupedPlans.map((group) => (
                <div
                  key={group.title}
                  id={`plan-${group.title.toLowerCase().replace(" ", "-")}`}
                  className={`transition-all duration-500 ${
                    activeSection ===
                    group.title.toLowerCase().replace(" ", "-")
                      ? "ring-2 ring-purple-500/30 rounded-lg p-2 md:p-4 bg-purple-500/5"
                      : ""
                  }`}
                >
                  {/* Group Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg border ${group.accent}`}>
                        <div className={group.accentText}>{group.icon}</div>
                      </div>
                      <div>
                        <h2
                          className={`text-2xl font-bold flex items-center gap-2 transition-colors duration-300 ${
                            activeSection ===
                            group.title.toLowerCase().replace(" ", "-")
                              ? "text-purple-300"
                              : "text-neutral-200"
                          }`}
                        >
                          {group.title}
                          {group.recommended && (
                            <span className="text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
                              <Star className="w-3 h-3 inline mr-1" />
                              Recomendado
                            </span>
                          )}
                        </h2>
                        <p className="text-sm text-neutral-500">
                          {group.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Plans List */}
                  <div className="space-y-3">
                    {group.items.map((plan) => (
                      <div
                        key={plan.id}
                        className={`bg-neutral-900 border rounded-lg overflow-hidden transition-all ${
                          plan.popular
                            ? "border-purple-500/50"
                            : "border-neutral-800 hover:border-neutral-700"
                        }`}
                      >
                        {/* Plan Header - Clickable */}
                        <button
                          onClick={() => togglePlan(plan.id)}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            {plan.popular && (
                              <span className="text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-1 rounded-full flex items-center gap-1">
                                <Crown className="w-3 h-3" />
                                Popular
                              </span>
                            )}
                            <div className="text-left">
                              <div className="text-sm font-semibold text-neutral-200">
                                {plan.connection_limit}{" "}
                                {plan.connection_limit === 1
                                  ? "Login"
                                  : "Logins"}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {plan.connection_limit} dispositivo
                                {plan.connection_limit !== 1 ? "s" : ""}{" "}
                                simultáneo
                                {plan.connection_limit !== 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-2xl font-bold text-neutral-200">
                                ${plan.precio.toLocaleString()}
                              </div>
                              <div className="text-xs text-neutral-500">
                                ${(plan.precio / plan.dias).toFixed(0)}/día
                              </div>
                            </div>
                            <ChevronRight
                              className={`w-5 h-5 text-neutral-400 transition-transform ${
                                expandedPlanId === plan.id ? "rotate-90" : ""
                              }`}
                            />
                          </div>
                        </button>

                        {/* Expanded Content */}
                        {expandedPlanId === plan.id && (
                          <div className="border-t border-neutral-800 bg-neutral-900/50">
                            <div className="p-6 space-y-6">
                              {/* Features Grid */}
                              <div>
                                <h4 className="text-sm font-semibold text-neutral-200 mb-3">
                                  ¿Qué incluye este plan?
                                </h4>
                                <div className="grid md:grid-cols-2 gap-3">
                                  <div className="flex items-start gap-2 text-sm text-neutral-300">
                                    <Timer className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                    <span>
                                      <strong>{plan.dias} días</strong> de
                                      acceso completo
                                    </span>
                                  </div>
                                  <div className="flex items-start gap-2 text-sm text-neutral-300">
                                    <Smartphone className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                    <span>
                                      <strong>
                                        {plan.connection_limit} dispositivo
                                        {plan.connection_limit !== 1 ? "s" : ""}
                                      </strong>{" "}
                                      simultáneamente
                                    </span>
                                  </div>
                                  <div className="flex items-start gap-2 text-sm text-neutral-300">
                                    <Wifi className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                    <span>
                                      <strong>Velocidad ilimitada</strong> sin
                                      restricciones
                                    </span>
                                  </div>
                                  <div className="flex items-start gap-2 text-sm text-neutral-300">
                                    <Gauge className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                    <span>
                                      <strong>Todos los servidores</strong>{" "}
                                      disponibles
                                    </span>
                                  </div>
                                  <div className="flex items-start gap-2 text-sm text-neutral-300">
                                    <Shield className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                    <span>
                                      <strong>Cifrado militar</strong> seguridad
                                      máxima
                                    </span>
                                  </div>
                                  <div className="flex items-start gap-2 text-sm text-neutral-300">
                                    <MessageCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                    <span>
                                      <strong>Soporte prioritario</strong> 24/7
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Value Box */}
                              <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-neutral-400">
                                    Costo diario:
                                  </span>
                                  <span className="text-xl font-bold text-emerald-400">
                                    ${(plan.precio / plan.dias).toFixed(2)}/día
                                  </span>
                                </div>
                              </div>

                              {/* Description */}
                              <div className="bg-neutral-800/30 border border-neutral-700 rounded-lg p-4">
                                <p className="text-sm text-neutral-400 leading-relaxed">
                                  {plan.dias === 3 &&
                                    "Ideal para testing rápido o uso muy corto. Perfecto para verificar la calidad del servicio."}
                                  {plan.dias === 7 &&
                                    "Perfecto para probar sin riesgo. Acceso completo a todas las funciones premium."}
                                  {plan.dias === 15 &&
                                    "El equilibrio perfecto entre duración y precio. Excelente relación calidad-precio."}
                                  {plan.dias === 20 &&
                                    "Duración intermedia excelente. Más económico que el plan mensual pero suficiente para la mayoría."}
                                  {plan.dias === 25 &&
                                    "Casi mensual pero más conveniente. El mejor precio por día entre las opciones disponibles."}
                                  {plan.dias === 30 &&
                                    "El mejor valor del mercado. Un mes completo para usuarios regulares que buscan el máximo ahorro."}
                                </p>
                              </div>

                              {/* CTA Button */}
                              <button
                                onClick={() => navigate(`/checkout?planId=${plan.id}`)}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                              >
                                Comprar ahora
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="py-20 bg-neutral-900/50">
          <div className="max-w-[1400px] mx-auto px-6 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-neutral-200 mb-3">
                Soporte 24/7
              </h2>
              <p className="text-neutral-400">
                Estamos disponibles para ayudarte
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <a
                href="https://t.me/+rAuU1_uHGZthMWZh"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 rounded-lg p-8 text-center transition-all"
              >
                <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-200 mb-2">
                  Telegram
                </h3>
                <p className="text-sm text-neutral-400 mb-4">
                  Respuesta inmediata
                </p>
                <span className="inline-flex items-center gap-2 text-purple-400 font-medium group-hover:gap-3 transition-all">
                  Contactar <ChevronRight className="w-4 h-4" />
                </span>
              </a>

              <a
                href="https://chat.whatsapp.com/LU16SUptp4xFQ4zTNta7Ja"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 rounded-lg p-8 text-center transition-all"
              >
                <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-200 mb-2">
                  WhatsApp
                </h3>
                <p className="text-sm text-neutral-400 mb-4">
                  Ayuda especializada
                </p>
                <span className="inline-flex items-center gap-2 text-purple-400 font-medium group-hover:gap-3 transition-all">
                  Unirse <ChevronRight className="w-4 h-4" />
                </span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Modals */}
      <RenovacionModal
        isOpen={mostrarRenovacion}
        onClose={() => setMostrarRenovacion(false)}
      />

      <BottomSheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Planes VPN"
        subtitle="Elige tu duración"
      >
        {planSections.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              setActiveSection(section.id);
              const element = document.getElementById(`plan-${section.id}`);
              if (element) {
                element.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-4 border-b border-neutral-800/30 ${
              activeSection === section.id
                ? "bg-purple-600/10 border-l-4 border-purple-500"
                : "hover:bg-neutral-800"
            }`}
          >
            {section.icon}
            <div className="text-left">
              <div className="font-medium">{section.label}</div>
              <div className="text-xs text-gray-400">{section.subtitle}</div>
            </div>
          </button>
        ))}
      </BottomSheet>
    </div>
  );
}
