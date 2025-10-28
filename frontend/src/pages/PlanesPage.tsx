import { useState, useEffect } from "react";
import {
  Users,
  Shield,
  Zap,
  Crown,
  Star,
  Timer,
  Check,
  MessageCircle,
  ArrowRight,
  Signal,
  Phone,
  RefreshCw,
  ChevronDown,
  Wifi,
  Smartphone,
  Gauge,
} from "lucide-react";
import CheckoutModal from "../components/CheckoutModal";
import RenovacionModal from "../components/RenovacionModal";
import DemoModal from "../components/DemoModal";
import Loading from "../components/Loading";
import { PromoTimer } from "../components/PromoTimer";
import { Plan, CompraRequest } from "../types";
import { apiService } from "../services/api.service";
import { useServerStats } from "../hooks/useServerStats";
import { useHeroConfig } from "../hooks/useHeroConfig";

export default function PlanesPage() {
  const [planSeleccionado, setPlanSeleccionado] = useState<Plan | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
  const [comprando, setComprando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarRenovacion, setMostrarRenovacion] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  // Obtener stats reales de servidores
  const { totalUsers, onlineServers } = useServerStats(10000);

  // Obtener configuración del hero
  const { config: heroConfig } = useHeroConfig();

  useEffect(() => {
    cargarPlanes();
  }, []);

  const cargarPlanes = async () => {
    try {
      setCargando(true);
      const planesObtenidos = await apiService.obtenerPlanes();
      setPlanes(planesObtenidos);
    } catch (err: any) {
      console.error("Error cargando planes:", err);
      setError("Error al cargar los planes. Por favor, recarga la página.");
    } finally {
      setCargando(false);
    }
  };

  // Agrupar planes por duración (usar planes cargados de la API)
  const groupedPlans = [
    {
      title: "Planes de 3 días",
      tagline: "Ideal para test o uso corto",
      accent: "from-blue-400 to-blue-600",
      chipBg: "bg-blue-50 text-blue-700",
      icon: <Timer className="w-5 h-5" />,
      description:
        "Perfecto para pruebas rápidas o uso temporal. Costo diario algo mayor que el de 7 días.",
      bestFor: "Usuarios que necesitan acceso breve",
      items: planes.filter((p) => p.dias === 3),
    },
    {
      title: "Planes de 7 días",
      tagline: "Ideal para probar el servicio",
      accent: "from-emerald-400 to-emerald-600",
      chipBg: "bg-emerald-50 text-emerald-700",
      icon: <Timer className="w-5 h-5" />,
      description:
        "Perfecto si quieres probar nuestro servicio sin compromiso. Acceso completo a todos los servidores y máxima velocidad.",
      bestFor: "Usuarios nuevos que quieren experimentar",
      items: planes.filter((p) => p.dias === 7),
    },
    {
      title: "Planes de 15 días",
      tagline: "Balance perfecto: precio y duración",
      accent: "from-purple-400 to-purple-600",
      chipBg: "bg-purple-50 text-purple-700",
      icon: <Zap className="w-5 h-5" />,
      description:
        "La opción más versátil. Dos semanas de acceso completo a precio muy competitivo. Popular entre usuarios ocasionales.",
      bestFor: "Usuarios que necesitan flexibilidad",
      items: planes.filter((p) => p.dias === 15),
    },
    {
      title: "Planes de 20 días",
      tagline: "Duración media, entre 15 y 30 días",
      accent: "from-cyan-400 to-cyan-600",
      chipBg: "bg-cyan-50 text-cyan-700",
      icon: <Zap className="w-5 h-5" />,
      description:
        "Promedio entre $300/día (15d) y $200/día (30d). Opción equilibrada para uso prolongado.",
      bestFor: "Usuarios que buscan buen valor medio",
      items: planes.filter((p) => p.dias === 20),
    },
    {
      title: "Planes de 25 días",
      tagline: "Casi mensual, pero más económico que el de 30 días",
      accent: "from-indigo-400 to-indigo-600",
      chipBg: "bg-indigo-50 text-indigo-700",
      icon: <Star className="w-5 h-5" />,
      description:
        "Veinticinco días de acceso premium a precio competitivo. Mejor relación calidad-precio para uso extendido.",
      bestFor: "Usuarios que quieren casi un mes completo",
      items: planes.filter((p) => p.dias === 25),
    },
    {
      title: "Planes de 30 días",
      tagline: "Mejor valor para uso continuo",
      accent: "from-amber-400 to-amber-600",
      chipBg: "bg-amber-50 text-amber-700",
      icon: <Star className="w-5 h-5" />,
      recommended: true,
      description:
        "Un mes completo de acceso premium. El mejor precio por día. Ideal para quienes necesitan VPN regularmente.",
      bestFor: "Usuarios que usan VPN diariamente",
      items: planes.filter((p) => p.dias === 30),
    },
  ];

  const handleSeleccionarPlan = (plan: Plan) => {
    setPlanSeleccionado(plan);
  };

  const handleCerrarModal = () => {
    setPlanSeleccionado(null);
  };

  const togglePlan = (planId: number) => {
    setExpandedPlanId(expandedPlanId === planId ? null : planId);
  };

  const handleConfirmarCompra = async (datos: CompraRequest) => {
    try {
      setComprando(true);
      setError(null);

      // Llamar al servicio de compra
      const respuesta = await apiService.comprarPlan(datos);

      // Redirigir a MercadoPago
      if (respuesta.linkPago) {
        window.location.href = respuesta.linkPago;
      } else {
        throw new Error("No se recibió el enlace de pago");
      }
    } catch (err: any) {
      console.error("Error en la compra:", err);
      setError(
        err.message ||
          "Error al procesar la compra. Por favor, intenta nuevamente."
      );
      setComprando(false);
    }
  };

  // Mostrar estado de carga
  if (cargando) {
    return <Loading message="Cargando planes..." />;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 pt-24 pb-16 md:pt-32 md:pb-20 overflow-x-hidden">
        {/* Banner de Promoción */}
        {heroConfig?.promocion?.habilitada && (
          <div className="w-full py-4 flex justify-center">
            <div
              className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border backdrop-blur-md shadow-lg ${
                heroConfig.promocion.borderColor || "border-rose-500/40"
              } ${heroConfig.promocion.bgColor || "bg-slate-900/60"} ${
                heroConfig.promocion.shadowColor || "shadow-rose-500/30"
              }`}
            >
              <Zap
                className={`w-5 h-5 ${
                  heroConfig.promocion.iconColor || "text-rose-400"
                } animate-pulse`}
              />
              <span
                className={`text-sm font-medium ${
                  heroConfig.promocion.textColor || "text-rose-300"
                }`}
              >
                {heroConfig.promocion.texto}
              </span>
            </div>
          </div>
        )}

        {/* Temporizador de Promoción */}
        <PromoTimer />

        <div
          className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${
            heroConfig?.promocion?.habilitada ? "pt-8 md:pt-10" : ""
          }`}
        >
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-purple-500/15 text-purple-300 rounded-full px-4 py-2 mb-6 border border-purple-500/30">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">VPN Premium</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {heroConfig?.titulo || "Conecta sin Límites"}
            </h1>

            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
              {heroConfig?.descripcion ||
                "Planes flexibles y velocidad premium para tu estilo de vida digital"}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                {
                  value: "99.9%",
                  label: "Uptime",
                  icon: <Signal className="w-5 h-5" />,
                },
                {
                  value: "24/7",
                  label: "Soporte",
                  icon: <MessageCircle className="w-5 h-5" />,
                },
                {
                  value: totalUsers > 0 ? `${totalUsers}+` : "...",
                  label: "Usuarios Online",
                  icon: <Users className="w-5 h-5" />,
                },
                {
                  value: onlineServers > 0 ? onlineServers : "...",
                  label: "Servidores Online",
                  icon: <Shield className="w-5 h-5" />,
                },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2 text-purple-400">
                    {stat.icon}
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-white mb-1 tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Planes Section */}
      <section className="bg-gray-950 py-16 md:py-24 overflow-x-hidden">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Lista de Planes y Precios
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto mb-6">
              Elige la duración que mejor se adapte a ti. Precios claros y sin
              sorpresas. Haz clic en cada plan para ver todos los detalles.
            </p>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setMostrarRenovacion(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                Renovar o Actualizar
              </button>

              <button
                onClick={() => setIsDemoOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition-all"
              >
                <span>🎁</span>
                Prueba gratis (2 horas)
              </button>
            </div>
          </div>

          {/* Banner de beneficios */}
          <div className="relative mb-12 max-w-5xl mx-auto w-full px-4 sm:px-6 md:px-0">
            <div className="pointer-events-none absolute -inset-x-4 sm:-inset-x-6 md:inset-x-0 -top-4 -bottom-4 bg-gradient-to-r from-purple-600/20 via-purple-500/10 to-purple-600/20 opacity-50 rounded-3xl blur-xl" />
            <div className="relative rounded-2xl px-4 sm:px-6 py-5 text-xs sm:text-sm bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/60 overflow-hidden">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 font-medium text-gray-100">
                  <Shield className="w-4 h-4 text-purple-400 flex-shrink-0" />{" "}
                  Todos los planes incluyen:
                </div>
                <ul className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 text-gray-300">
                  <li className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-purple-400" /> Velocidad
                    ilimitada
                  </li>
                  <li className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-purple-400" /> Cifrado seguro
                  </li>
                  <li className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-purple-400" /> Soporte 24/7
                  </li>
                  <li className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-purple-400" /> Activación
                    instantánea
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Grupos de planes */}
          <div className="grid gap-16 max-w-5xl mx-auto w-full">
            {groupedPlans.map((group) => (
              <section key={group.title} className="px-4 sm:px-6 md:px-0">
                {/* Header del grupo */}
                <div className="mb-8 relative">
                  <div
                    className={`pointer-events-none absolute -inset-x-4 sm:-inset-x-6 md:inset-x-0 -top-4 h-32 bg-gradient-to-r ${group.accent} opacity-10 rounded-3xl blur-xl`}
                  />
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${group.accent} text-white flex items-center justify-center shadow-lg`}
                      >
                        {group.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                          {group.title}
                          {group.recommended && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-amber-400/15 text-amber-400 px-2 py-1 rounded-full border border-amber-400/30">
                              <Star className="w-3 h-3" /> Mejor Valor
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-400 font-medium mt-0.5">
                          {group.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Descripción general del grupo */}
                    <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                            Descripción
                          </p>
                          <p className="text-sm text-gray-200 leading-relaxed">
                            {group.description}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                            Ideal Para
                          </p>
                          <p className="text-sm text-gray-200 leading-relaxed">
                            {group.bestFor}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista de planes colapsables */}
                <div className="space-y-3">
                  {group.items.map((plan) => (
                    <div
                      key={plan.id}
                      className={`group relative bg-gradient-to-br from-gray-900 to-gray-950 border rounded-lg transition-all duration-200 overflow-hidden ${
                        plan.popular
                          ? "border-purple-500/50 shadow-lg shadow-purple-500/10"
                          : "border-gray-800/60 hover:border-gray-700/80"
                      }`}
                    >
                      <div
                        className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${group.accent}`}
                      />

                      {/* Header del plan */}
                      <button
                        onClick={() => togglePlan(plan.id)}
                        className="w-full px-3 sm:px-5 py-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors gap-3 sm:gap-4"
                      >
                        <div className="flex items-center gap-2 sm:gap-4 flex-1 text-left pl-0 sm:pl-1 min-w-0">
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            {plan.popular && (
                              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold bg-purple-500/15 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30 whitespace-nowrap">
                                <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />{" "}
                                Popular
                              </span>
                            )}
                            <span className="text-gray-100 text-xs sm:text-sm font-semibold min-w-fit">
                              {plan.connection_limit}{" "}
                              {plan.connection_limit === 1 ? "Login" : "Logins"}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 hidden sm:inline">
                            {plan.connection_limit} dispositivo
                            {plan.connection_limit !== 1 ? "s" : ""}{" "}
                            simultáneamente
                          </span>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-base sm:text-lg font-bold text-purple-400 tracking-tight">
                              ${plan.precio.toLocaleString()}
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-500">
                              ${(plan.precio / plan.dias).toFixed(0)}/día
                            </div>
                          </div>
                          <ChevronDown
                            className={`w-4 sm:w-5 h-4 sm:h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                              expandedPlanId === plan.id ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </button>

                      {/* Contenido expandible */}
                      {expandedPlanId === plan.id && (
                        <div className="border-t border-gray-800/60 px-3 sm:px-5 py-4 bg-gray-900/50">
                          <div className="space-y-4 sm:space-y-6">
                            {/* Lo que incluye */}
                            <div>
                              <h4 className="text-xs sm:text-sm font-semibold text-gray-200 mb-2 sm:mb-3">
                                ¿Qué incluye este plan?
                              </h4>
                              <div className="space-y-2 text-xs sm:text-sm text-gray-300">
                                <div className="flex gap-2">
                                  <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                  <span>
                                    <strong>{plan.dias} días</strong> de acceso
                                    completo
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                  <span>
                                    Conecta{" "}
                                    <strong>
                                      {plan.connection_limit} dispositivo
                                      {plan.connection_limit !== 1 ? "s" : ""}
                                    </strong>{" "}
                                    simultáneamente
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                  <span>
                                    <strong>Velocidad ilimitada</strong> sin
                                    restricciones
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <Gauge className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                  <span>
                                    <strong>
                                      Acceso a todos los servidores
                                    </strong>{" "}
                                    disponibles
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                  <span>
                                    <strong>Cifrado militar</strong> para máxima
                                    seguridad
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                  <span>
                                    <strong>Soporte prioritario</strong> 24/7
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Comparación de valor */}
                            <div>
                              <h4 className="text-xs sm:text-sm font-semibold text-gray-200 mb-2 sm:mb-3">
                                Valor por día
                              </h4>
                              <div className="bg-white/5 p-2 sm:p-3 rounded-lg">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-[10px] sm:text-xs text-gray-400">
                                    Costo diario:
                                  </span>
                                  <span className="text-lg sm:text-xl font-bold text-emerald-400">
                                    ${(plan.precio / plan.dias).toFixed(2)}
                                  </span>
                                  <span className="text-[10px] sm:text-xs text-gray-400">
                                    por día
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Por qué elegir este plan */}
                            <div>
                              <h4 className="text-xs sm:text-sm font-semibold text-gray-200 mb-2 sm:mb-3">
                                Por qué elegir este plan:
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-400 bg-white/5 p-2 sm:p-3 rounded">
                                {plan.dias === 3 &&
                                  "Ideal para testing rápido o uso muy corto. Perfecto para verificar la calidad del servicio antes de comprometerte con períodos más largos."}
                                {plan.dias === 7 &&
                                  "Perfecto para probar sin riesgo. Acceso completo a todas las funciones. Ideal si quieres experimentar antes de un compromiso mayor."}
                                {plan.dias === 15 &&
                                  "El equilibrio perfecto entre duración y precio. Dos semanas es suficiente para muchas necesidades. Excelente relación calidad-precio."}
                                {plan.dias === 20 &&
                                  "Duración intermedia excelente. Más económico que el plan de 30 días pero suficiente para la mayoría de usos. Ideal para períodos medios."}
                                {plan.dias === 25 &&
                                  "Casi mensual pero más conveniente. El mejor precio por día entre las opciones disponibles. Perfecto para usuarios frecuentes."}
                                {plan.dias === 30 &&
                                  "El mejor valor del mercado. Un mes completo es ideal para usuarios regulares. Disfruta de acceso sin límites por más tiempo."}
                              </p>
                            </div>

                            {/* Botón de compra */}
                            <button
                              onClick={() => handleSeleccionarPlan(plan)}
                              disabled={comprando}
                              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                              Comprar ahora
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Garantía */}
          <div className="mt-16 text-center px-4 sm:px-0">
            <div className="inline-flex items-center gap-2 text-purple-400">
              <Shield className="w-4 h-4" />
              <span className="text-gray-300 text-sm">
                Garantía de satisfacción • Configuración gratuita
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de contacto */}
      <section className="py-16 md:py-24 bg-gray-900 overflow-x-hidden">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Soporte 24/7
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Nuestro equipo está disponible las 24 horas
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/60 rounded-xl p-8 text-center hover:border-purple-500/30 transition-all duration-300">
                <div className="w-12 h-12 bg-purple-500/15 border border-purple-500/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Telegram
                </h3>
                <p className="text-gray-400 mb-4">Respuesta inmediata</p>
                <a
                  href="https://t.me/+rAuU1_uHGZthMWZh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  <span>Contactar ahora</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/60 rounded-xl p-8 text-center hover:border-purple-500/30 transition-all duration-300">
                <div className="w-12 h-12 bg-purple-500/15 border border-purple-500/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  WhatsApp
                </h3>
                <p className="text-gray-400 mb-4">Ayuda especializada</p>
                <a
                  href="https://chat.whatsapp.com/LU16SUptp4xFQ4zTNta7Ja"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  <span>Unirse al canal</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mensaje de error */}
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-red-200">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de checkout */}
      {planSeleccionado && (
        <CheckoutModal
          plan={planSeleccionado}
          onClose={handleCerrarModal}
          onConfirm={handleConfirmarCompra}
          loading={comprando}
        />
      )}

      {/* Modal de renovación */}
      <RenovacionModal
        isOpen={mostrarRenovacion}
        onClose={() => setMostrarRenovacion(false)}
      />
    </div>
  );
}
