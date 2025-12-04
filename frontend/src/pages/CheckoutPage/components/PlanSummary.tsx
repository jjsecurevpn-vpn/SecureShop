import { Check } from "lucide-react";
import { Plan } from "../../../types";
import { CHECKOUT_SECTIONS } from "../constants";
import { calcularPrecioFinal, calcularPrecioPorDia } from "../utils";

interface PlanSummaryProps {
  plan: Plan;
  descuentoVisual: number;
}

export const PlanSummary = ({ plan, descuentoVisual }: PlanSummaryProps) => {
  const precioFinal = calcularPrecioFinal(plan, descuentoVisual);
  const precioPorDia = calcularPrecioPorDia(precioFinal, plan.dias);

  return (
    <div style={{
      background: `linear-gradient(135deg, rgb(25, 18, 50) 0%, rgb(15, 10, 35) 100%)`,
      borderRadius: '0.5rem',
      padding: 'clamp(20px, 5vw, 40px)',
      color: 'white'
    }} className="space-y-6 text-white rounded-lg">
      {/* Plan Info */}
      <div>
        <div className="text-sm text-gray-400 mb-2">{CHECKOUT_SECTIONS.PLAN_SELECTED}</div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-1">
          {plan.nombre}
        </h2>
        <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-400">
          {plan.dias} días de acceso
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-white/20" />

      {/* Price Breakdown */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs sm:text-sm lg:text-base xl:text-lg">
          <span className="text-gray-400">{CHECKOUT_SECTIONS.SUBTOTAL}</span>
          <span className="text-white">
            ${plan.precio.toLocaleString("es-AR")}
          </span>
        </div>

        {descuentoVisual > 0 && (
          <div className="flex justify-between items-center text-xs sm:text-sm lg:text-base xl:text-lg text-emerald-400">
            <span>{CHECKOUT_SECTIONS.DISCOUNT}</span>
            <span>-${descuentoVisual.toLocaleString("es-AR")}</span>
          </div>
        )}

        <div className="border-t border-white/20 pt-3 flex justify-between items-center">
          <span className="text-white font-medium">{CHECKOUT_SECTIONS.TOTAL}</span>
          <span className="text-3xl font-bold text-indigo-400">
            ${precioFinal.toLocaleString("es-AR")}
          </span>
        </div>

        <p className="text-xs text-gray-400 text-right pt-2">
          ${precioPorDia}{CHECKOUT_SECTIONS.PER_DAY}
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-white/20" />

      {/* Plan Details */}
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <Check className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-white">
              {plan.connection_limit} dispositivo{plan.connection_limit !== 1 ? "s" : ""}
            </div>
            <div className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-400">
              {CHECKOUT_SECTIONS.CONNECTIONS}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Check className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-white">
              {CHECKOUT_SECTIONS.UNLIMITED_SPEED}
            </div>
            <div className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-400">
              {CHECKOUT_SECTIONS.NO_RESTRICTIONS}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Check className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-white">
              {CHECKOUT_SECTIONS.SUPPORT_24_7}
            </div>
            <div className="text-xs sm:text-sm lg:text-base xl:text-lg text-gray-400">
              {CHECKOUT_SECTIONS.ANYTIME_ASSISTANCE}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};