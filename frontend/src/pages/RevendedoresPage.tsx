import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Star,
  Check,
  MessageCircle,
  Phone,
  CreditCard,
  Calendar,
  RefreshCw,
  ChevronRight,
  Zap,
  Gift,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import CheckoutModalRevendedor from "../components/CheckoutModalRevendedor";
import RenovacionModalRevendedor from "../components/RenovacionModalRevendedor";
import HeroReventa from "../components/HeroReventa";
import MobilePageHeader from "../components/MobilePageHeader";
import BottomSheet from "../components/BottomSheet";
import NavigationSidebar from "../components/NavigationSidebar";
import { PlanRevendedor, CompraRevendedorRequest } from "../types";
import { apiService } from "../services/api.service";

export default function RevendedoresPage() {
  const [planSeleccionado, setPlanSeleccionado] =
    useState<PlanRevendedor | null>(null);
  const [comprando, setComprando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planes, setPlanes] = useState<PlanRevendedor[]>([]);
  const [mostrarRenovacion, setMostrarRenovacion] = useState(false);
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("creditos");
  const [expandedMenuSections, setExpandedMenuSections] = useState<string[]>(
    []
  );

  const sidebarSections = [
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
  ];

  useEffect(() => {
    cargarPlanes();
  }, []);

  const cargarPlanes = async () => {
    try {
      const planos = await apiService.obtenerPlanesRevendedores(true);
      console.log("Planes cargados:", planos);
      console.log(
        "Planes credit:",
        planos.filter((p) => p.account_type === "credit")
      );
      console.log(
        "Planes validity:",
        planos.filter((p) => p.account_type === "validity")
      );
      setPlanes(planos);
    } catch (err: any) {
      console.error("Error cargando planes de revendedor:", err);
      setPlanes([]);
    }
  };

  const creditMonths = (plan: PlanRevendedor) => {
    const credits = plan.max_users || 0;
    if (credits <= 5) return 1;
    if (credits <= 10) return 2;
    if (credits <= 20) return 3;
    if (credits <= 30) return 4;
    return 5;
  };

  // Función para extraer el número de usuarios del nombre del plan
  const extractUsersFromName = (name: string) => {
    const match = name.match(/^(\d+)\s+Usuarios?$/i);
    return match ? parseInt(match[1]) : 1;
  };

  const togglePlan = (planId: number) => {
    setExpandedPlanId(expandedPlanId === planId ? null : planId);
  };

  const groupedPlans = [
    {
      title: "Sistema de Créditos",
      subtitle: "Máxima flexibilidad",
      accent: "bg-emerald-500/10 border-emerald-500/20",
      accentText: "text-emerald-400",
      icon: <Zap className="w-5 h-5" />,
      recommended: true,
      description:
        "Crea cuentas personalizadas sin límites de días. 1 crédito = 1 mes de acceso (30 días)",
      benefits: [
        "Cuentas de 30 días o más",
        "Acumula créditos en tu panel",
        "Flexibilidad total para clientes",
        "Perfecto para retención",
      ],
      items: planes.filter((p) => p.account_type === "credit"),
    },
    {
      title: "Sistema de Validez",
      subtitle: "Total control",
      accent: "bg-blue-500/10 border-blue-500/20",
      accentText: "text-blue-400",
      icon: <Calendar className="w-5 h-5" />,
      description:
        "Cuentas personalizadas en el rango que desees. Al expirar, se libera el cupo automáticamente",
      benefits: [
        "Cuentas personalizadas (3-45 días)",
        "Flexibilidad total en duración",
        "Reutiliza cupos automáticamente",
        "Máximo aprovechamiento",
      ],
      items: planes.filter((p) => p.account_type === "validity"),
    },
  ];

  // Secciones del menú de navegación generadas dinámicamente
  const revendedorSections = useMemo(() => {
    const sections: any[] = [];

    groupedPlans.forEach((group) => {
      const groupId = group.title.toLowerCase().replace(" ", "-");
      const isExpanded = expandedMenuSections.includes(groupId);

      // Agregar la sección principal del grupo
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
            prev.includes(groupId)
              ? prev.filter((id) => id !== groupId)
              : [...prev, groupId]
          );
          setActiveSection(groupId); // Activar el grupo cuando se expande

          // Si se está expandiendo (no estaba expandido antes), hacer scroll al grupo
          if (!wasExpanded) {
            setTimeout(() => {
              const element = document.getElementById(`plan-${groupId}`);
              if (element) {
                element.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
            }, 100); // Pequeño delay para que se complete la expansión
          }
        },
      });

      // Agregar los planes individuales si el grupo está expandido
      if (isExpanded) {
        group.items.forEach((plan) => {
          sections.push({
            id: `plan-${plan.id}`,
            label:
              plan.account_type === "credit"
                ? `${plan.max_users} créditos`
                : `${extractUsersFromName(plan.nombre)} usuarios`,
            subtitle:
              plan.account_type === "credit"
                ? `Equivale a ${creditMonths(plan)} mes${
                    creditMonths(plan) > 1 ? "es" : ""
                  }`
                : "30 días",
            icon: (
              <div className="w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
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

  const handleConfirmarCompra = async (datos: CompraRevendedorRequest) => {
    try {
      setComprando(true);
      setError(null);
      const respuesta = await apiService.comprarPlanRevendedor(datos);
      if (respuesta.linkPago) {
        window.location.href = respuesta.linkPago;
      } else {
        throw new Error("No se recibió el enlace de pago");
      }
    } catch (err: any) {
      console.error("Error en la compra:", err);
      setError(err.message || "Error al procesar la compra");
      setComprando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#181818]">
      {/* Mobile Header */}
      <MobilePageHeader
        title="Revendedores"
        onMenuClick={() => setIsMobileMenuOpen(true)}
      />

      {/* Sidebar */}
      <NavigationSidebar
        title="Revendedores"
        subtitle="Planes disponibles"
        sections={sidebarSections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      {/* Main Content */}
      <main className="md:ml-[312px]">
        <HeroReventa />

        {/* Plans Section */}
        <section id="planes-section" className="pb-20">
          <div className="max-w-[1400px] mx-auto px-6 md:px-8">
            <div className="space-y-12">
              {groupedPlans.map((group) => (
                <div
                  key={group.title}
                  id={`plan-${group.title.toLowerCase().replace(" ", "-")}`}
                  className={`transition-all duration-500 ${
                    activeSection ===
                    group.title.toLowerCase().replace(" ", "-")
                      ? "ring-2 ring-purple-500/30 rounded-lg p-2 md:p-4 bg-purple-500/5"
                      : ""
                  }`}
                >
                  {/* Group Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg border ${group.accent}`}>
                        <div className={group.accentText}>{group.icon}</div>
                      </div>
                      <div>
                        <h2
                          className={`text-2xl font-bold flex items-center gap-2 transition-colors duration-300 break-words ${
                            activeSection ===
                            group.title.toLowerCase().replace(" ", "-")
                              ? "text-purple-300"
                              : "text-neutral-200"
                          }`}
                        >
                          {group.title}
                          {group.recommended && (
                            <span className="text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
                              <Star className="w-3 h-3 inline mr-1" />
                              Recomendado
                            </span>
                          )}
                        </h2>
                        <p className="text-sm text-neutral-500">
                          {group.subtitle}
                        </p>
                      </div>
                    </div>{" "}
                    {/* Description */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-4">
                      <p className="text-sm text-neutral-300 leading-relaxed break-words">
                        {group.description}
                      </p>
                    </div>
                    {/* Benefits Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {group.benefits.map((benefit, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-xs text-neutral-400"
                        >
                          <Check
                            className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${group.accentText}`}
                          />
                          <span className="break-words">{benefit}</span>
                        </div>
                      ))}
                    </div>
                    {/* Plans List */}
                    {group.items.length > 0 ? (
                      <div className="space-y-3 max-w-full">
                        {group.items.map((plan: PlanRevendedor) => (
                          <div
                            key={plan.id}
                            id={`plan-${plan.id}`}
                            className={`bg-neutral-900 border hover:border-neutral-700 rounded-lg overflow-hidden transition-all max-w-full ${
                              activeSection === `plan-${plan.id}`
                                ? "ring-2 ring-purple-500/50 border-purple-500/50 bg-purple-500/5 shadow-lg shadow-purple-500/10"
                                : "border-neutral-800"
                            }`}
                          >
                            {/* Plan Header */}
                            <button
                              onClick={() => togglePlan(plan.id)}
                              className="w-full px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 hover:bg-neutral-800/50 transition-colors"
                            >
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="text-left flex-1 min-w-0">
                                  <div
                                    className={`text-sm font-semibold transition-colors break-words ${
                                      activeSection === `plan-${plan.id}`
                                        ? "text-purple-300"
                                        : "text-neutral-200"
                                    }`}
                                  >
                                    {plan.nombre}
                                  </div>
                                  <div className="text-xs text-neutral-500 break-words">
                                    {plan.account_type === "credit"
                                      ? `Equivale a ${creditMonths(plan)} mes${
                                          creditMonths(plan) > 1 ? "es" : ""
                                        }`
                                      : "30 días"}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                                <div className="text-right hidden sm:block">
                                  <div className="text-2xl font-bold text-emerald-400">
                                    ${plan.precio.toLocaleString("es-AR")}
                                  </div>
                                  <div className="text-xs text-neutral-500">
                                    $
                                    {(
                                      plan.precio / (plan.max_users || 1)
                                    ).toFixed(0)}{" "}
                                    por{" "}
                                    {plan.account_type === "credit"
                                      ? "crédito"
                                      : "usuario"}
                                  </div>
                                </div>
                                <ChevronRight
                                  className={`w-5 h-5 text-neutral-400 transition-transform ${
                                    expandedPlanId === plan.id
                                      ? "rotate-90"
                                      : ""
                                  }`}
                                />
                              </div>

                              {/* Mobile Price - Shown below on small screens */}
                              <div className="text-center sm:hidden mt-2 pt-2 border-t border-neutral-800">
                                <div className="text-xl font-bold text-emerald-400">
                                  ${plan.precio.toLocaleString("es-AR")}
                                </div>
                                <div className="text-xs text-neutral-500">
                                  $
                                  {(
                                    plan.precio / (plan.max_users || 1)
                                  ).toFixed(0)}{" "}
                                  por{" "}
                                  {plan.account_type === "credit"
                                    ? "crédito"
                                    : "usuario"}
                                </div>
                              </div>
                            </button>

                            {/* Expanded Content */}
                            {expandedPlanId === plan.id && (
                              <div className="border-t border-neutral-800 bg-neutral-900/50">
                                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-hidden">
                                  {/* Features */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-neutral-200 mb-3">
                                      ¿Qué incluye?
                                    </h4>
                                    <div className="space-y-3">
                                      {plan.account_type === "credit" ? (
                                        <>
                                          <div className="flex items-start gap-2 text-sm text-neutral-300">
                                            <CreditCard
                                              className={`w-4 h-4 flex-shrink-0 mt-0.5 ${group.accentText}`}
                                            />
                                            <span className="break-words">
                                              <strong>
                                                {plan.max_users} créditos
                                              </strong>{" "}
                                              en tu panel
                                            </span>
                                          </div>
                                          <div className="flex items-start gap-2 text-sm text-neutral-300">
                                            <Calendar
                                              className={`w-4 h-4 flex-shrink-0 mt-0.5 ${group.accentText}`}
                                            />
                                            <span className="break-words">
                                              Equivale a{" "}
                                              <strong>
                                                {creditMonths(plan)}{" "}
                                                {creditMonths(plan) > 1
                                                  ? "meses"
                                                  : "mes"}
                                              </strong>{" "}
                                              de acceso VPN
                                            </span>
                                          </div>
                                          <div className="flex items-start gap-2 text-sm text-neutral-300">
                                            <Zap
                                              className={`w-4 h-4 flex-shrink-0 mt-0.5 ${group.accentText}`}
                                            />
                                            <span className="break-words">
                                              Crea cuentas de{" "}
                                              <strong>30 días o más</strong>
                                            </span>
                                          </div>
                                          <div className="flex items-start gap-2 text-sm text-neutral-300">
                                            <Users
                                              className={`w-4 h-4 flex-shrink-0 mt-0.5 ${group.accentText}`}
                                            />
                                            <span className="break-words">
                                              Acumula créditos y úsalos cuando
                                              necesites
                                            </span>
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <div className="flex items-start gap-2 text-sm text-neutral-300">
                                            <Calendar
                                              className={`w-4 h-4 flex-shrink-0 mt-0.5 ${group.accentText}`}
                                            />
                                            <span className="break-words">
                                              <strong>30 días</strong> totales
                                              para crear cuentas
                                            </span>
                                          </div>
                                          <div className="flex items-start gap-2 text-sm text-neutral-300">
                                            <Gift
                                              className={`w-4 h-4 flex-shrink-0 mt-0.5 ${group.accentText}`}
                                            />
                                            <span className="break-words">
                                              Flexibilidad: cada plan
                                              corresponde a{" "}
                                              <strong>30 días</strong>
                                            </span>
                                          </div>
                                          <div className="flex items-start gap-2 text-sm text-neutral-300">
                                            <TrendingUp
                                              className={`w-4 h-4 flex-shrink-0 mt-0.5 ${group.accentText}`}
                                            />
                                            <span className="break-words">
                                              Ejemplo: 1×30 días, 2×15 días, o
                                              combina
                                            </span>
                                          </div>
                                          <div className="flex items-start gap-2 text-sm text-neutral-300">
                                            <RefreshCw
                                              className={`w-4 h-4 flex-shrink-0 mt-0.5 ${group.accentText}`}
                                            />
                                            <span className="break-words">
                                              Al expirar,{" "}
                                              <strong>se libera el cupo</strong>{" "}
                                              automáticamente
                                            </span>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* Costo por unidad */}
                                  <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3 sm:p-4">
                                    <h4 className="text-sm font-semibold text-neutral-200 mb-2">
                                      Costo por unidad:
                                    </h4>
                                    <div className="text-base sm:text-lg font-bold text-emerald-400">
                                      $
                                      {(
                                        plan.precio / (plan.max_users || 1)
                                      ).toFixed(0)}{" "}
                                      ARS
                                      <span className="text-xs sm:text-sm font-normal text-neutral-400 ml-1">
                                        por{" "}
                                        {plan.account_type === "credit"
                                          ? "crédito"
                                          : "usuario"}
                                      </span>
                                    </div>
                                    <p className="text-xs text-neutral-500 mt-1 break-words">
                                      {plan.account_type === "credit"
                                        ? "Cada crédito te permite crear una cuenta VPN de 30 días"
                                        : "Cada usuario corresponde a una cuenta VPN individual"}
                                    </p>
                                  </div>

                                  {/* Use Case */}
                                  <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3 sm:p-4">
                                    <h4 className="text-sm font-semibold text-neutral-200 mb-2">
                                      Caso de uso ideal:
                                    </h4>
                                    <p className="text-sm text-neutral-400 leading-relaxed break-words">
                                      {plan.account_type === "credit"
                                        ? "Perfecto si quieres ofrecer planes estándar mensuales. Tus clientes reciben acceso consistente cada 30 días. Ideal para construir una base de clientes leales."
                                        : "Perfecto si necesitas flexibilidad máxima. Crea pruebas gratis de 3-7 días, o combina diferentes duraciones para optimizar tu inventario."}
                                    </p>
                                  </div>

                                  {/* CTA */}
                                  <button
                                    onClick={() => setPlanSeleccionado(plan)}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                  >
                                    Comprar ahora
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-neutral-500">
                        No hay planes disponibles
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="py-20 bg-neutral-900/50">
          <div className="max-w-[1400px] mx-auto px-6 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-neutral-200 mb-3">
                ¿Dudas? Contacta a nuestro equipo
              </h2>
              <p className="text-neutral-400">Soporte prioritario 24/7</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <a
                href="https://t.me/+rAuU1_uHGZthMWZh"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 rounded-lg p-8 text-center transition-all"
              >
                <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-200 mb-2">
                  Telegram
                </h3>
                <p className="text-sm text-neutral-400 mb-4">
                  Respuesta inmediata
                </p>
                <span className="inline-flex items-center gap-2 text-purple-400 font-medium group-hover:gap-3 transition-all">
                  Contactar <ChevronRight className="w-4 h-4" />
                </span>
              </a>

              <a
                href="https://chat.whatsapp.com/LU16SUptp4xFQ4zTNta7Ja"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 rounded-lg p-8 text-center transition-all"
              >
                <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-200 mb-2">
                  WhatsApp
                </h3>
                <p className="text-sm text-neutral-400 mb-4">
                  Ayuda especializada
                </p>
                <span className="inline-flex items-center gap-2 text-purple-400 font-medium group-hover:gap-3 transition-all">
                  Unirse <ChevronRight className="w-4 h-4" />
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* Error Toast */}
      </main>

      {/* Mobile Bottom Sheet */}
      <BottomSheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Planes Revendedor"
        subtitle="Elige tu sistema"
      >
        {revendedorSections.map((section) =>
          section.isGroup ? (
            // Grupo colapsable
            <button
              key={section.id}
              onClick={section.onToggle}
              className={`w-full flex items-center gap-3 px-4 py-4 border-b border-neutral-800/30 ${
                activeSection === section.id
                  ? "bg-purple-600/10 border-l-4 border-purple-500"
                  : "hover:bg-neutral-800"
              }`}
            >
              {section.icon}
              <div className="text-left flex-1">
                <div className="font-medium">{section.label}</div>
                <div className="text-xs text-gray-400">{section.subtitle}</div>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  section.isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          ) : section.isPlan ? (
            // Plan individual
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                const element = document.getElementById(
                  `plan-${section.planId}`
                );
                if (element) {
                  element.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 ml-8 border-b border-neutral-800/20 ${
                activeSection === section.id
                  ? "bg-purple-600/5 border-l-2 border-purple-500"
                  : "hover:bg-neutral-800/50"
              }`}
            >
              {section.icon}
              <div className="text-left">
                <div className="font-medium text-sm">{section.label}</div>
                <div className="text-xs text-gray-500">{section.subtitle}</div>
              </div>
            </button>
          ) : (
            // Sección regular
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                const element = document.getElementById(`plan-${section.id}`);
                if (element) {
                  const headerOffset = 120; // Offset para móvil (sin sidebar)
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition =
                    elementPosition + window.pageYOffset - headerOffset;

                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-4 border-b border-neutral-800/30 ${
                activeSection === section.id
                  ? "bg-purple-600/10 border-l-4 border-purple-500"
                  : "hover:bg-neutral-800"
              }`}
            >
              {section.icon}
              <div className="text-left">
                <div className="font-medium">{section.label}</div>
                <div className="text-xs text-gray-400">{section.subtitle}</div>
              </div>
            </button>
          )
        )}
      </BottomSheet>

      {/* Modals */}
      {planSeleccionado && (
        <CheckoutModalRevendedor
          plan={planSeleccionado}
          onClose={() => setPlanSeleccionado(null)}
          onConfirm={handleConfirmarCompra}
          loading={comprando}
        />
      )}

      {mostrarRenovacion && (
        <RenovacionModalRevendedor
          isOpen={mostrarRenovacion}
          onClose={() => setMostrarRenovacion(false)}
        />
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md">
          <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="text-red-400">⚠️</div>
              <p className="text-sm text-red-200 flex-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {planSeleccionado && (
        <CheckoutModalRevendedor
          plan={planSeleccionado}
          onClose={() => setPlanSeleccionado(null)}
          onConfirm={handleConfirmarCompra}
          loading={comprando}
        />
      )}
      <RenovacionModalRevendedor
        isOpen={mostrarRenovacion}
        onClose={() => setMostrarRenovacion(false)}
      />
    </div>
  );
}
