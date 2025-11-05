import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Check,
  MessageCircle,
  Phone,
  Calendar,
  ChevronRight,
  Zap,
  ChevronDown,
  AlertCircle,
  BarChart3,
  Zap as Zap2,
  Clock,
  Users,
  CheckCircle,
  RefreshCw,
  DollarSign,
  Maximize,
} from "lucide-react";
import RenovacionModalRevendedor from "../components/RenovacionModalRevendedor";
import HeroReventa from "../components/HeroReventa";
import BottomSheet from "../components/BottomSheet";
import NavigationSidebar from "../components/NavigationSidebar";
import { PlanRevendedor } from "../types";
import { apiService } from "../services/api.service";

interface RevendedoresPageProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

export default function RevendedoresPage({ isMobileMenuOpen, setIsMobileMenuOpen }: RevendedoresPageProps) {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState<PlanRevendedor[]>([]);
  const [mostrarRenovacion, setMostrarRenovacion] = useState(false);
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
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
      items: planes.filter((p) => p.account_type === "credit"),
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
                ? "Sistema de créditos"
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

  const handleConfirmarCompra = (plan: PlanRevendedor) => {
    // Navegar a la página de checkout con el ID del plan
    navigate(`/checkout-revendedor?planId=${plan.id}`);
  };

  return (
    <div className="min-h-screen bg-[#181818]">
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
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
            {/* Header */}
            <div className="mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-neutral-100 mb-4">
                Planes de Revendedor
              </h1>
              <p className="text-xl text-neutral-400">
                Dos sistemas diseñados para adaptarse a tu modelo de negocio
              </p>
            </div>

            {/* Plans Grid */}
            <div className="space-y-16">
              {groupedPlans.map((group) => (
                <div
                  key={group.id}
                  id={`plan-${group.id}`}
                  className="space-y-8"
                >
                  {/* Group Header */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-xl border ${group.accent} flex-shrink-0`}
                      >
                        <div className={group.accentText}>{group.icon}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h2 className="text-3xl font-bold text-neutral-100">
                            {group.title}
                          </h2>
                          {group.recommended && (
                            <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-sm font-medium">
                              <Star className="w-3.5 h-3.5" />
                              Recomendado
                            </span>
                          )}
                        </div>
                        <p className="text-lg text-neutral-300 font-medium">
                          {group.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Main Description */}
                    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p- rounded-xl p-4">
                      <p className="text-neutral-300 leading-relaxed">
                        {group.mainDescription}
                      </p>
                    </div>

                    {/* Key Features */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {group.keyFeatures.map((feature, idx) => {
                        let IconComponent = null;
                        if (feature.icon === "zap") IconComponent = Zap2;
                        if (feature.icon === "clock") IconComponent = Clock;
                        if (feature.icon === "users") IconComponent = Users;
                        if (feature.icon === "check-circle") IconComponent = CheckCircle;
                        if (feature.icon === "refresh-cw") IconComponent = RefreshCw;
                        if (feature.icon === "dollar-sign") IconComponent = DollarSign;
                        if (feature.icon === "maximize") IconComponent = Maximize;
                        
                        return (
                          <div
                            key={idx}
                            className="bg-neutral-900/40 border border-neutral-800 rounded-xl p- rounded-xl p-4"
                          >
                            <div className="mb-2">
                              {IconComponent && <IconComponent className="w-6 h-6 text-neutral-300" />}
                            </div>
                            <h4 className="font-semibold text-neutral-200 mb-1">
                              {feature.title}
                            </h4>
                            <p className="text-sm text-neutral-400">
                              {feature.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Use Cases & Best For */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-neutral-200 mb-3 flex items-center gap-2">
                          <Check className={`w-4 h-4 ${group.accentText}`} />
                          Casos de uso ideales
                        </h4>
                        <ul className="space-y-2">
                          {group.useCases.map((useCase, idx) => (
                            <li
                              key={idx}
                              className={`flex gap-2 text-neutral-400 text-sm`}
                            >
                              <span className={`${group.accentText} flex-shrink-0`}>
                                ✓
                              </span>
                              <span>{useCase}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className={`border rounded-xl p- rounded-xl p-4 ${group.accent}`}>
                        <h4 className={`font-semibold ${group.accentText} mb-2`}>
                          Mejor para:
                        </h4>
                        <p className="text-sm text-neutral-300">
                          {group.bestFor}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Plans Cards */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-neutral-200">
                      Planes disponibles
                    </h3>
                    {group.items.length > 0 ? (
                      group.items.map((plan) => (
                        <div
                          key={plan.id}
                          id={`plan-${plan.id}`}
                          className={`bg-neutral-900 border rounded-xl overflow-hidden transition-all ${
                            expandedPlanId === plan.id
                              ? "ring-2 ring-purple-500/50 border-purple-500/50 bg-purple-500/5"
                              : "border-neutral-800 hover:border-neutral-700"
                          }`}
                        >
                          {/* Plan Header */}
                          <button
                            onClick={() => togglePlan(plan.id)}
                            className="w-full px-6 py-4 flex items-center justify-between gap-4 hover:bg-neutral-800/30 transition-colors"
                          >
                            <div className="text-left flex-1">
                              <div className="text-lg font-semibold text-neutral-200">
                                {plan.nombre}
                              </div>
                              <div className="text-sm text-neutral-500">
                                {group.id === "creditos"
                                  ? "Sistema de Créditos"
                                  : "Sistema de Validez"}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 flex-shrink-0">
                              <div className="text-right">
                                <div className="text-2xl font-bold text-emerald-400">
                                  ${plan.precio.toLocaleString("es-AR")}
                                </div>
                                <div className="text-xs text-neutral-500">
                                  $
                                  {(plan.precio / plan.max_users).toFixed(0)} por{" "}
                                  {group.id === "creditos"
                                    ? "crédito"
                                    : "usuario"}
                                </div>
                              </div>
                              <ChevronRight
                                className={`w-5 h-5 text-neutral-400 transition-transform ${
                                  expandedPlanId === plan.id ? "rotate-90" : ""
                                }`}
                              />
                            </div>
                          </button>

                          {/* Expanded Details */}
                          {expandedPlanId === plan.id && (
                            <div className="border-t border-neutral-800 bg-neutral-900/50">
                              <div className="p-6 space-y-6">
                                {group.id === "creditos" ? (
                                  <>
                                    <div>
                                      <h4 className="font-semibold text-neutral-200 mb-4">
                                        ¿Cómo funciona?
                                      </h4>
                                      <div className="space-y-3">
                                        <div className="flex gap-3 p-3 bg-neutral-800/30 rounded-xl">
                                          <div className="text-emerald-400 flex-shrink-0 font-bold min-w-6">
                                            1
                                          </div>
                                          <div>
                                            <p className="font-medium text-neutral-200">
                                              Compras {plan.max_users} créditos
                                            </p>
                                            <p className="text-sm text-neutral-400">
                                              Se almacenan en tu panel de control
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex gap-3 p-3 bg-neutral-800/30 rounded-xl">
                                          <div className="text-emerald-400 flex-shrink-0 font-bold min-w-6">
                                            2
                                          </div>
                                          <div>
                                            <p className="font-medium text-neutral-200">
                                              Cómo gastar tus créditos
                                            </p>
                                            <p className="text-sm text-neutral-400">
                                              30 días = 1 crédito | 60 días = 2 créditos | 90 días = 3 créditos | etc.
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex gap-3 p-3 bg-neutral-800/30 rounded-xl">
                                          <div className="text-emerald-400 flex-shrink-0 font-bold min-w-6">
                                            3
                                          </div>
                                          <div>
                                            <p className="font-medium text-neutral-200">
                                              Cada crédito = 1 conexión independiente
                                            </p>
                                            <p className="text-sm text-neutral-400">
                                              La cuenta se mantiene vigente incluso después de vencer tu suscripción
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p- rounded-xl p-4">
                                      <h4 className="font-semibold text-neutral-200 mb-3">
                                        Ejemplo de uso
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        <p className="text-neutral-300">
                                          Tienes {plan.max_users} créditos. Opciones:
                                        </p>
                                        <ul className="space-y-1 text-neutral-400 ml-4">
                                          <li>• {plan.max_users} cuentas de 30 días ({plan.max_users} × 1 crédito = {plan.max_users} créditos)</li>
                                          <li>• O {Math.floor(plan.max_users / 2)} cuentas de 60 días ({Math.floor(plan.max_users / 2)} × 2 créditos = {Math.floor(plan.max_users / 2) * 2} créditos)</li>
                                          <li>• O mezclar: 3 cuentas de 30 días (3 créditos) + 1 cuenta de 60 días (2 créditos) = 5 créditos total</li>
                                        </ul>
                                        <p className="text-neutral-300 mt-3">
                                          <strong>Cada crédito = 1 conexión independiente de 30 días</strong>
                                        </p>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div>
                                      <h4 className="font-semibold text-neutral-200 mb-4">
                                        ¿Cómo funciona?
                                      </h4>
                                      <div className="space-y-3">
                                        <div className="flex gap-3 p-3 bg-neutral-800/30 rounded-xl">
                                          <div className="text-blue-400 flex-shrink-0 font-bold min-w-6">
                                            1
                                          </div>
                                          <div>
                                            <p className="font-medium text-neutral-200">
                                              Pagas suscripción mensual de {plan.max_users} cupos
                                            </p>
                                            <p className="text-sm text-neutral-400">
                                              Tienes <strong className="text-blue-300">30 días</strong> para usar tus {plan.max_users} usuarios
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex gap-3 p-3 bg-neutral-800/30 rounded-xl">
                                          <div className="text-blue-400 flex-shrink-0 font-bold min-w-6">
                                            2
                                          </div>
                                          <div>
                                            <p className="font-medium text-neutral-200">
                                              Creas cuentas durante ese mes
                                            </p>
                                            <p className="text-sm text-neutral-400">
                                              Distribuye tus {plan.max_users} usuarios en diferentes cuentas (cualquier duración dentro del mes)
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex gap-3 p-3 bg-neutral-800/30 rounded-xl">
                                          <div className="text-blue-400 flex-shrink-0 font-bold min-w-6">
                                            3
                                          </div>
                                          <div>
                                            <p className="font-medium text-neutral-200">
                                              Al vencer tu suscripción, todos los usuarios expiran
                                            </p>
                                            <p className="text-sm text-neutral-400">
                                              Los usuarios dependen de tu suscripción, no son independientes como en Créditos
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p- rounded-xl p-4">
                                      <h4 className="font-semibold text-neutral-200 mb-3">
                                        Ejemplo de uso
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        <p className="text-neutral-300">
                                          Tienes plan de {plan.max_users} usuarios por 30 días:
                                        </p>
                                        <ul className="space-y-2 text-neutral-400 ml-4 font-mono">
                                          <li className="text-neutral-300">Día 1: <span className="text-blue-400">0/{plan.max_users}</span> usuarios</li>
                                          <li>→ Creas 3 cuentas de 20 días</li>
                                          <li className="text-neutral-300">Estado: <span className="text-blue-400">3/{plan.max_users}</span> usuarios</li>
                                          <li>→ Creas 2 cuentas de 10 días</li>
                                          <li className="text-neutral-300">Estado: <span className="text-blue-400">5/{plan.max_users}</span> usuarios</li>
                                          <li>→ Expiran las cuentas de 10 días (día 11)</li>
                                          <li className="text-neutral-300">Estado: <span className="text-blue-400">3/{plan.max_users}</span> usuarios</li>
                                          <li>→ Creas 2 nuevas cuentas de 19 días</li>
                                          <li className="text-neutral-300">Día 30: <span className="text-blue-300">Vence tu suscripción</span></li>
                                          <li className="text-neutral-300"><strong>Todos los usuarios expiran, sin importar su duración individual</strong></li>
                                        </ul>
                                      </div>
                                    </div>

                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p- rounded-xl p-4">
                                      <div className="flex gap-2">
                                        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                          <p className="font-semibold text-blue-300 mb-1">
                                            Diferencia clave con Créditos
                                          </p>
                                          <p className="text-sm text-blue-200">
                                            Los usuarios están vinculados a tu suscripción mensual. Si esta vence, todos expiran. En Créditos, cada cuenta es independiente y se mantiene vigente después de que la suscripción termina.
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}

                                <button
                                  onClick={() => handleConfirmarCompra(plan)}
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                  Comprar ahora
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
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
        <section className="py-20 border-t border-neutral-800 bg-gradient-to-b from-transparent to-neutral-900/30">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-neutral-200 mb-3">
                ¿Tienes dudas?
              </h2>
              <p className="text-neutral-400">
                Contacta a nuestro equipo de soporte
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <a
                href="https://t.me/+rAuU1_uHGZthMWZh"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 rounded-xl p- rounded-xl p-6 text-center transition-all"
              >
                <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-200 mb-2">
                  Telegram
                </h3>
                <p className="text-sm text-neutral-400">Respuesta inmediata</p>
              </a>

              <a
                href="https://chat.whatsapp.com/LU16SUptp4xFQ4zTNta7Ja"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 rounded-xl p- rounded-xl p-6 text-center transition-all"
              >
                <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-200 mb-2">
                  WhatsApp
                </h3>
                <p className="text-sm text-neutral-400">Ayuda especializada</p>
              </a>
            </div>
          </div>
        </section>
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
      <RenovacionModalRevendedor
        isOpen={mostrarRenovacion}
        onClose={() => setMostrarRenovacion(false)}
      />
    </div>
  );
}
