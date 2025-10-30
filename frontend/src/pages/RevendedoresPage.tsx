import { useState, useEffect } from "react";
import {
  Users,
  Shield,
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
} from "lucide-react";
import CheckoutModalRevendedor from "../components/CheckoutModalRevendedor";
import RenovacionModalRevendedor from "../components/RenovacionModalRevendedor";
import HeroReventa from "../components/HeroReventa";
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

  useEffect(() => {
    cargarPlanes();
  }, []);

  const cargarPlanes = async () => {
    try {
      const planos = await apiService.obtenerPlanesRevendedores(true);
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
    <div className="min-h-screen bg-[#181818] md:ml-14">
      <HeroReventa />

      {/* Plans Section */}
      <section className="py-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8">
          {/* Header */}
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-200 mb-4">
              Planes de Revendedor
            </h2>
            <p className="text-lg text-neutral-400 mb-8">
              Elige el tipo de cuenta que mejor se adapte a tu modelo de negocio
            </p>
            <button
              onClick={() => setMostrarRenovacion(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              ¿Ya eres revendedor? Renueva aquí
            </button>
          </div>

          {/* Benefits Banner */}
          <div className="mb-12 bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-2 font-semibold text-neutral-200">
                <Shield className="w-4 h-4 text-purple-400" />
                Todos los planes incluyen:
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-purple-400" /> Panel
                  profesional
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-purple-400" /> Soporte 24/7
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-purple-400" /> Activación
                  instantánea
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-purple-400" /> Sin límites
                </span>
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-neutral-200 mb-6 text-center">
              ¿Cuál elegir?
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <Zap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h4 className="font-semibold text-emerald-300">
                    Elige CRÉDITOS si...
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-neutral-300">
                  <li className="flex gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    Quieres ofrecer planes estándar (30+ días)
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    Buscas suscripciones predecibles
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    Necesitas modelo simple
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    Retención a largo plazo
                  </li>
                </ul>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <Gift className="w-5 h-5 text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-blue-300">
                    Elige VALIDEZ si...
                  </h4>
                </div>
                <ul className="space-y-2 text-sm text-neutral-300">
                  <li className="flex gap-2">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    Necesitas máxima flexibilidad
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    Crear pruebas gratis (3-7 días)
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    Optimizar tu inventario
                  </li>
                  <li className="flex gap-2">
                    <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    Cuentas variables
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Plans Groups */}
          <div className="space-y-12">
            {groupedPlans.map((group) => (
              <div key={group.title}>
                {/* Group Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg border ${group.accent}`}>
                      <div className={group.accentText}>{group.icon}</div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-neutral-200 flex items-center gap-2">
                        {group.title}
                        {group.recommended && (
                          <span className="text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
                            <Star className="w-3 h-3 inline mr-1" />
                            Recomendado
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-neutral-500">
                        {group.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-4">
                    <p className="text-sm text-neutral-300 leading-relaxed">
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
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plans List */}
                {group.items.length > 0 ? (
                  <div className="space-y-3">
                    {group.items.map((plan: PlanRevendedor) => (
                      <div
                        key={plan.id}
                        className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg overflow-hidden transition-all"
                      >
                        {/* Plan Header */}
                        <button
                          onClick={() => togglePlan(plan.id)}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-left">
                              <div className="text-sm font-semibold text-neutral-200">
                                {plan.nombre}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {plan.account_type === "credit"
                                  ? `${creditMonths(plan)} mes${
                                      creditMonths(plan) > 1 ? "es" : ""
                                    }`
                                  : "30 días"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-2xl font-bold text-emerald-400">
                                ${plan.precio.toLocaleString("es-AR")}
                              </div>
                            </div>
                            <ChevronRight
                              className={`w-5 h-5 text-neutral-400 transition-transform ${
                                expandedPlanId === plan.id ? "rotate-90" : ""
                              }`}
                            />
                          </div>
                        </button>

                        {/* Expanded Content */}
                        {expandedPlanId === plan.id && (
                          <div className="border-t border-neutral-800 bg-neutral-900/50">
                            <div className="p-6 space-y-6">
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
                                        <span>
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
                                        <span>
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
                                        <span>
                                          Crea cuentas de{" "}
                                          <strong>30 días o más</strong>
                                        </span>
                                      </div>
                                      <div className="flex items-start gap-2 text-sm text-neutral-300">
                                        <Users
                                          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${group.accentText}`}
                                        />
                                        <span>
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
                                        <span>
                                          <strong>30 días</strong> totales para
                                          crear cuentas
                                        </span>
                                      </div>
                                      <div className="flex items-start gap-2 text-sm text-neutral-300">
                                        <Gift
                                          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${group.accentText}`}
                                        />
                                        <span>
                                          Flexibilidad: cada plan corresponde a{" "}
                                          <strong>30 días</strong>
                                        </span>
                                      </div>
                                      <div className="flex items-start gap-2 text-sm text-neutral-300">
                                        <TrendingUp
                                          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${group.accentText}`}
                                        />
                                        <span>
                                          Ejemplo: 1×30 días, 2×15 días, o
                                          combina
                                        </span>
                                      </div>
                                      <div className="flex items-start gap-2 text-sm text-neutral-300">
                                        <RefreshCw
                                          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${group.accentText}`}
                                        />
                                        <span>
                                          Al expirar,{" "}
                                          <strong>se libera el cupo</strong>{" "}
                                          automáticamente
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Use Case */}
                              <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-neutral-200 mb-2">
                                  Caso de uso ideal:
                                </h4>
                                <p className="text-sm text-neutral-400 leading-relaxed">
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
