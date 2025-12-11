import { useState } from "react";
import {
  CreditCard,
  Calendar,
  ArrowRight,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { PlanRevendedor } from "../../../types";
import { PlanGroup } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../components/Button";

interface PlanGroupsSectionProps {
  groups: PlanGroup[];
  onConfirmarCompra: (plan: PlanRevendedor) => void;
}

type ConfirmingPlan = { planId: number; groupId: string } | null;

const PlanCard = ({
  plan,
  group,
  isConfirming,
  onToggleConfirm,
  onConfirmarCompra,
}: {
  plan: PlanRevendedor;
  group: PlanGroup;
  isConfirming: boolean;
  onToggleConfirm: () => void;
  onConfirmarCompra: (plan: PlanRevendedor) => void;
}) => {
  const isCredits = group.id === "creditos";
  const unitLabel = isCredits ? "créditos" : "cupos mensuales";

  const handleConfirm = () => {
    onConfirmarCompra(plan);
  };

  return (
    <motion.div
      layout
      onClick={isConfirming ? undefined : onToggleConfirm}
      className={`cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl transition-all duration-300 ${
        isConfirming ? "ring-4 ring-purple-300 shadow-2xl" : "hover:shadow-2xl"
      }`}
      whileHover={!isConfirming ? { y: -6 } : {}}
      whileTap={!isConfirming ? { scale: 0.985 } : {}}
    >
      {/* Header responsive */}
      <div className="p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <h3 className="text-base font-serif font-medium text-gray-900 sm:text-lg md:text-xl">
              {plan.nombre}
            </h3>
            <p className="mt-2 text-xs font-medium text-gray-600 sm:text-sm md:text-base">
              {plan.max_users.toLocaleString()} {unitLabel}
            </p>
          </div>

          <div className="text-center sm:text-right">
            <div className="text-xl font-black text-gray-900 sm:text-2xl md:text-3xl">
              ${plan.precio.toLocaleString("es-AR")}
            </div>
            <p className="mt-1 text-xs font-medium text-gray-500">
              {isCredits ? "pago único" : "por mes"}
            </p>
          </div>
        </div>
      </div>

      {/* Footer con transición */}
      <AnimatePresence mode="wait">
        {!isConfirming ? (
          <motion.div
            key="buy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white px-4 py-4 text-center sm:px-6 lg:px-8"
          >
            <p className="text-sm font-semibold text-gray-500 sm:text-base">
              Haz clic para comprar →
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white px-4 py-6 sm:px-6 lg:px-8"
          >
            <p className="mb-6 text-center text-base font-bold text-gray-900 sm:text-lg">
              ¿Confirmar compra de <span className="text-purple-600">{plan.nombre}</span>?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-sm mx-auto">
              <Button
                variant="secondary"
                size="md"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onToggleConfirm();
                }}
              >
                No, cancelar
              </Button>

              <Button
                variant={isCredits ? "success" : "primary"}
                size="md"
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirm();
                  onToggleConfirm();
                }}
                className="flex items-center justify-center gap-2"
              >
                Sí, ir al pago
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function PlanGroupsSection({
  groups,
  onConfirmarCompra,
}: PlanGroupsSectionProps) {
  const [confirmingPlan, setConfirmingPlan] = useState<ConfirmingPlan>(null);

  const handleToggleConfirm = (planId: number, groupId: string) => {
    setConfirmingPlan((current) =>
      current?.planId === planId && current?.groupId === groupId
        ? null
        : { planId, groupId }
    );
  };

  const handleConfirm = (plan: PlanRevendedor) => {
    onConfirmarCompra(plan);
    setConfirmingPlan(null);
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="mx-auto max-w-7xl">

        {/* Grupos de planes */}
        <div className="space-y-8 md:space-y-12 xl:space-y-16">
          {groups.map((group) => (
            <section key={group.id} className="scroll-mt-20">
              <div className="text-center mb-8 sm:mb-10 lg:mb-12">
                <div className="inline-flex items-center gap-3 rounded-full px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 text-sm sm:text-base font-bold uppercase tracking-wider">
                  {group.id === "creditos" ? (
                    <div className="bg-emerald-100 text-emerald-700">
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 inline mr-2" />
                      Sistema de Créditos
                    </div>
                  ) : (
                    <div className="bg-purple-100 text-purple-700">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 inline mr-2" />
                      Suscripción Mensual
                    </div>
                  )}
                </div>

                <h2 className="mt-4 sm:mt-6 lg:mt-8 text-xl sm:text-2xl lg:text-3xl font-serif font-normal text-gray-900">
                  {group.title}
                </h2>
                <p className="mt-2 sm:mt-3 lg:mt-4 text-xs sm:text-sm lg:text-base text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  {group.subtitle}
                </p>

                {group.recommended && (
                  <div className="mt-4 sm:mt-6 lg:mt-8 inline-flex items-center gap-3 rounded-full bg-amber-100 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-base sm:text-lg lg:text-xl font-bold text-amber-900">
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                    Más elegido por revendedores
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
                {group.items.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    group={group}
                    isConfirming={
                      confirmingPlan?.planId === plan.id &&
                      confirmingPlan?.groupId === group.id
                    }
                    onToggleConfirm={() => handleToggleConfirm(plan.id, group.id)}
                    onConfirmarCompra={handleConfirm}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* TABLA DE COMPARACIÓN */}
        <div className="mt-16 max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 overflow-x-auto">

          <h3 className="text-center text-2xl font-serif font-normal text-gray-900 mb-8">
            Comparación de sistemas
          </h3>

          <div className="border border-gray-200 rounded-lg overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 text-gray-700 min-w-[800px]">

            {/* HEADERS */}
            <thead>
              <tr>
                <th className="bg-white border-b border-gray-200 text-left px-6 py-5 text-xl font-bold text-gray-900">
                  Característica
                </th>
                <th className="border-b border-l border-gray-200 px-6 py-5 text-center text-xl font-bold text-emerald-700">
                  Sistema de Créditos
                </th>
                <th className="border-b border-l border-gray-200 px-6 py-5 text-center text-xl font-bold text-purple-700">
                  Suscripción Mensual
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="text-lg">

              {/* Row */}
              <tr>
                <td className="border-b border-gray-200 px-6 py-6 font-medium">
                  Tipo de pago
                </td>
                <td className="border-b border-l border-gray-200 px-6 py-6 text-center">
                  Pago único por créditos
                </td>
                <td className="border-b border-l border-gray-200 px-6 py-6 text-center">
                  Suscripción mensual
                </td>
              </tr>

              <tr className="bg-gray-50">
                <td className="border-b border-gray-200 px-6 py-6 font-medium">
                  Expiración
                </td>
                <td className="border-b border-l border-gray-200 px-6 py-6 text-center">
                  Créditos con fecha de vencimiento
                </td>
                <td className="border-b border-l border-gray-200 px-6 py-6 text-center">
                  Cupos se liberan al finalizar el mes
                </td>
              </tr>

              <tr>
                <td className="border-b border-gray-200 px-6 py-6 font-medium">
                  Renovación automática
                </td>
                <td className="border-b border-l border-gray-200 px-6 py-6 text-center text-red-600">
                  ✗ No
                </td>
                <td className="border-b border-l border-gray-200 px-6 py-6 text-center text-red-600">
                  ✗ No
                </td>
              </tr>

              <tr className="bg-gray-50">
                <td className="border-b border-gray-200 px-6 py-6 font-medium">
                  Flexibilidad de duración
                </td>
                <td className="border-b border-l border-gray-200 px-6 py-6 text-center text-emerald-600">
                  ✓ Alta (1 mes, 3 meses, 1 año…)
                </td>
                <td className="border-b border-l border-gray-200 px-6 py-6 text-center text-red-600">
                  ✗ Solo mensual
                </td>
              </tr>

              <tr>
                <td className="border-b border-gray-200 px-6 py-6 font-medium">
                  Costo por cuenta
                </td>
                <td className="border-b border-l border-gray-200 px-6 py-6 text-center">
                  Variable según duración
                </td>
                <td className="border-b border-l border-gray-200 px-6 py-6 text-center">
                  Fijo por mes
                </td>
              </tr>

              <tr className="bg-gray-50">
                <td className="border-b border-gray-200 px-6 py-6 font-medium">
                  Ideal para
                </td>
                <td className="border-b border-l border-gray-200 px-6 py-6 text-center">
                  Ventas de diferentes duraciones
                </td>
                <td className="border-b border-l border-gray-200 px-6 py-6 text-center">
                  Clientes de 30 días con rotación
                </td>
              </tr>

              <tr>
                <td className="px-6 py-6 font-medium">
                  Reutilización de cupos
                </td>
                <td className="border-l border-gray-200 px-6 py-6 text-center text-red-600">
                  ✗ No aplica
                </td>
                <td className="border-l border-gray-200 px-6 py-6 text-center text-emerald-600">
                  ✓ Ilimitada en el mes
                </td>
              </tr>

            </tbody>
          </table>
          </div>
        </div>

        {/* PREGUNTAS FRECUENTES */}
        <div className="mt-16 sm:mt-20 lg:mt-24 max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 sm:p-6 lg:p-8">
          <h3 className="text-center text-xl sm:text-2xl lg:text-3xl font-serif font-normal text-gray-900 mb-6 sm:mb-8 lg:mb-10">
            Preguntas frecuentes
          </h3>
          <div className="space-y-4 sm:space-y-6">
            {[
              { q: "¿Puedo usar ambos sistemas al mismo tiempo?", a: "¡Sí! La mayoría de revendedores combinan los dos según el tipo de cliente." },
              { q: "¿Los créditos caducan?", a: "Sí, los créditos tienen una fecha de expiración." },
              { q: "¿Puedo vender cuentas de 6 meses o 1 año?", a: "Sí, solo gastás los créditos correspondientes (6 o 12 créditos)." },
              { q: "¿La suscripción mensual se renueva sola?", a: "No, es manual. Tú decides cada mes si renovás o no." },
            ].map(({ q, a }) => (
              <details key={q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between py-3 sm:py-4 lg:py-5">
                  <span className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition">
                    {q}
                  </span>
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-400 group-open:rotate-180 transition" />
                </summary>
                <p className="mt-2 sm:mt-3 lg:mt-4 text-xs sm:text-sm lg:text-base text-gray-600 pl-1 max-w-4xl">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}