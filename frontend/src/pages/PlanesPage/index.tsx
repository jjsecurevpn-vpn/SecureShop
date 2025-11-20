import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import DemoModal from "../../components/DemoModal";
import { PromoHeader } from "../../components/PromoHeader";
import { Plan } from "../../types";
import { apiService } from "../../services/api.service";
import type { ValidacionCupon } from "../../services/api.service";
import { useServerStats } from "../../hooks/useServerStats";
import { RenovacionPanel } from "./components/RenovacionPanel";
import { SupportSection } from "./components/SupportSection";
import { BenefitsSection } from "./components/BenefitsSection";
import { HeroSection } from "./components/HeroSection";
import {
  calcularPrecioDiario,
  calcularPrecioRenovacion,
  calcularPrecioRenovacionPorDia,
  crearParametrosRenovacion,
  encontrarPlan,
  obtenerConnectionActual,
  obtenerDiasDisponibles,
  obtenerDispositivosDisponibles,
  puedeProcesarRenovacion,
} from "./utils";
import { CuentaRenovacion, ModoSeleccion, PasoRenovacion, PlanesPageProps } from "./types";
export type { PlanesPageProps } from "./types";

export default function PlanesPage({ }: PlanesPageProps) {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [modoSeleccion, setModoSeleccion] = useState<ModoSeleccion>("compra");
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [diasSeleccionados, setDiasSeleccionados] = useState(30);
  const [dispositivosSeleccionados, setDispositivosSeleccionados] = useState(1);

  const [pasoRenovacion, setPasoRenovacion] = useState<PasoRenovacion>("buscar");
  const [busquedaCuenta, setBusquedaCuenta] = useState("");
  const [buscandoCuenta, setBuscandoCuenta] = useState(false);
  const [errorRenovacion, setErrorRenovacion] = useState("");
  const [cuentaRenovacion, setCuentaRenovacion] = useState<CuentaRenovacion | null>(null);
  const [diasRenovacion, setDiasRenovacion] = useState(7);
  const [dispositivosRenovacion, setDispositivosRenovacion] = useState<number | null>(null);
  const [nombreRenovacion, setNombreRenovacion] = useState("");
  const [emailRenovacion, setEmailRenovacion] = useState("");
  const [procesandoRenovacion, setProcesandoRenovacion] = useState(false);
  const [cuponRenovacion, setCuponRenovacion] = useState<ValidacionCupon["cupon"] | null>(null);
  const [descuentoRenovacion, setDescuentoRenovacion] = useState(0);

  useServerStats(10000);

  useEffect(() => {
    const cargarPlanes = async () => {
      try {
        const planesObtenidos = await apiService.obtenerPlanes();
        setPlanes(planesObtenidos);
      } catch (error) {
        console.error("Error cargando planes:", error);
        setPlanes([]);
      }
    };

    cargarPlanes();
  }, []);

  const diasDisponibles = useMemo(() => obtenerDiasDisponibles(planes), [planes]);
  const dispositivosDisponibles = useMemo(() => obtenerDispositivosDisponibles(planes), [planes]);

  const planSeleccionado = useMemo(
    () => encontrarPlan(planes, diasSeleccionados, dispositivosSeleccionados),
    [planes, diasSeleccionados, dispositivosSeleccionados]
  );

  const precioPorDiaPlan = useMemo(() => calcularPrecioDiario(planSeleccionado), [planSeleccionado]);

  const connectionActual = obtenerConnectionActual(cuentaRenovacion);
  const connectionDestino = dispositivosRenovacion ?? connectionActual;

  const planRenovacionSeleccionado = useMemo(
    () => encontrarPlan(planes, diasRenovacion, connectionDestino),
    [planes, diasRenovacion, connectionDestino]
  );

  const precioRenovacionBase = useMemo(
    () => calcularPrecioRenovacion(planes, cuentaRenovacion, diasRenovacion, connectionDestino),
    [planes, cuentaRenovacion, diasRenovacion, connectionDestino]
  );

  const precioRenovacionPorDiaBase = useMemo(
    () => calcularPrecioRenovacionPorDia(planes, cuentaRenovacion, diasRenovacion, connectionDestino),
    [planes, cuentaRenovacion, diasRenovacion, connectionDestino]
  );

  const precioRenovacionFinal = useMemo(
    () => Math.max(0, Math.round(precioRenovacionBase - descuentoRenovacion)),
    [precioRenovacionBase, descuentoRenovacion]
  );

  const precioRenovacionPorDia = useMemo(() => {
    if (diasRenovacion <= 0) {
      return 0;
    }
    return Math.max(0, Math.round(precioRenovacionFinal / diasRenovacion));
  }, [precioRenovacionFinal, diasRenovacion]);

  const puedeProcesar = useMemo(
    () => puedeProcesarRenovacion(pasoRenovacion, cuentaRenovacion, nombreRenovacion, emailRenovacion),
    [pasoRenovacion, cuentaRenovacion, nombreRenovacion, emailRenovacion]
  );

  const planesDestacados = useMemo(() => {
    if (!planes.length) return [];
    const durations = Array.from(new Set(planes.map((plan) => plan.dias))).sort((a, b) => a - b);
    return durations.slice(0, 3)
      .map((dias) => {
        const opciones = planes
          .filter((plan) => plan.dias === dias)
          .sort((a, b) => a.precio - b.precio);
        return opciones[0];
      })
      .filter(Boolean) as Plan[];
  }, [planes]);

  const resetRenovacion = () => {
    setPasoRenovacion("buscar");
    setBusquedaCuenta("");
    setBuscandoCuenta(false);
    setErrorRenovacion("");
    setCuentaRenovacion(null);
    setDiasRenovacion(7);
    setDispositivosRenovacion(null);
    setNombreRenovacion("");
    setEmailRenovacion("");
    setProcesandoRenovacion(false);
    setCuponRenovacion(null);
    setDescuentoRenovacion(0);
  };

  const activarModoCompra = () => {
    setModoSeleccion("compra");
    resetRenovacion();
  };

  const activarModoRenovacion = () => {
    if (modoSeleccion !== "renovacion") {
      resetRenovacion();
    }
    setModoSeleccion("renovacion");
  };

  const buscarCuentaRenovacion = async () => {
    if (!busquedaCuenta.trim()) {
      setErrorRenovacion("Ingresa un email o username");
      return;
    }

    setBuscandoCuenta(true);
    setErrorRenovacion("");

    try {
      const response = await fetch("/api/renovacion/buscar?tipo=cliente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busqueda: busquedaCuenta.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Error al buscar la cuenta");
      }

      if (!data?.encontrado) {
        setErrorRenovacion("No se encontró ninguna cuenta con ese email o username");
        return;
      }

      const cuenta: CuentaRenovacion = {
        tipo: data.tipo,
        datos: data.datos,
      };

      setCuentaRenovacion(cuenta);
      setNombreRenovacion(data.datos?.cliente_nombre || "");
      setEmailRenovacion(data.datos?.cliente_email || "");
      setDiasRenovacion(7);
      setDispositivosRenovacion(null);
      setPasoRenovacion("configurar");
    } catch (error: any) {
      setErrorRenovacion(error?.message || "Error al buscar la cuenta");
    } finally {
      setBuscandoCuenta(false);
    }
  };

  const volverABuscarCuenta = () => {
    setPasoRenovacion("buscar");
    setCuentaRenovacion(null);
    setDispositivosRenovacion(null);
    setErrorRenovacion("");
    setCuponRenovacion(null);
    setDescuentoRenovacion(0);
  };

  useEffect(() => {
    if (cuponRenovacion) {
      setCuponRenovacion(null);
      setDescuentoRenovacion(0);
    }
  }, [diasRenovacion, connectionDestino, cuentaRenovacion]);

  const handleCuponRenovacionValidado = (descuento: number, cuponData: ValidacionCupon["cupon"]) => {
    const descuentoNormalizado = Number.isFinite(descuento) ? Math.round(descuento) : 0;
    setDescuentoRenovacion(descuentoNormalizado);
    setCuponRenovacion(cuponData || null);
  };

  const handleCuponRenovacionRemovido = () => {
    setCuponRenovacion(null);
    setDescuentoRenovacion(0);
  };

  const procesarRenovacion = () => {
    if (!puedeProcesar || !cuentaRenovacion) {
      return;
    }

    setProcesandoRenovacion(true);
    setErrorRenovacion("");

    const params = crearParametrosRenovacion({
      cuenta: cuentaRenovacion,
      busqueda: busquedaCuenta,
      dias: diasRenovacion,
      precio: precioRenovacionFinal,
      nombre: nombreRenovacion,
      email: emailRenovacion,
      dispositivos: {
        actual: connectionActual,
        destino: connectionDestino,
      },
      precioOriginal: precioRenovacionBase,
      descuentoAplicado: descuentoRenovacion,
      cupon: cuponRenovacion
        ? { codigo: cuponRenovacion.codigo, id: cuponRenovacion.id }
        : null,
      planId: planRenovacionSeleccionado?.id,
    });

    navigate(`/checkout-renovacion?${params.toString()}`);
  };

  return (
    <div className="bg-white text-gray-900">
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />

      <main className={`md:pt-0 md:ml-14`}>
        {/* Promo Banner Header */}
        <PromoHeader />

        {/* Hero Section */}
        <HeroSection 
          config={null} 
          modoSeleccion={modoSeleccion} 
          onActivarModoCompra={activarModoCompra} 
          onActivarModoRenovacion={activarModoRenovacion} 
        />

        {/* Plans Section */}
        <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-white">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="max-w-7xl mx-auto">
            {modoSeleccion === "compra" && (
              <div className="space-y-12">
                <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                  <div className="space-y-8">
                    <div className="rounded-lg bg-purple-50 p-6 sm:p-8 lg:p-10 xl:p-12">
                      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-xs sm:text-sm lg:text-base xl:text-lg font-semibold uppercase tracking-[0.3em] text-gray-600">Paso 1</p>
                          <h3 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-semibold text-gray-900">Duración del plan</h3>
                          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600">Define cuántos días necesitas conexión segura.</p>
                        </div>
                        <span className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600">Puedes ajustarlo cuando quieras</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {diasDisponibles.map((dias) => (
                          <button
                            key={dias}
                            onClick={() => setDiasSeleccionados(dias)}
                            className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${
                              diasSeleccionados === dias
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                : "border-gray-300 bg-white text-gray-900 hover:border-gray-400"
                            }`}
                          >
                            {dias} días
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg bg-purple-50 p-6 sm:p-8 lg:p-10 xl:p-12">
                      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-xs sm:text-sm lg:text-base xl:text-lg font-semibold uppercase tracking-[0.3em] text-gray-600">Paso 2</p>
                          <h3 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-semibold text-gray-900">Dispositivos simultáneos</h3>
                          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600">Cambia la cantidad cuando quieras añadir más conexiones.</p>
                        </div>
                        <span className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600">Ideal para compartir</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {dispositivosDisponibles.map((dispositivos) => (
                          <button
                            key={dispositivos}
                            onClick={() => setDispositivosSeleccionados(dispositivos)}
                            className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${
                              dispositivosSeleccionados === dispositivos
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                : "border-gray-300 bg-white text-gray-900 hover:border-gray-400"
                            }`}
                          >
                            {dispositivos} {dispositivos === 1 ? "dispositivo" : "dispositivos"}
                          </button>
                        ))}
                      </div>
                      <p className="mt-4 text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600">
                        ¿Necesitas más conexiones? Podemos armar planes especiales para equipos o revendedores.
                      </p>
                    </div>
                  </div>

                  <aside className="rounded-lg bg-gradient-to-br from-slate-900/90 via-gray-900/90 to-slate-800/90 p-6 sm:p-8 lg:p-10 xl:p-12 text-white md:p-8 md:sticky md:top-24 md:h-fit">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-indigo-300">
                      <Sparkles className="h-4 w-4" />
                      <span>Resumen</span>
                    </div>

                    <div className="mt-6 space-y-2">
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold">
                        {planSeleccionado ? `${planSeleccionado.dias} días` : "Elige tu combinación"}
                      </h3>
                      <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-300">
                        {planSeleccionado
                          ? `Protección para ${planSeleccionado.connection_limit} ${
                              planSeleccionado.connection_limit === 1 ? "dispositivo" : "dispositivos"
                            } con velocidad ilimitada.`
                          : "Primero selecciona duración y dispositivos para ver el detalle completo."}
                      </p>
                    </div>

                    {planSeleccionado ? (
                      <div className="mt-8 space-y-6">
                        <div className="rounded-lg bg-white/10 p-4 sm:p-6 lg:p-8 xl:p-10 flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-300">Pago único</p>
                            <p className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-none">${planSeleccionado.precio}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs sm:text-sm lg:text-base xl:text-lg uppercase text-gray-400">Equivale a</p>
                            <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold">${precioPorDiaPlan}/día</p>
                          </div>
                        </div>

                        <ul className="space-y-3 text-sm sm:text-base lg:text-lg xl:text-xl text-gray-200">
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 lg:h-2.5 lg:w-2.5 xl:h-3 xl:w-3 rounded-full bg-indigo-400" />
                            Servidores premium en más de 15 países
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 lg:h-2.5 lg:w-2.5 xl:h-3 xl:w-3 rounded-full bg-indigo-400" />
                            Cambio ilimitado de ubicaciones
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 lg:h-2.5 lg:w-2.5 xl:h-3 xl:w-3 rounded-full bg-indigo-400" />
                            Soporte humano 24/7 en español
                          </li>
                        </ul>

                        <div className="space-y-3">
                          <button
                            onClick={() => planSeleccionado && navigate(`/checkout?planId=${planSeleccionado.id}`)}
                            className="w-full rounded-lg bg-indigo-600 px-6 py-4 text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                          >
                            Continuar al pago
                          </button>
                          <button
                            onClick={() => setIsDemoOpen(true)}
                            className="w-full rounded-lg border border-white/20 px-6 py-4 text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-white transition hover:border-white/40"
                          >
                            Ver demo en vivo
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-400">Pago seguro con Mercado Pago, tarjetas internacionales o criptomonedas.</p>
                      </div>
                    ) : (
                      <div className="mt-8 rounded-lg border border-dashed border-white/30 p-6 sm:p-8 lg:p-10 xl:p-12 text-sm sm:text-base lg:text-lg xl:text-xl text-gray-300">
                        Te mostraremos aquí el resumen con precio y beneficios cuando elijas una combinación.
                      </div>
                    )}
                  </aside>
                </div>

                {planesDestacados.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs sm:text-sm lg:text-base xl:text-lg font-semibold uppercase tracking-[0.3em] text-gray-600">¿No sabes qué elegir?</p>
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-gray-900">Nuestros más pedidos</h3>
                      </div>
                      <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600">
                        Estos planes equilibran precio, duración y cantidad de dispositivos. Ideal para comenzar rápido.
                      </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
                      {planesDestacados.map((planDestacado) => {
                        const precioPorDiaDestacado = calcularPrecioDiario(planDestacado);
                        return (
                          <div
                            key={`${planDestacado.id}-${planDestacado.dias}-${planDestacado.connection_limit}`}
                            className="flex h-full flex-col rounded-lg bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-6 sm:p-8 lg:p-10 xl:p-12 transition"
                          >
                            <div className="mb-4 flex items-center justify-between">
                              <div className="inline-flex items-center gap-2 text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-indigo-600">
                                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
                                {planDestacado.dias} días
                              </div>
                              <span className="text-[13px] sm:text-sm lg:text-base xl:text-lg text-gray-600">
                                Hasta {planDestacado.connection_limit} {planDestacado.connection_limit === 1 ? "dispositivo" : "dispositivos"}
                              </span>
                            </div>
                            <p className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900">${planDestacado.precio}</p>
                            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600">${precioPorDiaDestacado}/día</p>
                            <div className="mt-4 flex-1 text-sm sm:text-base lg:text-lg xl:text-xl text-gray-700">
                              {planDestacado.connection_limit > 1
                                ? "Perfecto para compartir con familia o amigos."
                                : "Ideal para uso personal y viajes frecuentes."}
                            </div>
                            <button
                              onClick={() => {
                                setDiasSeleccionados(planDestacado.dias);
                                setDispositivosSeleccionados(planDestacado.connection_limit || 1);
                              }}
                              className="mt-6 rounded-lg border border-indigo-300 px-4 py-3 text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-indigo-700 transition hover:bg-indigo-100 hover:border-indigo-500"
                            >
                              Usar este plan
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {modoSeleccion === "renovacion" && (
              <RenovacionPanel
                pasoRenovacion={pasoRenovacion}
                busqueda={busquedaCuenta}
                onBusquedaChange={setBusquedaCuenta}
                onBuscarCuenta={buscarCuentaRenovacion}
                buscando={buscandoCuenta}
                error={errorRenovacion}
                cuenta={cuentaRenovacion}
                dias={diasRenovacion}
                onDiasChange={setDiasRenovacion}
                dispositivosSeleccionados={dispositivosRenovacion}
                onDispositivosChange={setDispositivosRenovacion}
                nombre={nombreRenovacion}
                onNombreChange={setNombreRenovacion}
                email={emailRenovacion}
                onEmailChange={setEmailRenovacion}
                puedeProcesar={puedeProcesar}
                procesando={procesandoRenovacion}
                onProcesar={procesarRenovacion}
                onCancelar={activarModoCompra}
                onVolverBuscar={volverABuscarCuenta}
                connectionActual={connectionActual}
                connectionDestino={connectionDestino}
                precioBase={precioRenovacionBase}
                precioTotal={precioRenovacionFinal}
                precioPorDia={precioRenovacionPorDia}
                precioPorDiaBase={precioRenovacionPorDiaBase}
                descuentoAplicado={descuentoRenovacion}
                cuponActual={cuponRenovacion}
                onCuponAplicado={handleCuponRenovacionValidado}
                onCuponRemovido={handleCuponRenovacionRemovido}
                planId={planRenovacionSeleccionado?.id}
              />
            )}
          </div>
        </div>
        </section>

        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-7xl mx-auto">
            <BenefitsSection />
            <SupportSection />
          </div>
        </div>
      </main>
    </div>
  );
}
