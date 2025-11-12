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
import { apiService } from "../services/api.service";
import { Donacion } from "../types";
import { useSearchParams } from "react-router-dom";
import NavigationSidebar from "../components/NavigationSidebar";
import BottomSheet from "../components/BottomSheet";

/**
 * DonacionesPage - Página de donaciones refinada
 * Estilo consistente con CheckoutPage y demás páginas del proyecto
 * Incluye NavigationSidebar y estructura mejorada
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
    <div className="min-h-screen bg-[#181818] text-neutral-100">
      {/* Navigation Sidebar */}
      <NavigationSidebar
        title="Donaciones"
        subtitle="Apoyá el proyecto"
        sections={donacionesSecciones}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        sectionIdPrefix="section-"
      />

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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? "bg-rose-900/20 text-rose-300"
                  : "text-neutral-400 hover:bg-neutral-800"
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Main Content */}
      <main className="md:ml-[312px]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-12">
          {/* Header Section */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 mb-4">
              <HandHeart className="w-6 h-6 text-rose-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-neutral-100">
              Apoyá a JJSecure VPN
            </h1>
            <p className="text-neutral-400 text-lg max-w-2xl">
              Tu donación nos ayuda a seguir manteniendo servidores estables, mejorar la infraestructura y crear nuevas funciones para toda la comunidad.
            </p>
          </div>

          {/* Status Message */}
          {estadoMensaje && (
            <div
              className={`mb-8 flex items-start gap-3 rounded-xl px-4 py-4 border backdrop-blur-sm ${
                estadoMensaje.tipo === "error"
                  ? "bg-rose-500/10 border-rose-500/40 text-rose-200"
                  : "bg-blue-500/10 border-blue-500/30 text-blue-100"
              }`}
            >
              {estadoMensaje.tipo === "error" ? (
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              ) : (
                <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
              )}
              <span className="text-sm">{estadoMensaje.texto}</span>
            </div>
          )}

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Donation Form */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-xl shadow-black/20">
                <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-6">
                  Información de la Donación
                </h2>

                <form
                  onSubmit={(event: FormEvent) => {
                    event.preventDefault();
                    handlePaymentButtonClick();
                  }}
                  className="space-y-6"
                >
                  {/* Monto Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-neutral-300">
                        Monto de la donación
                      </label>
                      <span className="text-xs text-neutral-500">Mínimo $500</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-medium">
                        $
                      </span>
                      <input
                        type="number"
                        min={500}
                        max={1000000}
                        step={100}
                        value={monto}
                        onChange={(e) => setMonto(Number(e.target.value))}
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 rounded-lg pl-8 pr-4 py-3 text-lg font-semibold transition-colors outline-none"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {montoSugerencias.map((valor) => (
                        <button
                          key={valor}
                          type="button"
                          onClick={() => handleMontoRapido(valor)}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                            monto === valor
                              ? "border-rose-500/80 bg-rose-500/15 text-rose-300"
                              : "border-neutral-800 bg-neutral-800/50 hover:border-rose-500/40 text-neutral-300"
                          }`}
                        >
                          ${valor.toLocaleString("es-AR")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Nombre (opcional)
                    </label>
                    <input
                      type="text"
                      value={donanteNombre}
                      onChange={(e) => setDonanteNombre(e.target.value)}
                      placeholder="Ej: María López"
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 rounded-lg px-4 py-3 text-sm transition-colors outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Email (para confirmación)
                    </label>
                    <input
                      type="email"
                      value={donanteEmail}
                      onChange={(e) => setDonanteEmail(e.target.value)}
                      placeholder="Ej: nombre@correo.com"
                      required
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 rounded-lg px-4 py-3 text-sm transition-colors outline-none"
                    />
                  </div>

                  {/* Mensaje */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Mensaje (opcional)
                    </label>
                    <textarea
                      value={mensaje}
                      onChange={(e) => setMensaje(e.target.value)}
                      placeholder="Contanos por qué decidiste apoyar el proyecto"
                      rows={4}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 rounded-lg px-4 py-3 text-sm transition-colors outline-none resize-none"
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-start gap-3 rounded-lg bg-rose-500/15 border border-rose-500/40 p-4">
                      <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-rose-200">{error}</p>
                    </div>
                  )}

                  {/* Loading Indicator */}
                  {loading && (
                    <div className="flex items-center justify-center gap-2 text-sm text-neutral-400 py-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generando link de pago...
                    </div>
                  )}

                  {/* Payment Success - Show Link */}
                  {ultimoResultado && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 space-y-4">
                      <div className="flex items-center gap-2 text-emerald-200 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Tu donación está lista para realizarse
                      </div>
                      
                      <a
                        href={ultimoResultado.linkPago}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg px-4 py-3 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ir a MercadoPago
                      </a>

                      <p className="text-xs text-neutral-400">
                        Se abrirá MercadoPago en una nueva ventana donde podrás completar el pago.
                      </p>
                    </div>
                  )}

                  {/* Main Payment Button */}
                  {!ultimoResultado && (
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-4 py-3 transition-colors"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generando link...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generar link de pago
                        </>
                      )}
                    </button>
                  )}
                </form>
              </div>

              {/* Security & Benefits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* What we use donations for */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider">
                      ¿Dónde usamos las donaciones?
                    </h3>
                  </div>
                  <ul className="space-y-2 text-xs text-neutral-400">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 text-rose-400 mt-0.5 flex-shrink-0" />
                      <span>Infraestructura y servidores con protección anti-DDoS</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 text-rose-400 mt-0.5 flex-shrink-0" />
                      <span>Desarrollo de nuevas funciones y mejoras</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 text-rose-400 mt-0.5 flex-shrink-0" />
                      <span>Monitoreo 24/7 y soporte premium</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 text-rose-400 mt-0.5 flex-shrink-0" />
                      <span>Ensayos con nuevas regiones y nodos</span>
                    </li>
                  </ul>
                </div>

                {/* Benefits */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-rose-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider">
                      Beneficios de apoyar
                    </h3>
                  </div>
                  <ul className="space-y-2 text-xs text-neutral-400">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 text-rose-400 mt-0.5 flex-shrink-0" />
                      <span>Acceso prioritario a nuevas betas y pruebas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 text-rose-400 mt-0.5 flex-shrink-0" />
                      <span>Invitaciones a focus group con el equipo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 text-rose-400 mt-0.5 flex-shrink-0" />
                      <span>Reconocimiento en nuestro muro de sponsors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 text-rose-400 mt-0.5 flex-shrink-0" />
                      <span>Sé parte del crecimiento de JJSecure</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column: Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Donation Summary */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider mb-6">
                    Resumen de donación
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-400">Monto:</span>
                      <span className="text-lg font-semibold text-rose-400">
                        ${monto.toLocaleString("es-AR")}
                      </span>
                    </div>

                    {ultimoResultado && (
                      <>
                        <div className="h-px bg-neutral-800" />
                        <div className="space-y-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                          <p className="text-xs text-emerald-200 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            Donación confirmada
                          </p>
                          <p className="text-xs text-neutral-400">
                            ID: <span className="text-neutral-300 font-mono text-xs">{ultimoResultado.donacion.id}</span>
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Confirmation Message */}
                {ultimoResultado && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                    <h3 className="text-sm font-semibold text-neutral-200 mb-3">¿Preguntas?</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Cuando completes el pago te enviaremos un correo a{" "}
                      <span className="text-neutral-200 font-medium">
                        {ultimoResultado.donacion.donante_email || donanteEmail}
                      </span>{" "}
                      con nuestro agradecimiento.
                    </p>
                  </div>
                )}

                {/* Info Card */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    🔒 <span className="text-neutral-300 font-medium">Seguro y privado.</span> Procesado mediante MercadoPago con encriptación end-to-end.
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
