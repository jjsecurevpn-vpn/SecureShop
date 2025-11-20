import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Plan } from "../../types";
import { CheckoutFormRef } from "../../components/CheckoutForm";
import { apiService } from "../../services/api.service";
import { mercadoPagoService } from "../../services/mercadopago.service";
import { HeaderSection } from "./components/HeaderSection";
import { FormSection } from "./components/FormSection";
import { PlanSummary } from "./components/PlanSummary";
import { PaymentSection } from "./components/PaymentSection";
import { CHECKOUT_MESSAGES } from "./constants";
import { validarEmail, validarNombre } from "./utils";

/**
 * CheckoutPage - Página de checkout elegante e minimalista
 * Estilo similar a Stripe/Vercel pero con colores JJSecure (violet/neutral)
 */
const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const formRef = useRef<CheckoutFormRef>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [descuentoVisual, setDescuentoVisual] = useState(0);
  const [error, setError] = useState<string>("");
  const [processingPayment, setProcessingPayment] = useState(false);

  const planId = parseInt(searchParams.get("planId") || "0");

  // Cargar el plan al montar
  useEffect(() => {
    const loadPlan = async () => {
      try {
        const planes = await apiService.obtenerPlanes();
        const foundPlan = planes.find((p) => p.id === planId);
        if (foundPlan) {
          setPlan(foundPlan);
        } else {
          navigate("/planes");
        }
      } catch (error) {
        console.error("[CheckoutPage] Error cargando plan:", error);
        navigate("/planes");
      }
    };

    if (planId > 0) {
      loadPlan();
    }
  }, [planId, navigate]);

  const handleCuponChange = (descuento: number) => {
    setDescuentoVisual(descuento);
  };

  // Función que MercadoPago va a llamar para obtener el preferenceId
  const getPreferenceIdForPayment = async (): Promise<string> => {
    console.log('[CheckoutPage] getPreferenceIdForPayment llamado');
    setError("");

    if (!plan || !formRef.current) {
      const errorMsg = CHECKOUT_MESSAGES.ERROR_PROCESSING_PAYMENT;
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    const nombre = formRef.current.getNombre();
    const email = formRef.current.getEmail();

    if (!validarNombre(nombre)) {
      const errorMsg = CHECKOUT_MESSAGES.ERROR_MISSING_NAME;
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    if (!validarEmail(email)) {
      const errorMsg = CHECKOUT_MESSAGES.ERROR_INVALID_EMAIL;
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      console.log('[CheckoutPage] Enviando datos de compra...');

      const compraData = {
        planId: plan.id,
        clienteNombre: nombre,
        clienteEmail: email,
        codigoCupon: formRef.current.getCuponData()?.codigo,
      };

      const response = await apiService.comprarPlan(compraData);
      console.log('[CheckoutPage] Respuesta del servidor:', response);

      // El servidor retorna linkPago con pref_id en la URL
      const linkPago = response.linkPago;
      if (!linkPago) {
        console.error('[CheckoutPage] Response completo:', JSON.stringify(response, null, 2));
        throw new Error(CHECKOUT_MESSAGES.ERROR_NO_LINK_PAGO);
      }

      // Extraer pref_id de la URL
      const urlParams = new URL(linkPago).searchParams;
      const prefId = urlParams.get('pref_id');

      if (!prefId) {
        console.error('[CheckoutPage] No se pudo extraer pref_id de:', linkPago);
        throw new Error(CHECKOUT_MESSAGES.ERROR_NO_PREFERENCE_ID);
      }

      console.log('[CheckoutPage] Preference ID extraído:', prefId);
      return prefId;
    } catch (err: any) {
      console.error("[CheckoutPage] Error obteniendo preferenceId:", err);
      const errorMsg = err?.message || CHECKOUT_MESSAGES.ERROR_PROCESSING_PAYMENT;
      setError(errorMsg);
      throw err;
    }
  };

  // Manejador del botón de pago (fallback)
  const handlePaymentButtonClick = async () => {
    setError("");
    setProcessingPayment(true);

    try {
      const preferenceId = await getPreferenceIdForPayment();
      console.log('[CheckoutPage] Preferencia obtenida, creando botón...');

      await mercadoPagoService.createButtonWithPreference(
        'mp-wallet-container-unique',
        preferenceId
      );

      setProcessingPayment(false);
    } catch (err: any) {
      console.error("[CheckoutPage] Error en handlePaymentButtonClick:", err);
      setProcessingPayment(false);
    }
  };

  // Inicializar MercadoPago y crear botón cuando la página carga
  useEffect(() => {
    const init = async () => {
      try {
        console.log('[CheckoutPage] Inicializando MercadoPago...');
        await mercadoPagoService.initialize();
        console.log('[CheckoutPage] MercadoPago inicializado exitosamente');

        if (plan) {
          console.log('[CheckoutPage] Plan disponible, creando botón de MercadoPago...');

          // Crear el botón con getPreferenceIdForPayment como callback
          await mercadoPagoService.createButton(
            'mp-wallet-container-unique',
            getPreferenceIdForPayment
          );
          console.log('[CheckoutPage] ✅ Botón de MercadoPago creado');
        }
      } catch (error) {
        console.error('[CheckoutPage] Error inicializando MercadoPago:', error);
        // Mostrar el botón fallback si hay error
        const fallbackBtn = document.getElementById('fallback-payment-button');
        if (fallbackBtn) {
          fallbackBtn.classList.remove('hidden');
        }
      }
    };

    init();
  }, [plan]);

  if (!plan) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">{CHECKOUT_MESSAGES.LOADING}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-16 md:pt-14">
      {/* Main Content - respeta el padding global del sidebar */}
      <main className="md:ml-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 md:py-12">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
            {/* Left Column - Formulario */}
            <div className="space-y-8">
              <HeaderSection />

              <FormSection
                error={error}
                formRef={formRef}
                planId={plan.id}
                planPrecio={plan.precio}
                onCuponChange={handleCuponChange}
              />
            </div>

            {/* Right Column - Resumen (Sticky) */}
            <div className="md:sticky md:top-32 h-fit space-y-6">
              <PlanSummary plan={plan} descuentoVisual={descuentoVisual} />

              <PaymentSection
                processingPayment={processingPayment}
                onPaymentButtonClick={handlePaymentButtonClick}
              />

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
                <span>{CHECKOUT_MESSAGES.SECURITY_BADGE}</span>
              </div>

              {/* Back Button */}
              <button
                onClick={() => navigate("/planes")}
                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium rounded-lg transition-colors"
              >
                {CHECKOUT_MESSAGES.BACK_BUTTON_TEXT}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;