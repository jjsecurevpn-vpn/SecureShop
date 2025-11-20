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
      <div className="p-6 sm:p-8 lg:p-10 xl:p-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl xl:text-5xl">
              {plan.nombre}
            </h3>
            <p className="mt-3 text-lg font-medium text-gray-600 sm:text-xl lg:text-2xl xl:text-3xl">
              {plan.max_users.toLocaleString()} {unitLabel}
            </p>
          </div>

          <div className="text-center sm:text-right">
            <div className="text-4xl font-black text-gray-900 sm:text-5xl lg:text-6xl xl:text-7xl">
              ${plan.precio.toLocaleString("es-AR")}
            </div>
            <p className="mt-2 text-sm font-medium text-gray-500 sm:text-base lg:text-lg">
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
            className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white px-6 py-8 text-center sm:px-8 lg:px-12 lg:py-12"
          >
            <p className="text-base font-semibold text-gray-500 sm:text-lg">
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
            className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white px-6 py-10 sm:px-8 lg:px-12 lg:py-14"
          >
            <p className="mb-8 text-center text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
              ¿Confirmar compra de <span className="text-purple-600">{plan.nombre}</span>?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleConfirm();
                }}
                className="rounded-2xl bg-gray-200 py-5 font-bold text-gray-700 text-lg transition hover:bg-gray-300 sm:text-xl lg:text-2xl"
              >
                No, cancelar
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirm();
                  onToggleConfirm();
                }}
                className={`flex items-center justify-center gap-3 rounded-2xl py-5 font-bold text-white text-lg transition hover:scale-105 sm:text-xl lg:text-2xl ${
                  isCredits
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                Sí, ir al pago
                <ArrowRight className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>
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
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="mx-auto max-w-7xl">

        {/* Grupos de planes */}
        <div className="space-y-24 sm:space-y-28 lg:space-y-32 xl:space-y-40">
          {groups.map((group) => (
            <section key={group.id} className="scroll-mt-20">
              <div className="text-center mb-12 sm:mb-16 lg:mb-20 xl:mb-24">
                <div className="inline-flex items-center gap-3 rounded-full px-6 sm:px-8 lg:px-10 xl:px-12 py-3 sm:py-4 lg:py-5 xl:py-6 text-base sm:text-lg font-bold uppercase tracking-wider">
                  {group.id === "creditos" ? (
                    <div className="bg-emerald-100 text-emerald-700">
                      <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8 inline mr-2" />
                      Sistema de Créditos
                    </div>
                  ) : (
                    <div className="bg-purple-100 text-purple-700">
                      <Calendar className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8 inline mr-2" />
                      Suscripción Mensual
                    </div>
                  )}
                </div>

                <h2 className="mt-6 sm:mt-8 lg:mt-10 xl:mt-12 text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900">
                  {group.title}
                </h2>
                <p className="mt-3 sm:mt-4 lg:mt-5 xl:mt-6 text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  {group.subtitle}
                </p>

                {group.recommended && (
                  <div className="mt-6 sm:mt-8 lg:mt-10 xl:mt-12 inline-flex items-center gap-3 rounded-full bg-amber-100 px-8 sm:px-10 lg:px-12 xl:px-16 py-4 sm:py-5 lg:py-6 xl:py-8 text-lg sm:text-xl lg:text-xl xl:text-2xl font-bold text-amber-900">
                    <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 xl:h-9 xl:w-9" />
                    Más elegido por revendedores
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10 xl:gap-12 max-w-6xl mx-auto">
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
        <div className="mt-32 max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 overflow-x-auto">

          <h3 className="text-center text-4xl font-black text-gray-900 mb-12">
            Comparación de sistemas
          </h3>

          <div className="border border-gray-200 rounded-lg overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 text-gray-700 min-w-[800px]">

            {/* HEADERS */}
            <thead>
              <tr>
                <th className="bg-white sticky left-0 z-10 border-b border-gray-200 text-left px-6 py-5 text-xl font-bold text-gray-900">
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
        <div className="mt-32 sm:mt-36 lg:mt-40 xl:mt-48 max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8 lg:p-10 xl:p-12">
          <h3 className="text-center text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 mb-8 sm:mb-10 lg:mb-12 xl:mb-16">
            Preguntas frecuentes
          </h3>
          <div className="space-y-6 sm:space-y-8">
            {[
              { q: "¿Puedo usar ambos sistemas al mismo tiempo?", a: "¡Sí! La mayoría de revendedores combinan los dos según el tipo de cliente." },
              { q: "¿Los créditos caducan?", a: "Sí, los créditos tienen una fecha de expiración." },
              { q: "¿Puedo vender cuentas de 6 meses o 1 año?", a: "Sí, solo gastás los créditos correspondientes (6 o 12 créditos)." },
              { q: "¿La suscripción mensual se renueva sola?", a: "No, es manual. Tú decides cada mes si renovás o no." },
            ].map(({ q, a }) => (
              <details key={q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 sm:py-5 lg:py-6 xl:py-8">
                  <span className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-gray-900 group-hover:text-purple-600 transition">
                    {q}
                  </span>
                  <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-gray-400 group-open:rotate-180 transition" />
                </summary>
                <p className="mt-3 sm:mt-4 lg:mt-5 xl:mt-6 text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 pl-1 max-w-4xl">
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