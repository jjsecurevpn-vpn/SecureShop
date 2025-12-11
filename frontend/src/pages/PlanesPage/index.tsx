import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import DemoModal from "../../components/DemoModal";
import { Plan } from "../../types";
import { apiService } from "../../services/api.service";
import type { ValidacionCupon } from "../../services/api.service";
import { useServerStats } from "../../hooks/useServerStats";
import { RenovacionPanel } from "./components/RenovacionPanel";
import { SupportSection } from "./components/SupportSection";
import { BenefitsSection } from "./components/BenefitsSection";
import { HeroSection } from "./components/HeroSection";
import { PlanCard } from "./components/PlanCard";
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

// eslint-disable-next-line no-empty-pattern
export default function PlanesPage({ }: PlanesPageProps) {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [planesRenovacion, setPlanesRenovacion] = useState<Plan[]>([]);
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
        const [planesObtenidos, planesRenovacionObtenidos] = await Promise.all([
          apiService.obtenerPlanes(true, "compra"),
          apiService.obtenerPlanes(true, "renovacion"),
        ]);
        setPlanes(planesObtenidos);
        setPlanesRenovacion(planesRenovacionObtenidos);
      } catch (error) {
        console.error("Error cargando planes:", error);
        setPlanes([]);
        setPlanesRenovacion([]);
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

  const planesParaRenovacion = useMemo(
    () => (planesRenovacion.length ? planesRenovacion : planes),
    [planesRenovacion, planes]
  );

  const planRenovacionSeleccionado = useMemo(
    () => encontrarPlan(planesParaRenovacion, diasRenovacion, connectionDestino),
    [planesParaRenovacion, diasRenovacion, connectionDestino]
  );

  const precioRenovacionBase = useMemo(
    () =>
      calcularPrecioRenovacion(
        planesParaRenovacion,
        cuentaRenovacion,
        diasRenovacion,
        connectionDestino
      ),
    [planesParaRenovacion, cuentaRenovacion, diasRenovacion, connectionDestino]
  );

  const precioRenovacionPorDiaBase = useMemo(
    () =>
      calcularPrecioRenovacionPorDia(
        planesParaRenovacion,
        cuentaRenovacion,
        diasRenovacion,
        connectionDestino
      ),
    [planesParaRenovacion, cuentaRenovacion, diasRenovacion, connectionDestino]
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
    
    // Mostrar específicamente: 7D/1 dispositivo, 30D/1 dispositivo, 30D/4 dispositivos
    const planIds = [21, 29, 32]; // IDs específicos
    return planIds
      .map(id => planes.find(p => p.id === id))
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

      <main>
        {/* Hero Section con gradiente claro */}
        <HeroSection 
          config={null} 
          modoSeleccion={modoSeleccion} 
          onActivarModoCompra={activarModoCompra} 
          onActivarModoRenovacion={activarModoRenovacion} 
        />

        {/* Plans Section */}
        <section className="relative py-8 md:py-12 xl:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8 xl:px-16">
            <div className="w-full">
            {modoSeleccion === "compra" && (
              <div className="space-y-12">
                <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                  <div className="space-y-8">
                    {/* Selector de días */}
                    <div className="rounded-2xl p-5 md:p-6 xl:p-8 bg-gradient-to-br from-gray-50 to-white border border-gray-100">
                      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-purple-600 mb-1">
                            Paso 1
                          </p>
                          <h3 className="text-lg md:text-xl xl:text-2xl font-serif font-medium text-gray-900">
                            Duración del plan
                          </h3>
                          <p className="text-sm md:text-base text-gray-500 mt-1">
                            Define cuántos días necesitas conexión segura.
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {diasDisponibles.map((dias) => (
                          <button
                            key={dias}
                            onClick={() => setDiasSeleccionados(dias)}
                            className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                              diasSeleccionados === dias
                                ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50/50'
                            }`}
                          >
                            {dias} días
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Selector de dispositivos */}
                    <div className="rounded-2xl p-5 md:p-6 xl:p-8 bg-gradient-to-br from-gray-50 to-white border border-gray-100">
                      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-purple-600 mb-1">
                            Paso 2
                          </p>
                          <h3 className="text-lg md:text-xl xl:text-2xl font-serif font-medium text-gray-900">
                            Dispositivos simultáneos
                          </h3>
                          <p className="text-sm md:text-base text-gray-500 mt-1">
                            Cambia la cantidad cuando quieras añadir más conexiones.
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {dispositivosDisponibles.map((dispositivos) => (
                          <button
                            key={dispositivos}
                            onClick={() => setDispositivosSeleccionados(dispositivos)}
                            className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                              dispositivosSeleccionados === dispositivos
                                ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50/50'
                            }`}
                          >
                            {dispositivos} {dispositivos === 1 ? "dispositivo" : "dispositivos"}
                          </button>
                        ))}
                      </div>
                      <p className="mt-4 text-sm text-gray-500">
                        ¿Necesitas más conexiones? Podemos armar planes especiales para equipos o revendedores.
                      </p>
                    </div>
                  </div>

                  {/* Resumen del plan - Sidebar */}
                  <aside className="rounded-2xl p-5 md:p-6 xl:p-8 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border border-purple-100 md:sticky md:top-24 md:h-fit shadow-lg">
                    <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] bg-purple-600 text-white mb-6">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Tu selección</span>
                    </div>

                    <div className="space-y-2 mb-6">
                      <h3 className="text-xl md:text-2xl xl:text-3xl font-serif font-medium text-gray-900">
                        {planSeleccionado ? `${planSeleccionado.dias} días` : "Elige tu combinación"}
                      </h3>
                      <p className="text-sm md:text-base text-gray-600">
                        {planSeleccionado
                          ? `Protección para ${planSeleccionado.connection_limit} ${
                              planSeleccionado.connection_limit === 1 ? "dispositivo" : "dispositivos"
                            } con velocidad ilimitada.`
                          : "Primero selecciona duración y dispositivos para ver el detalle completo."}
                      </p>
                    </div>

                    {planSeleccionado ? (
                      <div className="space-y-6">
                        <div className="rounded-xl p-4 md:p-5 xl:p-6 bg-white/80 backdrop-blur-sm border border-purple-100 flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Pago único</p>
                            <p className="text-3xl md:text-4xl xl:text-5xl font-bold text-gray-900">${planSeleccionado.precio}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs uppercase text-gray-400">Equivale a</p>
                            <p className="text-lg md:text-xl font-semibold text-purple-600">${precioPorDiaPlan}/día</p>
                          </div>
                        </div>

                        <ul className="space-y-3 text-sm text-gray-700">
                          <li className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Servidores premium en más de 15 países
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Cambio ilimitado de ubicaciones
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Soporte humano 24/7 en español
                          </li>
                        </ul>

                        <div className="space-y-3">
                          <button
                            onClick={() => planSeleccionado && navigate(`/checkout?planId=${planSeleccionado.id}`)}
                            className="w-full rounded-xl px-6 py-3.5 text-sm md:text-base font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/25"
                          >
                            Continuar al pago
                          </button>
                          <button
                            onClick={() => setIsDemoOpen(true)}
                            className="w-full rounded-xl border-2 border-gray-200 px-6 py-3 text-sm md:text-base font-semibold text-gray-700 hover:border-purple-300 hover:text-purple-600 transition-all bg-white"
                          >
                            Ver demo en vivo
                          </button>
                        </div>

                        <p className="text-xs text-gray-500 text-center">
                          Pago seguro con Mercado Pago, tarjetas internacionales o criptomonedas.
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl border-2 border-dashed border-purple-200 p-5 md:p-6 text-sm text-gray-500 bg-white/50">
                        Te mostraremos aquí el resumen con precio y beneficios cuando elijas una combinación.
                      </div>
                    )}
                  </aside>
                </div>

                {planesDestacados.length > 0 && (
                  <div className="rounded-3xl p-8 md:p-12 space-y-8 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border border-purple-100">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-purple-600">
                          ¿No sabes qué elegir?
                        </p>
                        <h3 className="text-xl md:text-2xl xl:text-3xl font-serif font-medium text-gray-900 mt-1">
                          Nuestros planes más populares
                        </h3>
                      </div>
                      <p className="text-sm md:text-base max-w-md text-gray-600">
                        Estos planes equilibran precio, duración y cantidad de dispositivos. Ideal para comenzar rápido.
                      </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                      {planesDestacados.map((planDestacado, index) => {
                        const precioPorDiaDestacado = calcularPrecioDiario(planDestacado);
                        const isMiddle = index === 1; // El del medio es "más popular"
                        return (
                          <PlanCard
                            key={`${planDestacado.id}-${planDestacado.dias}-${planDestacado.connection_limit}`}
                            plan={planDestacado}
                            precioPorDia={precioPorDiaDestacado}
                            isPopular={isMiddle}
                            onSelect={() => {
                              navigate(`/checkout?planId=${planDestacado.id}`);
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Garantía */}
                    <div className="flex justify-center pt-4">
                      <p className="text-sm flex items-center gap-2 text-gray-600">
                        <span className="text-lg">🛡️</span>
                        Garantía de satisfacción o reembolso
                      </p>
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

        <BenefitsSection />
        <SupportSection />
      </main>
    </div>
  );
}
