import { useState } from "react";
import {
  CreditCard,
  Calendar,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Check,
} from "lucide-react";
import { PlanRevendedor } from "../../../types";
import { PlanGroup } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { BodyText, CardTitle, SectionTitle, SmallText } from "../../../components/Typography";

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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`cursor-pointer overflow-hidden rounded-2xl bg-white border transition-all duration-300 ${
        isConfirming 
          ? "ring-2 ring-purple-400 shadow-xl border-purple-200" 
          : "border-gray-200 hover:border-purple-200 hover:shadow-lg"
      }`}
      whileHover={!isConfirming ? { y: -4 } : {}}
      whileTap={!isConfirming ? { scale: 0.98 } : {}}
    >
      {/* Header responsive */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <CardTitle as="h3" className="text-lg sm:text-xl text-purple-800">
              {plan.nombre}
            </CardTitle>
            <SmallText className="mt-1 text-sm">
              {plan.max_users.toLocaleString()} {unitLabel}
            </SmallText>
          </div>

          <div className="text-center sm:text-right">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              ${plan.precio.toLocaleString("es-AR")}
            </div>
            <SmallText className="mt-1 text-xs">
              {isCredits ? "pago único" : "por mes"}
            </SmallText>
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
            className="border-t px-5 py-4 text-center bg-purple-50/50 border-purple-100"
          >
            <p className="text-sm font-medium text-purple-700">
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
            className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white px-5 py-6"
          >
            <p className="mb-5 text-center text-base font-semibold text-gray-900">
              ¿Confirmar compra de <span className="text-purple-600">{plan.nombre}</span>?
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onToggleConfirm();
                }}
                className="px-4 py-2.5 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-medium text-sm hover:border-gray-300 transition-all"
              >
                No, cancelar
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirm();
                  onToggleConfirm();
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium text-sm transition-all bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
              >
                Sí, ir al pago
                <ArrowRight className="h-4 w-4" />
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
    <div className="bg-white py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Grupos de planes */}
        <div className="space-y-12 sm:space-y-16 lg:space-y-20">
          {groups.map((group, groupIndex) => (
            <motion.section
              key={group.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
              className="scroll-mt-20"
            >
              <div className="text-center mb-8 sm:mb-10">
                {group.id === "creditos" ? (
                  <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4 bg-purple-50 border border-purple-200/60 text-purple-700 text-xs font-semibold">
                    <CreditCard className="h-4 w-4" />
                    Sistema de Créditos
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4 bg-purple-50 border border-purple-200/60 text-purple-700 text-xs font-semibold">
                    <Calendar className="h-4 w-4" />
                    Suscripción Mensual
                  </span>
                )}

                <SectionTitle className="mb-3">{group.title}</SectionTitle>
                <BodyText className="text-sm sm:text-base max-w-3xl mx-auto">{group.subtitle}</BodyText>

                {group.recommended && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-purple-50 border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-700">
                    <Sparkles className="h-4 w-4" />
                    Más elegido por revendedores
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
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
            </motion.section>
          ))}
        </div>

        {/* TABLA DE COMPARACIÓN */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 sm:mt-20 max-w-5xl mx-auto"
        >
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4 bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold">
              📊 Comparativa
            </span>
            <CardTitle as="h3" className="text-2xl sm:text-3xl">Comparación de sistemas</CardTitle>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0 text-gray-700 min-w-[700px]">
                <thead>
                  <tr>
                    <th className="bg-gray-50 border-b border-gray-200 text-left px-5 py-4 text-sm font-semibold text-gray-900">
                      Característica
                    </th>
                    <th className="bg-purple-50/50 border-b border-l border-gray-200 px-5 py-4 text-center text-sm font-semibold text-purple-700">
                      Sistema de Créditos
                    </th>
                    <th className="bg-purple-50/50 border-b border-l border-gray-200 px-5 py-4 text-center text-sm font-semibold text-purple-700">
                      Suscripción Mensual
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr>
                    <td className="border-b border-gray-100 px-5 py-4 font-medium">Tipo de pago</td>
                    <td className="border-b border-l border-gray-100 px-5 py-4 text-center">Pago único por créditos</td>
                    <td className="border-b border-l border-gray-100 px-5 py-4 text-center">Suscripción mensual</td>
                  </tr>
                  <tr className="bg-gray-50/50">
                    <td className="border-b border-gray-100 px-5 py-4 font-medium">Expiración</td>
                    <td className="border-b border-l border-gray-100 px-5 py-4 text-center">Créditos con fecha de vencimiento</td>
                    <td className="border-b border-l border-gray-100 px-5 py-4 text-center">Cupos se liberan al finalizar el mes</td>
                  </tr>
                  <tr>
                    <td className="border-b border-gray-100 px-5 py-4 font-medium">Flexibilidad de duración</td>
                    <td className="border-b border-l border-gray-100 px-5 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-purple-600">
                        <Check className="w-4 h-4" /> Alta (1 mes, 3 meses, 1 año…)
                      </span>
                    </td>
                    <td className="border-b border-l border-gray-100 px-5 py-4 text-center text-gray-500">Solo mensual</td>
                  </tr>
                  <tr className="bg-gray-50/50">
                    <td className="border-b border-gray-100 px-5 py-4 font-medium">Ideal para</td>
                    <td className="border-b border-l border-gray-100 px-5 py-4 text-center">Ventas de diferentes duraciones</td>
                    <td className="border-b border-l border-gray-100 px-5 py-4 text-center">Clientes de 30 días con rotación</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4 font-medium">Reutilización de cupos</td>
                    <td className="border-l border-gray-100 px-5 py-4 text-center text-gray-500">No aplica</td>
                    <td className="border-l border-gray-100 px-5 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-purple-600">
                        <Check className="w-4 h-4" /> Ilimitada en el mes
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* PREGUNTAS FRECUENTES */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 sm:mt-20 max-w-3xl mx-auto"
        >
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4 bg-purple-50 border border-purple-200/60 text-purple-700 text-xs font-semibold">
              ❓ FAQ
            </span>
            <CardTitle as="h3" className="text-2xl sm:text-3xl">Preguntas frecuentes</CardTitle>
          </div>

          <div className="space-y-3">
            {[
              { q: "¿Puedo usar ambos sistemas al mismo tiempo?", a: "¡Sí! La mayoría de revendedores combinan los dos según el tipo de cliente." },
              { q: "¿Los créditos caducan?", a: "Sí, los créditos tienen una fecha de expiración." },
              { q: "¿Puedo vender cuentas de 6 meses o 1 año?", a: "Sí, solo gastás los créditos correspondientes (6 o 12 créditos)." },
              { q: "¿La suscripción mensual se renueva sola?", a: "No, es manual. Tú decides cada mes si renovás o no." },
            ].map(({ q, a }) => (
              <details key={q} className="group bg-white border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4">
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition">
                    {q}
                  </span>
                  <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="px-5 pb-4 text-sm text-gray-600">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}