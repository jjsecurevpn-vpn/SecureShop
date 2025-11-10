import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Calendar, RefreshCw, Zap } from "lucide-react";
import HeroReventa from "../../components/HeroReventa";
import NavigationSidebar from "../../components/NavigationSidebar";
import { PlanRevendedor } from "../../types";
import { apiService } from "../../services/api.service";
import { ModeSelector } from "./components/ModeSelector";
import { RenovacionPanel } from "./components/RenovacionPanel";
import { PlanGroupsSection } from "./components/PlanGroupsSection";
import { SupportSection } from "./components/SupportSection";
import { MobileMenu } from "./components/MobileMenu";
import { DIAS_POR_CREDITOS, EMAIL_REGEX } from "./constants";
import {
  ModoSeleccion,
  PasoRenovacion,
  PlanGroup,
  RevendedorEncontrado,
  MobileSection,
} from "./types";
import { extractUsersFromName } from "./utils";

export interface RevendedoresPageProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

export default function RevendedoresPage({ isMobileMenuOpen, setIsMobileMenuOpen }: RevendedoresPageProps) {
  const navigate = useNavigate();

  const [planes, setPlanes] = useState<PlanRevendedor[]>([]);
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState("creditos");
  const [expandedMenuSections, setExpandedMenuSections] = useState<string[]>([]);
  const [modoSeleccion, setModoSeleccion] = useState<ModoSeleccion>("compra");

  const [pasoRenovacion, setPasoRenovacion] = useState<PasoRenovacion>("buscar");
  const [busquedaRenovacion, setBusquedaRenovacion] = useState("");
  const [buscandoRenovacion, setBuscandoRenovacion] = useState(false);
  const [errorRenovacion, setErrorRenovacion] = useState("");
  const [revendedorRenovacion, setRevendedorRenovacion] = useState<RevendedorEncontrado | null>(null);
  const [tipoRenovacionSeleccionado, setTipoRenovacionSeleccionado] = useState<"validity" | "credit">("validity");
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState<number>(0);
  const [nombreRenovacion, setNombreRenovacion] = useState("");
  const [emailRenovacion, setEmailRenovacion] = useState("");
  const [procesandoRenovacion, setProcesandoRenovacion] = useState(false);

  const sidebarSections = useMemo(
    () => [
      {
        id: "renovacion",
        label: "Renovación",
        subtitle: "Renueva tu plan",
        icon: <RefreshCw className="w-4 h-4" />,
      },
      {
        id: "creditos",
        label: "Sistema de Créditos",
        subtitle: "Máxima flexibilidad",
        icon: <Zap className="w-4 h-4" />,
      },
      {
        id: "validez",
        label: "Sistema de Validez",
        subtitle: "Total control",
        icon: <Calendar className="w-4 h-4" />,
      },
    ],
    []
  );

  const planesCredit = useMemo(
    () =>
      planes
        .filter((plan) => plan.account_type === "credit")
        .sort((a, b) => a.max_users - b.max_users),
    [planes]
  );

  const planesValidity = useMemo(
    () =>
      planes
        .filter((plan) => plan.account_type === "validity")
        .sort((a, b) => a.max_users - b.max_users),
    [planes]
  );

  const precioRenovacion = useMemo(() => {
    if (!revendedorRenovacion) {
      return 0;
    }

    const planesFuente = tipoRenovacionSeleccionado === "credit" ? planesCredit : planesValidity;
    const planEncontrado = planesFuente.find((plan) => plan.max_users === cantidadSeleccionada);
    return planEncontrado?.precio ?? 0;
  }, [planesCredit, planesValidity, tipoRenovacionSeleccionado, cantidadSeleccionada, revendedorRenovacion]);

  const diasRenovacion = useMemo(
    () => (tipoRenovacionSeleccionado === "credit" ? DIAS_POR_CREDITOS[cantidadSeleccionada] ?? 30 : 30),
    [tipoRenovacionSeleccionado, cantidadSeleccionada]
  );

  const puedeProcesarRenovacion =
    pasoRenovacion === "configurar" &&
    !!revendedorRenovacion &&
    nombreRenovacion.trim().length > 0 &&
    EMAIL_REGEX.test(emailRenovacion.trim()) &&
    cantidadSeleccionada > 0 &&
    precioRenovacion > 0;

  useEffect(() => {
    const cargarPlanes = async () => {
      try {
        const planos = await apiService.obtenerPlanesRevendedores(true);
        setPlanes(planos);
      } catch (error) {
        console.error("Error cargando planes de revendedor:", error);
        setPlanes([]);
      }
    };

    cargarPlanes();
  }, []);

  useEffect(() => {
    if (!revendedorRenovacion) {
      return;
    }

    const planesFuente = tipoRenovacionSeleccionado === "credit" ? planesCredit : planesValidity;
    if (planesFuente.length === 0) {
      return;
    }

    const existeSeleccion = planesFuente.some((plan) => plan.max_users === cantidadSeleccionada);
    if (!existeSeleccion) {
      const planCoincidente = planesFuente.find((plan) => plan.max_users === revendedorRenovacion.datos.max_users);
      const seleccion = planCoincidente ?? planesFuente[0];
      setCantidadSeleccionada(seleccion.max_users);
    }
  }, [planesCredit, planesValidity, tipoRenovacionSeleccionado, revendedorRenovacion, cantidadSeleccionada]);

  const resetRenovacion = () => {
    setPasoRenovacion("buscar");
    setBusquedaRenovacion("");
    setBuscandoRenovacion(false);
    setErrorRenovacion("");
    setRevendedorRenovacion(null);
    setTipoRenovacionSeleccionado("validity");
    setCantidadSeleccionada(0);
    setNombreRenovacion("");
    setEmailRenovacion("");
    setProcesandoRenovacion(false);
  };

  const activarModoCompra = () => {
    setModoSeleccion("compra");
    setActiveSection("creditos");
    resetRenovacion();
  };

  const activarModoRenovacion = () => {
    if (modoSeleccion !== "renovacion") {
      resetRenovacion();
    }
    setModoSeleccion("renovacion");
    setActiveSection("renovacion");
  };

  const volverABuscarRevendedor = () => {
    setPasoRenovacion("buscar");
    setRevendedorRenovacion(null);
    setErrorRenovacion("");
  };

  const buscarRevendedor = async () => {
    if (!busquedaRenovacion.trim()) {
      setErrorRenovacion("Ingresa un email o username");
      return;
    }

    setBuscandoRenovacion(true);
    setErrorRenovacion("");

    try {
      const response = await fetch("/api/renovacion/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busqueda: busquedaRenovacion.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Error al buscar el revendedor");
      }

      if (!data?.encontrado || data.tipo !== "revendedor") {
        setErrorRenovacion("No se encontró ninguna cuenta de revendedor con ese email o username");
        return;
      }

      const info = data as RevendedorEncontrado;
      setRevendedorRenovacion(info);
      setTipoRenovacionSeleccionado(info.datos.servex_account_type);

      const planesFuente = info.datos.servex_account_type === "credit" ? planesCredit : planesValidity;
      if (planesFuente.length > 0) {
        const planCoincidente = planesFuente.find((plan) => plan.max_users === info.datos.max_users);
        setCantidadSeleccionada((planCoincidente ?? planesFuente[0]).max_users);
      } else {
        setCantidadSeleccionada(info.datos.max_users);
      }

      setNombreRenovacion(info.datos.cliente_nombre || "");
      setEmailRenovacion(info.datos.cliente_email || "");
      setPasoRenovacion("configurar");
    } catch (error: any) {
      setErrorRenovacion(error?.message || "Error al buscar el revendedor");
    } finally {
      setBuscandoRenovacion(false);
    }
  };

  const procesarRenovacion = () => {
    if (!puedeProcesarRenovacion || !revendedorRenovacion) {
      if (!EMAIL_REGEX.test(emailRenovacion.trim())) {
        setErrorRenovacion("Ingresa un email válido");
      }
      return;
    }

    setProcesandoRenovacion(true);

    const params = new URLSearchParams({
      tipo: "revendedor",
      busqueda: busquedaRenovacion.trim(),
      dias: diasRenovacion.toString(),
      precio: precioRenovacion.toString(),
      nombre: nombreRenovacion.trim(),
      email: emailRenovacion.trim(),
      tipoRenovacion: tipoRenovacionSeleccionado,
      cantidadSeleccionada: cantidadSeleccionada.toString(),
    });

    const username = revendedorRenovacion.datos.servex_username;
    if (username) {
      params.set("username", username);
    }

    const maxUsers = revendedorRenovacion.datos.max_users;
    if (typeof maxUsers === "number") {
      params.set("maxUsers", maxUsers.toString());
    }

    navigate(`/checkout-renovacion?${params.toString()}`);
  };

  const togglePlan = (planId: number) => {
    setExpandedPlanId(expandedPlanId === planId ? null : planId);
  };

  const groupedPlans: PlanGroup[] = useMemo(
    () => [
      {
        id: "creditos",
        title: "Sistema de Créditos",
        subtitle: "Cuentas personalizadas sin límite de días",
        accent: "bg-emerald-500/10 border-emerald-500/20",
        accentText: "text-emerald-400",
        icon: <Zap className="w-5 h-5" />,
        recommended: true,
        mainDescription:
          "Diseñado para máxima flexibilidad. 1 conexión = 1 crédito. Así: 30 días = 1 crédito, 60 días = 2 créditos, 90 días = 3 créditos, etc. Las cuentas son independientes de tu suscripción, se mantienen vigentes incluso después de vencer.",
        shortDescription: "1 conexión = 1 crédito | 30 días = 1 crédito, 60 días = 2 créditos",
        keyFeatures: [
          {
            icon: "zap",
            title: "1 Conexión = 1 Crédito",
            description: "Cada crédito = 1 conexión VPN independiente",
          },
          {
            icon: "clock",
            title: "Costo por Duración",
            description: "30 días = 1 crédito | 60 días = 2 créditos | 90 días = 3 créditos",
          },
          {
            icon: "users",
            title: "Cuentas Independientes",
            description: "Se mantienen vigentes incluso después de vencer tu suscripción",
          },
          {
            icon: "check-circle",
            title: "Acumula Créditos",
            description: "Almacena en tu panel y úsalos cuando necesites",
          },
        ],
        useCases: [
          "Vender planes mensuales estándar (30 días)",
          "Ofrecer pruebas extendidas personalizadas",
          "Crear planes anuales (360+ días) para clientes premium",
          "Adaptarse a preferencias específicas de cada cliente",
        ],
        bestFor:
          "Revendedores que buscan máxima flexibilidad para crear planes personalizados sin limitaciones de duración.",
        items: planesCredit,
      },
      {
        id: "validez",
        title: "Sistema de Validez",
        subtitle: "Suscripción con reutilización automática de cupos",
        accent: "bg-blue-500/10 border-blue-500/20",
        accentText: "text-blue-400",
        icon: <BarChart3 className="w-5 h-5" />,
        mainDescription:
          "Suscripción mensual renovable con reutilización de cupos. Crea múltiples cuentas dentro del rango de usuarios durante ese mes. Los usuarios están vinculados a tu suscripción: si esta vence, todos los usuarios expiran también. Al contrario de Créditos donde las cuentas son independientes.",
        shortDescription: "0/N usuarios → Vinculados a tu suscripción mensual",
        keyFeatures: [
          {
            icon: "refresh-cw",
            title: "Vinculado a Suscripción Mensual",
            description: "Los usuarios están ligados a tu suscripción. Si expira, todos expiran.",
          },
          {
            icon: "users",
            title: "Reutilización dentro del Mes",
            description: "Crea cuentas de cualquier duración dentro del mismo mes",
          },
          {
            icon: "dollar-sign",
            title: "Sin Costo Adicional",
            description: "No consumes créditos, solo cupos reutilizables",
          },
          {
            icon: "maximize",
            title: "Máxima Rentabilidad",
            description: "Optimiza tu inventario con diferentes duraciones mensuales",
          },
        ],
        useCases: [
          "Vender cuentas dentro del mes (30, 20, 15 días)",
          "Combinar duraciones (1×30 días, 2×15 días, etc.) en el mismo mes",
          "Maximizar la utilización de cupos mensuales",
          "Mantener rentabilidad sin costo adicional durante el mes",
        ],
        bestFor:
          "Revendedores que buscan eficiencia: vender cuentas premium personalizadas reutilizando cupos sin gastar créditos.",
        items: planesValidity,
      },
    ],
    [planesCredit, planesValidity]
  );

  const revendedorSections: MobileSection[] = useMemo(() => {
    const sections: MobileSection[] = [
      {
        id: "renovacion",
        label: "Renovación",
        subtitle: "Renueva tu plan actual",
        icon: (
          <div className="w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center">
            <RefreshCw className="w-2.5 h-2.5 text-purple-400" />
          </div>
        ),
        scrollId: "plan-renovacion",
      },
    ];

    groupedPlans.forEach((group) => {
      const groupId = group.id;
      const isExpanded = expandedMenuSections.includes(groupId);

      sections.push({
        id: groupId,
        label: group.title,
        subtitle: group.subtitle,
  icon: group.icon,
        isGroup: true,
        isExpanded,
        onToggle: () => {
          const wasExpanded = expandedMenuSections.includes(groupId);
          setExpandedMenuSections((prev) =>
            prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
          );
          setActiveSection(groupId);

          if (!wasExpanded) {
            setTimeout(() => {
              const element = document.getElementById(`plan-${groupId}`);
              element?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 100);
          }
        },
      });

      if (isExpanded) {
  group.items.forEach((plan) => {
          sections.push({
            id: `plan-${plan.id}`,
            label:
              plan.account_type === "credit"
                ? `${plan.max_users} créditos`
                : `${extractUsersFromName(plan.nombre)} usuarios`,
            subtitle: plan.account_type === "credit" ? "Sistema de créditos" : "30 días",
            icon: (
              <div className="w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
              </div>
            ),
            isPlan: true,
            planId: plan.id,
            parentGroup: groupId,
          });
        });
      }
    });

    return sections;
  }, [groupedPlans, expandedMenuSections]);

  const handleConfirmarCompra = (plan: PlanRevendedor) => {
    navigate(`/checkout-revendedor?planId=${plan.id}`);
  };

  const handleSectionSelect = (id: string) => {
    if (id === "renovacion") {
      activarModoRenovacion();
      setTimeout(() => {
        document.getElementById("plan-renovacion")?.scrollIntoView({ behavior: "smooth" });
      }, 0);
      return;
    }

    if (modoSeleccion !== "compra") {
      setModoSeleccion("compra");
    }

    setActiveSection(id);
    setTimeout(() => {
      document.getElementById(`plan-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleMobileGroup = (section: MobileSection) => {
    if (modoSeleccion !== "compra") {
      setModoSeleccion("compra");
    }
    section.onToggle?.();
  };

  const handleMobilePlan = (section: MobileSection) => {
    if (modoSeleccion !== "compra") {
      setModoSeleccion("compra");
    }

    if (section.planId) {
      setActiveSection(section.id);
      const element = document.getElementById(`plan-${section.planId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    closeMobileMenu();
  };

  const handleMobileSection = (section: MobileSection) => {
    if (section.id === "renovacion") {
      activarModoRenovacion();
      setTimeout(() => {
        if (section.scrollId) {
          document.getElementById(section.scrollId)?.scrollIntoView({ behavior: "smooth" });
        }
      }, 0);
    } else {
      if (modoSeleccion !== "compra") {
        setModoSeleccion("compra");
      }
      setActiveSection(section.id);
      setTimeout(() => {
        const element = document.getElementById(`plan-${section.id}`);
        if (element) {
          const headerOffset = 120;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }, 0);
    }

    closeMobileMenu();
  };

  return (
    <div className="min-h-screen bg-[#181818]">
      <NavigationSidebar
        title="Revendedores"
        subtitle="Planes disponibles"
        sections={sidebarSections}
        activeSection={activeSection}
        onSectionChange={handleSectionSelect}
        sectionIdPrefix="plan-"
      />

      <main className="md:ml-[312px]">
        <HeroReventa />

        <section id="planes-section" className="pb-20">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
            <div className="mb-12 space-y-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-neutral-100 mb-4">Planes de Revendedor</h1>
                <p className="text-xl text-neutral-400">Dos sistemas diseñados para adaptarse a tu modelo de negocio</p>
              </div>

              <ModeSelector
                mode={modoSeleccion}
                onSelectCompra={activarModoCompra}
                onSelectRenovacion={activarModoRenovacion}
              />
            </div>

            {modoSeleccion === "renovacion" && (
              <RenovacionPanel
                pasoRenovacion={pasoRenovacion}
                busqueda={busquedaRenovacion}
                onBusquedaChange={setBusquedaRenovacion}
                onBuscar={buscarRevendedor}
                buscando={buscandoRenovacion}
                error={errorRenovacion}
                revendedor={revendedorRenovacion}
                tipoSeleccionado={tipoRenovacionSeleccionado}
                onTipoChange={setTipoRenovacionSeleccionado}
                cantidadSeleccionada={cantidadSeleccionada}
                onCantidadChange={setCantidadSeleccionada}
                nombre={nombreRenovacion}
                onNombreChange={setNombreRenovacion}
                email={emailRenovacion}
                onEmailChange={setEmailRenovacion}
                procesando={procesandoRenovacion}
                puedeProcesar={puedeProcesarRenovacion}
                diasRenovacion={diasRenovacion}
                precioRenovacion={precioRenovacion}
                planesCredit={planesCredit}
                planesValidity={planesValidity}
                onVerPlanes={activarModoCompra}
                onVolverBuscar={volverABuscarRevendedor}
                onProcesar={procesarRenovacion}
              />
            )}

            <div className={`space-y-16 ${modoSeleccion === "renovacion" ? "mt-16" : ""}`}>
              <PlanGroupsSection
                groups={groupedPlans}
                expandedPlanId={expandedPlanId}
                onTogglePlan={togglePlan}
                onConfirmarCompra={handleConfirmarCompra}
              />
            </div>
          </div>
        </section>

        <SupportSection />
      </main>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        sections={revendedorSections}
        activeSection={activeSection}
        onSelectGroup={handleMobileGroup}
        onSelectPlan={handleMobilePlan}
        onSelectSection={handleMobileSection}
      />
    </div>
  );
}
