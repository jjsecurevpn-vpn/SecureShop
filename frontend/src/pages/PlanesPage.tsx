import { useState, useEffect } from "react";
import {
  Users,
  Shield,
  Crown,
  Check,
  MessageCircle,
  ArrowRight,
  Signal,
  Phone,
  RefreshCw,
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

  // Ordenar planes por precio (usar planes cargados de la API)
  const sortedPlans = planes.sort((a, b) => a.precio - b.precio);

  const handleSeleccionarPlan = (plan: Plan) => {
    setPlanSeleccionado(plan);
  };

  const handleCerrarModal = () => {
    setPlanSeleccionado(null);
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
          <div
            className={`w-full py-3 text-center ${
              heroConfig.promocion.bgColor ||
              "bg-gradient-to-r from-red-600 to-pink-600"
            }`}
          >
            <p
              className={`font-bold text-sm md:text-base ${
                heroConfig.promocion.textColor || "text-white"
              }`}
            >
              {heroConfig.promocion.texto}
            </p>
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

          {/* Lista de planes */}
          <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 md:px-0">
            <div className="grid gap-4 sm:gap-6">
              {sortedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="group relative bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/60 rounded-lg transition-all duration-200 overflow-hidden hover:border-gray-700/80"
                >
                  <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-100 text-sm sm:text-base font-semibold">
                          {plan.connection_limit}{" "}
                          {plan.connection_limit === 1 ? "Login" : "Logins"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {plan.dias} {plan.dias === 1 ? "día" : "días"}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 hidden sm:inline">
                        {plan.connection_limit} dispositivo
                        {plan.connection_limit !== 1 ? "s" : ""} simultáneo
                        {plan.connection_limit !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg sm:text-xl font-bold text-purple-400">
                          ${plan.precio.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${(plan.precio / plan.dias).toFixed(0)}/día
                        </div>
                      </div>
                      <button
                        onClick={() => handleSeleccionarPlan(plan)}
                        disabled={comprando}
                        className="px-4 sm:px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
