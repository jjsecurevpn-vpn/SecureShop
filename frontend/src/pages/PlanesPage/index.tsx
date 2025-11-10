import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DemoModal from "../../components/DemoModal";
import NavigationSidebar from "../../components/NavigationSidebar";
import { PromoTimer } from "../../components/PromoTimer";
import { Plan } from "../../types";
import { apiService } from "../../services/api.service";
import type { ValidacionCupon } from "../../services/api.service";
import { useServerStats } from "../../hooks/useServerStats";
import { useHeroConfig } from "../../hooks/useHeroConfig";
import { HeroSection } from "./components/HeroSection";
import { BenefitsSection } from "./components/BenefitsSection";
import { ModeSelector } from "./components/ModeSelector";
import { PlanSelector } from "./components/PlanSelector";
import { RenovacionPanel } from "./components/RenovacionPanel";
import { SupportSection } from "./components/SupportSection";
import { MobileMenu } from "./components/MobileMenu";
import { PLAN_SECTIONS } from "./constants";
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

export default function PlanesPage({ isMobileMenuOpen, setIsMobileMenuOpen }: PlanesPageProps) {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [modoSeleccion, setModoSeleccion] = useState<ModoSeleccion>("compra");
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [diasSeleccionados, setDiasSeleccionados] = useState(30);
  const [dispositivosSeleccionados, setDispositivosSeleccionados] = useState(1);
  const [activeSection, setActiveSection] = useState("selector");

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

  const { totalUsers, onlineServers } = useServerStats(10000);
  const { config: heroConfig } = useHeroConfig();

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

  const handleSectionNavigate = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(`section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleMobileSection = (sectionId: string) => {
    handleSectionNavigate(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#181818]">
      <NavigationSidebar
        title="Planes VPN"
        subtitle="Navega las secciones"
        sections={PLAN_SECTIONS}
        activeSection={activeSection}
        onSectionChange={handleSectionNavigate}
        sectionIdPrefix="section-"
      />

      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />

      <main className="md:ml-[312px] pt-16 md:pt-0">
        <HeroSection config={heroConfig} totalUsers={totalUsers} onlineServers={onlineServers} />

        <BenefitsSection />

        <section className="py-12 border-b border-neutral-800">
          <div className="max-w-4xl mx-auto px-6 md:px-8">
            <PromoTimer />
          </div>
        </section>

        <section id="section-selector" className="py-16 border-b border-neutral-800">
          <div className="max-w-4xl mx-auto px-6 md:px-8">
            <div className="space-y-10">
              <ModeSelector
                mode={modoSeleccion}
                onSelectCompra={activarModoCompra}
                onSelectRenovacion={activarModoRenovacion}
              />

              {modoSeleccion === "compra" && (
                <PlanSelector
                  diasDisponibles={diasDisponibles}
                  dispositivosDisponibles={dispositivosDisponibles}
                  diasSeleccionados={diasSeleccionados}
                  dispositivosSeleccionados={dispositivosSeleccionados}
                  onSelectDias={setDiasSeleccionados}
                  onSelectDispositivos={setDispositivosSeleccionados}
                  planSeleccionado={planSeleccionado}
                  precioPorDia={precioPorDiaPlan}
                  onOpenDemo={() => setIsDemoOpen(true)}
                  onComprar={() => {
                    if (planSeleccionado) {
                      navigate(`/checkout?planId=${planSeleccionado.id}`);
                    }
                  }}
                />
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

        <SupportSection />
      </main>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        sections={PLAN_SECTIONS}
        activeSection={activeSection}
        onSelectSection={handleMobileSection}
      />
    </div>
  );
}
