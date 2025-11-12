import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Plan } from "../types";
import { Clock, Check, AlertCircle } from "lucide-react";
import CheckoutForm, { CheckoutFormRef } from "../components/CheckoutForm";
import { apiService } from "../services/api.service";
import { mercadoPagoService } from "../services/mercadopago.service";

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

  // Función callback memoizada
  // (Removida - ahora el botón se crea on-demand con preferenceId)

  const handleCuponChange = (descuento: number) => {
    setDescuentoVisual(descuento);
  };

  // Función que MercadoPago va a llamar para obtener el preferenceId
  const getPreferenceIdForPayment = async (): Promise<string> => {
    console.log('[CheckoutPage] getPreferenceIdForPayment llamado');
    setError("");

    if (!plan || !formRef.current) {
      const errorMsg = "Error al procesar el pago";
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    const nombre = formRef.current.getNombre();
    const email = formRef.current.getEmail();

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
        throw new Error('No se obtuvo linkPago del servidor');
      }

      // Extraer pref_id de la URL
      const urlParams = new URL(linkPago).searchParams;
      const prefId = urlParams.get('pref_id');
      
      if (!prefId) {
        console.error('[CheckoutPage] No se pudo extraer pref_id de:', linkPago);
        throw new Error('No se pudo extraer preference ID del enlace de pago');
      }

      console.log('[CheckoutPage] Preference ID extraído:', prefId);
      return prefId;
    } catch (err: any) {
      console.error("[CheckoutPage] Error obteniendo preferenceId:", err);
      const errorMsg = err?.message || "Error al procesar el pago. Por favor intenta nuevamente.";
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
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="text-neutral-400">Cargando...</div>
      </div>
    );
  }

  const precioFinal = plan.precio - descuentoVisual;
  const precioPorDia = (precioFinal / plan.dias).toFixed(0);

  return (
    <div className="min-h-screen bg-[#181818] pt-16 md:pt-14">
      {/* Header global ya existe en App.tsx, no se necesita aquí */}
      
      {/* Main Content - Respeta sidebar global (56px en reposo) */}
      <main className="md:ml-14">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-8 md:pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            
            {/* Left: Formulario */}
            <div className="md:col-span-2 space-y-8">
              {/* Sección: Información Personal */}
              <section>
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-neutral-200 uppercase tracking-tight">
                    Información Personal
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">Datos necesarios para procesar tu compra</p>
                </div>

                {error && (
                  <div className="mb-4 flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                <CheckoutForm
                  ref={formRef}
                  planId={plan.id}
                  planPrecio={plan.precio}
                  loading={false}
                  onCuponChange={handleCuponChange}
                />
              </section>
            </div>

            {/* Right: Resumen y Botón */}
            <div className="md:col-span-1">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 sticky top-24">
                {/* Plan Header */}
                <div className="mb-6 pb-6 border-b border-neutral-800">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-tight mb-2">
                    Plan Seleccionado
                  </p>
                  <h3 className="text-lg font-semibold text-neutral-100">{plan.nombre}</h3>
                  <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-violet-400" />
                    {plan.dias} días de acceso
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6 pb-6 border-b border-neutral-800">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-neutral-300">{plan.connection_limit} dispositivo{plan.connection_limit !== 1 ? "s" : ""} simultáneo{plan.connection_limit !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-neutral-300">Velocidad ilimitada</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-neutral-300">Activación instantánea</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-neutral-300">Soporte 24/7</span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-neutral-500">Subtotal</span>
                    <span className="text-sm text-neutral-200 font-medium">
                      ${plan.precio.toLocaleString("es-AR")}
                    </span>
                  </div>
                  {descuentoVisual > 0 && (
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-emerald-400">Descuento</span>
                      <span className="text-sm text-emerald-400 font-medium">
                        -${descuentoVisual.toLocaleString("es-AR")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-2 border-t border-neutral-700">
                    <span className="text-xs font-semibold text-neutral-200">Total</span>
                    <span className="text-lg font-semibold text-violet-400">
                      ${precioFinal.toLocaleString("es-AR")}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 text-right pt-2">
                    ${precioPorDia}/día
                  </p>
                </div>

                {/* MercadoPago Button Container */}
                <div id="mp-wallet-container-unique" className="mb-4 min-h-12 w-full" />
                
                {/* Fallback Button if MercadoPago doesn't load */}
                <button
                  onClick={handlePaymentButtonClick}
                  disabled={processingPayment}
                  className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 disabled:bg-neutral-600 text-white text-sm font-semibold rounded-md transition-colors hidden"
                  id="fallback-payment-button"
                >
                  {processingPayment ? 'Procesando...' : 'Ir a Pagar'}
                </button>
                <button
                  onClick={() => navigate("/planes")}
                  className="w-full py-2 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium rounded-md transition-colors"
                >
                  Volver a planes
                </button>

                {/* Security Info */}
                <p className="text-xs text-neutral-500 text-center mt-4 pt-4 border-t border-neutral-800">
                  Pago seguro con <span className="font-medium">MercadoPago</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
