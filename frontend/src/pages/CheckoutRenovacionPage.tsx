import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  Clock,
  Loader2,
  Mail,
  RefreshCw,
  Shield,
  User,
} from "lucide-react";
import { apiService } from "../services/api.service";
import { mercadoPagoService } from "../services/mercadopago.service";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CheckoutRenovacionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tipo = (searchParams.get("tipo") as "cliente" | "revendedor") || "cliente";
  const dias = parseInt(searchParams.get("dias") || "0", 10);
  const precio = parseInt(searchParams.get("precio") || "0", 10);
  const busqueda = searchParams.get("busqueda") || "";
  const username = searchParams.get("username") || busqueda;
  const planNombre = searchParams.get("planNombre") || "";
  const connectionActualParam = parseInt(searchParams.get("connectionActual") || "0", 10);
  const nuevoConnectionLimitParam = searchParams.get("nuevoConnectionLimit");
  const connectionDestino = nuevoConnectionLimitParam
    ? parseInt(nuevoConnectionLimitParam, 10)
    : connectionActualParam;
  const tipoRenovacionParam = searchParams.get("tipoRenovacion");
  const tipoRenovacion: "validity" | "credit" =
    tipoRenovacionParam === "credit" || tipoRenovacionParam === "validity"
      ? tipoRenovacionParam
      : "validity";
  const cantidadSeleccionada = parseInt(
    searchParams.get("cantidadSeleccionada") || searchParams.get("cantidad") || "0",
    10
  ) || undefined;
  const precioOriginalParam =
    searchParams.get("precioOriginal") ||
    searchParams.get("precioBase") ||
    searchParams.get("precioSinDescuento");
  const descuentoParam = searchParams.get("descuento") || searchParams.get("descuentoAplicado");
  const codigoCupon = searchParams.get("codigoCupon") || undefined;
  const cuponIdParam = searchParams.get("cuponId");
  const cuponId = cuponIdParam ? parseInt(cuponIdParam, 10) : undefined;
  const planIdParam = searchParams.get("planId");
  const planId = planIdParam ? parseInt(planIdParam, 10) : undefined;
  const precioOriginal = parseInt(precioOriginalParam || "0", 10);
  const precioBase = precioOriginal > 0 ? precioOriginal : precio;
  const descuentoInicial = parseInt(descuentoParam || "0", 10);
  const descuentoFinal = descuentoInicial > 0 ? descuentoInicial : Math.max(0, precioBase - precio);

  const [nombre, setNombre] = useState(searchParams.get("nombre") || "");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [error, setError] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [mpFallbackVisible, setMpFallbackVisible] = useState(false);
  const [ultimoLinkPago, setUltimoLinkPago] = useState<string | null>(null);
  const [renovacionId, setRenovacionId] = useState<number | null>(null);

  const connectionActual = connectionActualParam || connectionDestino || 1;
  const hayCambioDispositivos =
    tipo === "cliente" && connectionDestino > 0 && connectionDestino !== connectionActual;

  const datosInvalidos = !busqueda || dias <= 0 || precio <= 0;

  useEffect(() => {
    if (datosInvalidos) {
      setError("No pudimos cargar los datos de la renovación. Vuelve a intentarlo.");
    }
  }, [datosInvalidos]);

  const precioPorDia = useMemo(() => {
    if (dias <= 0) {
      return 0;
    }
    return Math.round(precio / dias);
  }, [precio, dias]);

  const precioPorDiaBase = useMemo(() => {
    if (dias <= 0) {
      return 0;
    }
    return Math.round(precioBase / dias);
  }, [precioBase, dias]);

  const hayDescuento = descuentoFinal > 0;

  const createPreference = useCallback(async () => {
    setError("");
    const nombreTrim = nombre.trim();
    const emailTrim = email.trim();

    if (!nombreTrim) {
      const message = "Ingresa tu nombre";
      setError(message);
      throw new Error(message);
    }

    if (!emailTrim || !emailRegex.test(emailTrim)) {
      const message = "Ingresa un email válido";
      setError(message);
      throw new Error(message);
    }

    const basePayload = {
      busqueda,
      dias,
      clienteNombre: nombreTrim,
      clienteEmail: emailTrim,
    };

    try {
      const response =
        tipo === "revendedor"
          ? await apiService.procesarRenovacionRevendedor({
              ...basePayload,
              tipoRenovacion,
              cantidadSeleccionada,
              precio,
              precioOriginal: precioBase > 0 ? precioBase : undefined,
              codigoCupon,
              cuponId,
              descuentoAplicado: hayDescuento ? descuentoFinal : undefined,
              planId,
            })
          : await apiService.procesarRenovacionCliente({
              ...basePayload,
              precio,
              nuevoConnectionLimit: hayCambioDispositivos ? connectionDestino : undefined,
              precioOriginal: precioBase > 0 ? precioBase : undefined,
              codigoCupon,
              cuponId,
              descuentoAplicado: hayDescuento ? descuentoFinal : undefined,
              planId,
            });

      if (!response?.linkPago) {
        throw new Error("No se recibió el enlace de pago");
      }

      setUltimoLinkPago(response.linkPago);
      if (response.renovacion?.id) {
        setRenovacionId(response.renovacion.id);
      }

      const prefId = new URL(response.linkPago).searchParams.get("pref_id");
      if (!prefId) {
        throw new Error("No se pudo generar el identificador de pago");
      }

      return { prefId, linkPago: response.linkPago };
    } catch (err: any) {
      console.error("[CheckoutRenovacion] Error creando preferencia:", err);
      const mensaje = err?.mensaje || err?.message || "Error al generar el enlace de pago";
      setError(mensaje);
      throw err;
    }
  }, [
    busqueda,
    dias,
    email,
    hayCambioDispositivos,
    connectionDestino,
    nombre,
    precio,
    tipo,
    tipoRenovacion,
    cantidadSeleccionada,
    codigoCupon,
    cuponId,
    descuentoFinal,
    hayDescuento,
    planId,
    precioBase,
  ]);

  const getPreferenceId = useCallback(async () => {
    const { prefId } = await createPreference();
    return prefId;
  }, [createPreference]);

  const handleFallbackPayment = async () => {
    setProcessingPayment(true);
    try {
      const { linkPago } = await createPreference();
      window.location.href = linkPago;
    } catch {
      // El error ya se maneja en createPreference
    } finally {
      setProcessingPayment(false);
    }
  };

  useEffect(() => {
    if (datosInvalidos) {
      return;
    }

    let mounted = true;

    const initMercadoPago = async () => {
      try {
        await mercadoPagoService.initialize();
        await mercadoPagoService.createButton("mp-wallet-container-unique", getPreferenceId);
        if (mounted) {
          setMpFallbackVisible(false);
        }
      } catch (_err) {
        console.error("[CheckoutRenovacion] Error inicializando MercadoPago:", _err);
        if (mounted) {
          setMpFallbackVisible(true);
        }
      }
    };

    initMercadoPago();

    return () => {
      mounted = false;
    };
  }, [datosInvalidos, getPreferenceId]);

  if (datosInvalidos) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="w-16 h-16 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-rose-700" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-gray-900">No pudimos cargar tu renovación</h1>
          <p className="text-sm text-gray-600">
            Vuelve a la página de planes e inicia nuevamente el proceso de renovación.
          </p>
        </div>
        <button
          onClick={() => navigate("/planes")}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
        >
          Volver a planes
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-16 md:pt-14">
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 md:py-12">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
            {/* Left Column - Formulario */}
            <div className="space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif font-normal text-gray-900 mb-2">
                  Renovar tu cuenta
                </h1>
                <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600">
                  Completa tus datos para finalizar la renovación
                </p>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* Error */}
                {error && (
                  <div className="bg-rose-50 border border-rose-300 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-rose-700 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-rose-700">{error}</p>
                  </div>
                )}

                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-gray-400" />
                    <input
                      type="text"
                      value={nombre}
                      onChange={(event) => {
                        setNombre(event.target.value);
                        setError("");
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                      placeholder="Juan Pérez"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError("");
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <p className="text-gray-600 text-xs mt-2 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    Te enviaremos la confirmación de la renovación a este correo
                  </p>
                </div>
              </div>

              {/* Resumen de detalles */}
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-tight">
                        Usuario
                      </p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{username}</p>
                      {planNombre && (
                        <p className="text-xs text-gray-600 mt-1">Plan actual: {planNombre}</p>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-indigo-600" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-600 uppercase tracking-wide flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Días a agregar
                    </p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{dias} días</p>
                  </div>

                  {tipo === "cliente" && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-xs text-gray-600 uppercase tracking-wide flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" />
                        Dispositivos
                      </p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {connectionDestino || connectionActual}
                      </p>
                      {hayCambioDispositivos && (
                        <p className="text-[11px] text-indigo-700 mt-1">
                          Upgrade desde {connectionActual}
                        </p>
                      )}
                    </div>
                  )}

                  {tipo === "revendedor" && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-xs text-gray-600 uppercase tracking-wide">
                        Tipo
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{tipoRenovacion}</p>
                      {cantidadSeleccionada && (
                        <p className="text-[11px] text-gray-600 mt-1">
                          Cant: {cantidadSeleccionada}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {hayDescuento && (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-emerald-700 uppercase tracking-wide">Cupón aplicado</p>
                        {codigoCupon && (
                          <p className="text-sm font-semibold text-emerald-900 mt-0.5">{codigoCupon}</p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-emerald-700">
                        - ${descuentoFinal.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Resumen (Sticky) */}
            <div className="md:sticky md:top-32 h-fit space-y-6">
              {/* Plan Card */}
              <div className="bg-gradient-to-br from-purple-100 via-purple-50 to-white border border-purple-200 rounded-lg p-5 sm:p-6 lg:p-8 xl:p-10 space-y-6">
                {/* Info Header */}
                <div>
                  <div className="text-sm text-purple-600 mb-2">Resumen de renovación</div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif font-normal text-gray-900 mb-1">
                    Renovación de {dias} días
                  </h2>
                </div>

                {/* Divider */}
                <div className="border-t border-purple-200" />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs sm:text-sm lg:text-base xl:text-lg">
                    <span className="text-gray-600">Precio por día</span>
                    {hayDescuento ? (
                      <div className="text-right">
                        <span className="text-gray-900 font-medium">
                          ${precioPorDia.toLocaleString("es-AR")}
                        </span>
                        <span className="text-[11px] text-gray-500 line-through block">
                          ${precioPorDiaBase.toLocaleString("es-AR")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-900 font-medium">
                        ${precioPorDia.toLocaleString("es-AR")}
                      </span>
                    )}
                  </div>

                  {hayDescuento && (
                    <div className="flex justify-between items-center text-xs sm:text-sm lg:text-base xl:text-lg">
                      <span className="text-gray-600">Precio original</span>
                      <span className="text-gray-500 line-through">
                        ${precioBase.toLocaleString("es-AR")}
                      </span>
                    </div>
                  )}

                  {hayDescuento && (
                    <div className="flex justify-between items-center text-xs sm:text-sm lg:text-base xl:text-lg text-emerald-600">
                      <span>Descuento {codigoCupon ? `(${codigoCupon})` : ""}</span>
                      <span>- ${descuentoFinal.toLocaleString("es-AR")}</span>
                    </div>
                  )}

                  <div className="border-t border-purple-200 pt-3 flex justify-between items-center">
                    <span className="text-gray-900 font-medium">Total</span>
                    <span className="text-3xl font-display font-bold text-purple-600">
                      ${precio.toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-purple-200" />

                {/* Details */}
                <div className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-600 space-y-2">
                  <p>Al pagar, procesaremos tu renovación automáticamente.</p>
                  <p>Recibirás un email con la confirmación.</p>
                </div>
              </div>

              {/* MercadoPago Button Section */}
              <div className="space-y-3">
                <div id="mp-wallet-container-unique" className="min-h-[56px]" />

                {mpFallbackVisible && (
                  <button
                    onClick={handleFallbackPayment}
                    disabled={processingPayment}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white text-sm font-semibold rounded-lg transition-colors shadow-md shadow-indigo-100"
                  >
                    {processingPayment ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Procesando...
                      </span>
                    ) : (
                      "Ir a pagar"
                    )}
                  </button>
                )}
              </div>

              {/* Security Badge */}
              <div className="flex items-start gap-3 text-xs sm:text-sm lg:text-base xl:text-lg text-gray-700 bg-purple-50 border border-purple-200 rounded-lg p-4">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-purple-600 flex-shrink-0 mt-0.5" />
                <span>Pago 100% seguro con <span className="font-medium">MercadoPago</span></span>
              </div>

              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium rounded-lg transition-colors"
              >
                Volver atrás
              </button>

              {renovacionId && (
                <p className="text-[11px] text-gray-600 text-center">
                  ID de renovación: <span className="text-gray-700">{renovacionId}</span>
                </p>
              )}

              {ultimoLinkPago && !mpFallbackVisible && (
                <p className="text-[11px] text-gray-600 text-center">
                  Si tienes problemas con el botón, usa la opción "Ir a pagar".
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutRenovacionPage;
