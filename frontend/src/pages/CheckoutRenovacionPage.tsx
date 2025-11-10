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
    } catch (err) {
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
      } catch (err) {
        console.error("[CheckoutRenovacion] Error inicializando MercadoPago:", err);
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
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-neutral-100">No pudimos cargar tu renovación</h1>
          <p className="text-sm text-neutral-400">
            Vuelve a la página de planes e inicia nuevamente el proceso de renovación.
          </p>
        </div>
        <button
          onClick={() => navigate("/planes")}
          className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-lg transition-colors"
        >
          Volver a planes
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] pt-16 md:pt-14">
      <main className="md:ml-14">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-10 md:pb-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="md:col-span-2 space-y-8">
              <section>
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-neutral-200 uppercase tracking-tight">
                    Datos de contacto
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Confirma tu información antes de completar el pago
                  </p>
                </div>

                {error && (
                  <div className="mb-4 flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Nombre completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                      <input
                        type="text"
                        value={nombre}
                        onChange={(event) => {
                          setNombre(event.target.value);
                          setError("");
                        }}
                        className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="Juan Pérez"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          setError("");
                        }}
                        className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="tu@email.com"
                      />
                    </div>
                    <p className="text-neutral-500 text-xs mt-2 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-purple-400" />
                      Te enviaremos la confirmación de la renovación a este correo
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-neutral-200 uppercase tracking-tight">
                    Resumen de la operación
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Verifica los datos antes de continuar con el pago
                  </p>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-tight mb-1">
                        Usuario
                      </p>
                      <p className="text-sm font-medium text-neutral-200">{username}</p>
                      {planNombre && (
                        <p className="text-xs text-neutral-500 mt-1">Plan actual: {planNombre}</p>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-purple-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-neutral-800/40 border border-neutral-700/60 rounded-lg p-4">
                      <p className="text-xs text-neutral-500 uppercase tracking-wide flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Días a agregar
                      </p>
                      <p className="text-lg font-semibold text-neutral-100 mt-1">{dias} días</p>
                    </div>

                    {tipo === "cliente" && (
                      <div className="bg-neutral-800/40 border border-neutral-700/60 rounded-lg p-4">
                        <p className="text-xs text-neutral-500 uppercase tracking-wide flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5" />
                          Dispositivos
                        </p>
                        <p className="text-lg font-semibold text-neutral-100 mt-1">
                          {connectionDestino || connectionActual} dispositivos
                        </p>
                        {hayCambioDispositivos ? (
                          <p className="text-[11px] text-purple-300 mt-1">
                            Upgrade desde {connectionActual} dispositivos
                          </p>
                        ) : (
                          <p className="text-[11px] text-neutral-500 mt-1">
                            Sin cambios en el límite actual
                          </p>
                        )}
                      </div>
                    )}

                    {tipo === "revendedor" && (
                      <div className="bg-neutral-800/40 border border-neutral-700/60 rounded-lg p-4">
                        <p className="text-xs text-neutral-500 uppercase tracking-wide flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5" />
                          Tipo de renovación
                        </p>
                        <p className="text-sm font-semibold text-neutral-100 mt-1">{tipoRenovacion}</p>
                        {cantidadSeleccionada && (
                          <p className="text-[11px] text-neutral-500 mt-1">
                            Cantidad: {cantidadSeleccionada}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {hayDescuento && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-emerald-300 uppercase tracking-wide">Cupón aplicado</p>
                        {codigoCupon && (
                          <p className="text-sm font-semibold text-neutral-100 mt-0.5">{codigoCupon}</p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-emerald-300">
                        - ${descuentoFinal.toLocaleString("es-AR")}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-neutral-800 pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-neutral-400">
                      <span>Precio por día</span>
                      {hayDescuento ? (
                        <div className="text-right">
                          <span className="block text-neutral-200 font-medium">
                            ${precioPorDia.toLocaleString("es-AR")}
                          </span>
                          <span className="text-[11px] text-neutral-500 line-through">
                            ${precioPorDiaBase.toLocaleString("es-AR")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-neutral-200 font-medium">
                          ${precioPorDia.toLocaleString("es-AR")}
                        </span>
                      )}
                    </div>

                    {hayDescuento && (
                      <div className="flex justify-between text-xs text-neutral-500">
                        <span>Precio original</span>
                        <span className="line-through">
                          ${precioBase.toLocaleString("es-AR")}
                        </span>
                      </div>
                    )}

                    {hayDescuento && (
                      <div className="flex justify-between text-sm text-emerald-400">
                        <span>
                          Descuento
                          {codigoCupon ? ` (${codigoCupon})` : ""}
                        </span>
                        <span>- ${descuentoFinal.toLocaleString("es-AR")}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-baseline">
                      <span className="text-neutral-300 font-semibold">Total a pagar</span>
                      <span className="text-3xl font-bold text-purple-400">
                        ${precio.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="md:col-span-1">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 sticky top-24 space-y-5">
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-tight mb-2">
                    Completar pago
                  </p>
                  <p className="text-sm text-neutral-400">
                    Al pagar, procesaremos tu renovación automáticamente y recibirás un email con la confirmación.
                  </p>
                </div>

                <div id="mp-wallet-container-unique" className="min-h-12 w-full" />

                {mpFallbackVisible && (
                  <button
                    onClick={handleFallbackPayment}
                    disabled={processingPayment}
                    className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-600 text-white text-sm font-semibold rounded-md transition-colors"
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

                <button
                  onClick={() => navigate(-1)}
                  className="w-full py-2 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium rounded-md transition-colors"
                >
                  Volver atrás
                </button>

                {renovacionId && (
                  <p className="text-[11px] text-neutral-600 text-center">
                    ID de renovación: <span className="text-neutral-400">{renovacionId}</span>
                  </p>
                )}

                {ultimoLinkPago && !mpFallbackVisible && (
                  <p className="text-[11px] text-neutral-500 text-center">
                    Si tienes problemas con el botón, usa la opción "Ir a pagar".
                  </p>
                )}

                <div className="flex items-start gap-3 text-xs text-neutral-500 bg-neutral-800/40 border border-neutral-700/50 rounded-xl p-4">
                  <Shield className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                  <span>
                    Pago seguro con <span className="text-neutral-200 font-medium">MercadoPago</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutRenovacionPage;
