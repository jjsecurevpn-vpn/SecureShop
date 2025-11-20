import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  HandHeart,
  Loader2,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Info,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import Lottie from "lottie-react";
import { apiService } from "../services/api.service";
import { Donacion } from "../types";
import { useSearchParams } from "react-router-dom";
import BottomSheet from "../components/BottomSheet";
import thankYouAnimation from "../assets/lottie/donaciones-thankyou.json";

/**
 * DonacionesPage - Página de donaciones refinada
 * Estilo consistente con CheckoutPage y demás páginas del proyecto
 * Mantiene una estructura enfocada en la conversión
 */
const DonacionesPage = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}) => {
  const [donanteNombre, setDonanteNombre] = useState("");
  const [donanteEmail, setDonanteEmail] = useState("");
  const [monto, setMonto] = useState<number>(5000);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimoResultado, setUltimoResultado] = useState<{
    preferenceId: string;
    linkPago: string;
    donacion: Donacion;
  } | null>(null);
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState("formulario");

  const donacionesSecciones = useMemo(
    () => [
      {
        id: "formulario",
        label: "Tu donación",
        subtitle: "Formulario seguro",
        icon: <HandHeart className="w-4 h-4" />,
      },
      {
        id: "donde-va",
        label: "¿Dónde va?",
        subtitle: "Transparencia total",
        icon: <ShieldCheck className="w-4 h-4" />,
      },
      {
        id: "beneficios",
        label: "Beneficios",
        subtitle: "Para apoyadores",
        icon: <Sparkles className="w-4 h-4" />,
      },
    ],
    []
  );

  const montoSugerencias = useMemo(() => [2000, 5000, 10000, 20000], []);

  const estadoParametro = searchParams.get("status");
  const estadoMensaje = useMemo(() => {
    if (!estadoParametro) return null;
    if (estadoParametro === "pending") {
      return {
        tipo: "info" as const,
        texto: "Tu pago está pendiente. Podés reintentar desde tu historial en MercadoPago o generar un nuevo enlace.",
      };
    }
    if (estadoParametro === "error") {
      return {
        tipo: "error" as const,
        texto: "El pago fue cancelado o rechazado. Intentá nuevamente cuando quieras.",
      };
    }
    return null;
  }, [estadoParametro]);

  const handleMontoRapido = (valor: number) => {
    setMonto(valor);
    setError(null);
  };

  const getPreferenceIdForPayment = useCallback(async (): Promise<string> => {
    setError(null);
    setLoading(true);

    const montoNumerico = Number(monto);
    if (!Number.isFinite(montoNumerico) || montoNumerico < 500) {
      setError("El monto mínimo es $500");
      throw new Error("Monto inválido");
    }

    const emailLimpio = donanteEmail.trim();
    const nombreLimpio = donanteNombre.trim();
    const mensajeLimpio = mensaje.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLimpio)) {
      setError("Email inválido");
      throw new Error("Email inválido");
    }

    try {
      const resultado = await apiService.crearDonacion({
        monto: montoNumerico,
        donanteEmail: emailLimpio,
        donanteNombre: nombreLimpio || undefined,
        mensaje: mensajeLimpio || undefined,
      });

      setUltimoResultado(resultado);
      return resultado.preferenceId;
    } catch (err: any) {
      console.error("[Donaciones] Error obteniendo preferenceId:", err);
      setUltimoResultado(null);
      setError(err?.mensaje || err?.message || "No pudimos crear la donación");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [donanteEmail, donanteNombre, mensaje, monto]);

  useEffect(() => {
    // No necesitamos inicializar MercadoPago aquí
    // Solo generamos el link de pago que abre en MercadoPago directamente
    return () => {
      // Cleanup
    };
  }, []);

  const handlePaymentButtonClick = async () => {
    try {
      await getPreferenceIdForPayment();
      
      // El ultimoResultado ya tiene el linkPago y se mostrará en la UI
      // El usuario podrá hacer clic en el botón para abrir MercadoPago
    } catch (error) {
      console.error("[Donaciones] Error generando link de pago:", error);
    }
  };

  return (
    <div className="bg-white text-gray-900">
      {/* Mobile Bottom Sheet Navigation */}
      <BottomSheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Navegación"
        subtitle="Secciones"
      >
        <div className="space-y-1">
          {donacionesSecciones.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                setIsMobileMenuOpen(false);
                setTimeout(() => {
                  document.getElementById(`section-${section.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 300);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? "bg-rose-50 text-rose-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Main Content */}
      <main className="md:ml-14">
        {/* Header Section with Full Gradient */}
        <div className="w-full bg-gradient-to-b from-purple-200/50 via-purple-50/30 to-white">
          <div className="w-full px-5 sm:px-6 lg:px-8 xl:px-10 py-12 sm:py-16 lg:py-20 xl:py-24">
            <div className="mb-8 sm:mb-10 lg:mb-12 xl:mb-16 grid gap-6 sm:gap-8 lg:gap-10 xl:gap-12 items-center lg:grid-cols-[1.1fr,0.9fr]">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 lg:mb-5 xl:mb-6 text-gray-900">
                  Apoyá a JJSecure VPN
                </h1>
                <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-700 max-w-4xl mx-auto lg:mx-0">
                  Tu donación nos ayuda a seguir manteniendo servidores estables, mejorar la infraestructura y crear nuevas funciones para toda la comunidad.
                </p>
              </div>
              <div className="flex items-center justify-center">
                <Lottie
                  animationData={thankYouAnimation as unknown as object}
                  loop
                  autoplay
                  className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 xl:px-10 py-12 sm:py-16 lg:py-20 xl:py-24 pb-24 md:pb-12">

          {/* Status Message */}
          {estadoMensaje && (
            <div
              className={`mb-6 sm:mb-8 lg:mb-10 xl:mb-12 flex items-start gap-3 rounded-lg px-3 sm:px-4 lg:px-5 xl:px-6 py-3 sm:py-4 lg:py-5 xl:py-6 border backdrop-blur-sm ${
                estadoMensaje.tipo === "error"
                  ? "bg-rose-50 border-rose-300 text-rose-700"
                  : "bg-blue-50 border-blue-300 text-blue-700"
              }`}
            >
              {estadoMensaje.tipo === "error" ? (
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 mt-0.5 flex-shrink-0" />
              ) : (
                <Info className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 mt-0.5 flex-shrink-0" />
              )}
              <span className="text-xs sm:text-sm lg:text-base xl:text-lg">{estadoMensaje.texto}</span>
            </div>
          )}

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 xl:gap-10">
            {/* Left Column: Form */}
            <div className="lg:col-span-2 space-y-5 sm:space-y-6 lg:space-y-8 xl:space-y-10">
              {/* Donation Form */}
              <div className="rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-5 sm:p-6 lg:p-8 xl:p-10">
                <h2 className="text-xs sm:text-sm lg:text-base xl:text-lg font-semibold text-gray-900 uppercase tracking-wider mb-5 sm:mb-6 lg:mb-7 xl:mb-8">
                  Información de la Donación
                </h2>

                <form
                  onSubmit={(event: FormEvent) => {
                    event.preventDefault();
                    handlePaymentButtonClick();
                  }}
                  className="space-y-5 sm:space-y-6 lg:space-y-8 xl:space-y-10"
                >
                  {/* Monto Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-5 xl:mb-6">
                      <label className="block text-xs sm:text-sm lg:text-base xl:text-lg font-medium text-gray-900">
                        Monto de la donación
                      </label>
                      <span className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-600">Mínimo $500</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm font-medium">
                        $
                      </span>
                      <input
                        type="number"
                        min={500}
                        max={1000000}
                        step={100}
                        value={monto}
                        onChange={(e) => setMonto(Number(e.target.value))}
                        className="w-full bg-white border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg pl-8 pr-4 py-2.5 sm:py-3 lg:py-4 xl:py-5 text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold transition-colors outline-none text-gray-900"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3 sm:mt-4 lg:mt-5 xl:mt-6">
                      {montoSugerencias.map((valor) => (
                        <button
                          key={valor}
                          type="button"
                          onClick={() => handleMontoRapido(valor)}
                          className={`px-3 sm:px-4 lg:px-5 xl:px-6 py-2 sm:py-3 lg:py-4 xl:py-5 rounded-lg border text-[10px] sm:text-xs lg:text-sm xl:text-base font-medium transition-all ${
                            monto === valor
                              ? "border-rose-400 bg-rose-50 text-rose-700"
                              : "border-gray-300 bg-gray-50 hover:border-rose-400 text-gray-700"
                          }`}
                        >
                          ${valor.toLocaleString("es-AR")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nombre */}
                  <div>
                    <label className="block text-xs sm:text-sm lg:text-base xl:text-lg font-medium text-gray-900 mb-2 sm:mb-3 lg:mb-4 xl:mb-5">
                      Nombre (opcional)
                    </label>
                    <input
                      type="text"
                      value={donanteNombre}
                      onChange={(e) => setDonanteNombre(e.target.value)}
                      placeholder="Ej: María López"
                      className="w-full bg-white border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg px-4 py-2.5 sm:py-3 lg:py-4 xl:py-5 text-xs sm:text-sm lg:text-base xl:text-lg transition-colors outline-none text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs sm:text-sm lg:text-base xl:text-lg font-medium text-gray-900 mb-2 sm:mb-3 lg:mb-4 xl:mb-5">
                      Email (para confirmación)
                    </label>
                    <input
                      type="email"
                      value={donanteEmail}
                      onChange={(e) => setDonanteEmail(e.target.value)}
                      placeholder="Ej: nombre@correo.com"
                      required
                      className="w-full bg-white border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg px-4 py-2.5 sm:py-3 lg:py-4 xl:py-5 text-xs sm:text-sm lg:text-base xl:text-lg transition-colors outline-none text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  {/* Mensaje */}
                  <div>
                    <label className="block text-xs sm:text-sm lg:text-base xl:text-lg font-medium text-gray-900 mb-2 sm:mb-3 lg:mb-4 xl:mb-5">
                      Mensaje (opcional)
                    </label>
                    <textarea
                      value={mensaje}
                      onChange={(e) => setMensaje(e.target.value)}
                      placeholder="Contanos por qué decidiste apoyar el proyecto"
                      rows={4}
                      className="w-full bg-white border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg px-4 py-2.5 sm:py-3 lg:py-4 xl:py-5 text-xs sm:text-sm lg:text-base xl:text-lg transition-colors outline-none resize-none text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-start gap-3 rounded-lg bg-rose-50 border border-rose-300 p-3 sm:p-4 lg:p-5 xl:p-6">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-rose-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-rose-700">{error}</p>
                    </div>
                  )}

                  {/* Loading Indicator */}
                  {loading && (
                    <div className="flex items-center justify-center gap-2 text-xs sm:text-sm lg:text-base xl:text-lg text-gray-600 py-1 sm:py-2 lg:py-3 xl:py-4">
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 animate-spin" />
                      Generando link de pago...
                    </div>
                  )}

                  {/* Payment Success - Show Link */}
                  {ultimoResultado && (
                    <div className="bg-emerald-50 border border-emerald-300 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 xl:p-8 space-y-3 sm:space-y-4 lg:space-y-5 xl:space-y-6">
                      <div className="flex justify-center mb-3 sm:mb-4 lg:mb-5 xl:mb-6">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 xl:w-40 xl:h-40 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-300">
                          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20 text-emerald-600" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-700 text-xs sm:text-sm lg:text-base xl:text-lg font-medium">
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                        Tu donación está lista para realizarse
                      </div>
                      
                      <a
                        href={ultimoResultado.linkPago}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg px-4 py-2.5 sm:py-3 lg:py-4 xl:py-5 text-xs sm:text-sm lg:text-base xl:text-lg transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                        Ir a MercadoPago
                      </a>

                      <p className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-700">
                        Se abrirá MercadoPago en una nueva ventana donde podrás completar el pago.
                      </p>
                    </div>
                  )}

                  {/* Main Payment Button */}
                  {!ultimoResultado && (
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-4 py-2.5 sm:py-3 lg:py-4 xl:py-5 text-xs sm:text-sm lg:text-base xl:text-lg transition-colors"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 animate-spin" />
                          Generando link...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                          Generar link de pago
                        </>
                      )}
                    </button>
                  )}
                </form>
              </div>

              {/* Security & Benefits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 lg:gap-8 xl:gap-10">
                {/* What we use donations for */}
                <div className="rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-5 sm:p-6 lg:p-8 xl:p-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-emerald-600" />
                    </div>
                    <h3 className="text-xs sm:text-sm lg:text-base xl:text-lg font-semibold text-gray-900 uppercase tracking-wider">
                      ¿Dónde usamos las donaciones?
                    </h3>
                  </div>
                  <ul className="space-y-2 text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-700">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                      <span>Infraestructura y servidores con protección anti-DDoS</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                      <span>Desarrollo de nuevas funciones y mejoras</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                      <span>Monitoreo 24/7 y soporte premium</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                      <span>Ensayos con nuevas regiones y nodos</span>
                    </li>
                  </ul>
                </div>

                {/* Benefits */}
                <div className="rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-5 sm:p-6 lg:p-8 xl:p-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11 rounded-lg bg-rose-100 border border-rose-300 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-rose-600" />
                    </div>
                    <h3 className="text-xs sm:text-sm lg:text-base xl:text-lg font-semibold text-gray-900 uppercase tracking-wider">
                      Beneficios de apoyar
                    </h3>
                  </div>
                  <ul className="space-y-2 text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-700">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                      <span>Acceso prioritario a nuevas betas y pruebas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                      <span>Invitaciones a focus group con el equipo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                      <span>Reconocimiento en nuestro muro de sponsors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                      <span>Sé parte del crecimiento de JJSecure</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column: Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-5 sm:space-y-6 lg:space-y-8 xl:space-y-10">
                {/* Donation Summary */}
                <div className="rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-slate-900/90 via-gray-900/90 to-slate-800/90 p-5 sm:p-6 lg:p-8 xl:p-10 text-white">
                  <h3 className="text-xs sm:text-sm lg:text-base xl:text-lg font-semibold text-white uppercase tracking-wider mb-6">
                    Resumen de donación
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-400">Monto:</span>
                      <span className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-rose-400">
                        ${monto.toLocaleString("es-AR")}
                      </span>
                    </div>

                    {ultimoResultado && (
                      <>
                        <div className="h-px bg-white/20" />
                        <div className="space-y-2 bg-white/10 border border-white/20 rounded-lg p-3">
                          <p className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
                            Donación confirmada
                          </p>
                          <p className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-300">
                            ID: <span className="text-white font-mono text-[10px] sm:text-xs lg:text-sm xl:text-base">{ultimoResultado.donacion.id}</span>
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Confirmation Message */}
                {ultimoResultado && (
                  <div className="rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-5 sm:p-6 lg:p-8 xl:p-10">
                    <h3 className="text-xs sm:text-sm lg:text-base xl:text-lg font-semibold text-gray-900 mb-3">¿Preguntas?</h3>
                    <p className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-700 leading-relaxed">
                      Cuando completes el pago te enviaremos un correo a{" "}
                      <span className="text-gray-900 font-medium">
                        {ultimoResultado.donacion.donante_email || donanteEmail}
                      </span>{" "}
                      con nuestro agradecimiento.
                    </p>
                  </div>
                )}

                {/* Info Card */}
                <div className="rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-5 sm:p-6 lg:p-8 xl:p-10">
                  <p className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-gray-700 leading-relaxed">
                    🔒 <span className="text-gray-900 font-medium">Seguro y privado.</span> Procesado mediante MercadoPago con encriptación end-to-end.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DonacionesPage;
