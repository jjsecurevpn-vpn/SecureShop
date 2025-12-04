import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PlanRevendedor, CompraRevendedorRequest } from "../types";
import { Clock, Check, AlertCircle } from "lucide-react";
import CuponInput from "../components/CuponInput";
import { apiService, ValidacionCupon } from "../services/api.service";
import { mercadoPagoService } from "../services/mercadopago.service";

/**
 * CheckoutRevendedorPage - Página de checkout elegante y minimalista para revendedores
 * Estilo similar a Stripe/Vercel pero con colores JJSecure (violet/neutral)
 */
const CheckoutRevendedorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const nombreInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [plan, setPlan] = useState<PlanRevendedor | null>(null);
  const [error, setError] = useState<string>("");
  const [cuponData, setCuponData] = useState<ValidacionCupon["cupon"] | null>(
    null
  );
  const [descuentoAplicado, setDescuentoAplicado] = useState(0);

  const planId = parseInt(searchParams.get("planId") || "0");

  // Cargar el plan al montar
  useEffect(() => {
    const loadPlan = async () => {
      try {
        const planes = await apiService.obtenerPlanesRevendedores();
        const foundPlan = planes.find((p) => p.id === planId);
        if (foundPlan) {
          setPlan(foundPlan);
        } else {
          navigate("/revendedores");
        }
      } catch (error) {
        console.error("[CheckoutRevendedorPage] Error cargando plan:", error);
        navigate("/revendedores");
      }
    };

    if (planId > 0) {
      loadPlan();
    }
  }, [planId, navigate]);

  const handleCuponValidado = (
    descuento: number,
    cupon: ValidacionCupon["cupon"]
  ) => {
    setCuponData(cupon);
    setDescuentoAplicado(descuento);
  };

  const handleCuponRemovido = () => {
    setCuponData(null);
    setDescuentoAplicado(0);
  };

  // Función que MercadoPago va a llamar para obtener el preferenceId
  // Usamos useCallback para que siempre tenga acceso al estado actual de cuponData
  const getPreferenceIdForPayment = useCallback(async (): Promise<string> => {
    setError("");

    if (!plan) {
      const errorMsg = "Error al procesar el pago";
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    const nombre = nombreInputRef.current?.value || "";
    const email = emailInputRef.current?.value || "";

    if (!nombre.trim()) {
      const errorMsg = "Por favor ingresa tu nombre";
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      const errorMsg = "Email inválido";
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const compraData: CompraRevendedorRequest = {
        planRevendedorId: plan.id,
        clienteNombre: nombre,
        clienteEmail: email,
        codigoCupon: cuponData?.codigo,
      };

      const response = await apiService.comprarPlanRevendedor(compraData);

      // El servidor retorna linkPago con pref_id en la URL
      const linkPago = response.linkPago;
      if (!linkPago) {
        throw new Error("No se obtuvo linkPago del servidor");
      }

      // Extraer pref_id de la URL
      const urlParams = new URL(linkPago).searchParams;
      const prefId = urlParams.get("pref_id");

      if (!prefId) {
        throw new Error("No se pudo extraer pref_id del linkPago");
      }

      return prefId;
    } catch (err: any) {
      console.error("[CheckoutRevendedorPage] Error:", err);
      const errorMsg =
        err.message || "Error al procesar el pago. Intenta nuevamente.";
      setError(errorMsg);
      throw err;
    }
  }, [cuponData, plan]);

  // Inicializar MercadoPago y crear botón cuando la página carga
  useEffect(() => {
    const init = async () => {
      try {
        console.log("[CheckoutRevendedorPage] Inicializando MercadoPago...");
        await mercadoPagoService.initialize();
        console.log(
          "[CheckoutRevendedorPage] MercadoPago inicializado exitosamente"
        );

        if (plan) {
          console.log(
            "[CheckoutRevendedorPage] Plan disponible, creando botón de MercadoPago..."
          );

          // Crear el botón con getPreferenceIdForPayment como callback
          await mercadoPagoService.createButton(
            "wallet_container_revendedor",
            getPreferenceIdForPayment
          );
          console.log("[CheckoutRevendedorPage] ✅ Botón de MercadoPago creado");
        }
      } catch (error) {
        console.error(
          "[CheckoutRevendedorPage] Error inicializando MercadoPago:",
          error
        );
      }
    };

    init();
  }, [plan, getPreferenceIdForPayment]);

  if (!plan) {
    return (
      <div className="min-h-screen bg-white pt-16 md:pt-14 flex items-center justify-center">
        <div className="text-gray-600">Cargando plan...</div>
      </div>
    );
  }

  const precioFinal = plan.precio - descuentoAplicado;

  return (
    <div className="min-h-screen bg-white pt-16 md:pt-14">
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
          {/* Left Column - Formulario */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-2">
                Información Personal
              </h1>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600">
                Completa tus datos para finalizar la compra
              </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Nombre completo
                </label>
                <input
                  ref={nombreInputRef}
                  type="text"
                  defaultValue=""
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors hover:border-gray-300"
                  placeholder="Juan Pérez"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email
                </label>
                <input
                  ref={emailInputRef}
                  type="email"
                  defaultValue=""
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors hover:border-gray-300"
                  placeholder="tu@email.com"
                />
              </div>

              {/* Cupón */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Código de descuento (opcional)
                </label>
                <CuponInput
                  planId={plan.id}
                  precioPlan={plan.precio}
                  onCuponValidado={handleCuponValidado}
                  onCuponRemovido={handleCuponRemovido}
                  cuponActual={cuponData}
                  descuentoActual={descuentoAplicado}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-rose-50 border border-rose-300 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-rose-700 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-700">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Resumen (Sticky) */}
          <div className="md:sticky md:top-32 h-fit space-y-6">
            {/* Plan Card */}
            <div className="bg-gradient-to-br from-slate-900/90 via-gray-900/90 to-slate-800/90 rounded-lg p-5 sm:p-6 lg:p-8 xl:p-10 space-y-6 text-white">
              {/* Plan Info */}
              <div>
                <div className="text-sm text-gray-400 mb-2">Plan seleccionado</div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-1">
                  {plan.nombre}
                </h2>
                <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-400">
                  {plan.account_type === "credit"
                    ? `${plan.max_users} créditos`
                    : `${plan.max_users} usuarios`}
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-white/20" />

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs sm:text-sm lg:text-base xl:text-lg">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">
                    ${plan.precio.toLocaleString("es-AR")}
                  </span>
                </div>

                {descuentoAplicado > 0 && (
                  <div className="flex justify-between items-center text-xs sm:text-sm lg:text-base xl:text-lg text-emerald-400">
                    <span>Descuento ({cuponData?.codigo})</span>
                    <span>-${descuentoAplicado.toLocaleString("es-AR")}</span>
                  </div>
                )}

                <div className="border-t border-white/20 pt-3 flex justify-between items-center">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-3xl font-bold text-indigo-400">
                    ${precioFinal.toLocaleString("es-AR")}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/20" />

              {/* Plan Details */}
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-white">
                      {plan.account_type === "credit"
                        ? `${plan.max_users} créditos`
                        : `${plan.max_users} usuarios`}
                    </div>
                    <div className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-400">
                      {plan.account_type === "credit"
                        ? "Créditos de acceso"
                        : "30 días de validez"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-white">
                      Acceso inmediato
                    </div>
                    <div className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-400">
                      Recibirás tus credenciales en el email
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MercadoPago Button Section */}
            <div className="space-y-3">
              {/* MercadoPago Wallet Container - El botón se renderiza aquí automáticamente */}
              <div id="wallet_container_revendedor" className="min-h-[56px]" />
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm lg:text-base xl:text-lg text-gray-700 pt-4 border-t border-gray-200">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-indigo-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Pago 100% seguro con MercadoPago</span>
            </div>

            {/* Back Button */}
            <button
              onClick={() => navigate("/revendedores")}
              className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium rounded-lg transition-colors"
            >
              Volver a planes
            </button>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutRevendedorPage;
