import { Zap, Check, Star } from "lucide-react";
import { Plan } from "../../../types";

interface PlanCardProps {
  plan: Plan;
  precioPorDia: string | number;
  isPopular?: boolean;
  onSelect: () => void;
}

export function PlanCard({ plan, precioPorDia, isPopular = false, onSelect }: PlanCardProps) {
  return (
    <div
      className={`
        relative flex h-full flex-col rounded-2xl p-6 md:p-8 transition-all duration-300 bg-white
        ${isPopular 
          ? 'ring-2 ring-purple-500 shadow-xl shadow-purple-500/10 scale-[1.02]' 
          : 'border border-gray-200 hover:border-purple-300 hover:shadow-lg hover:scale-[1.01]'
        }
      `}
    >
      {/* Badge "Más Popular" */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
          <Star className="h-3.5 w-3.5 fill-current" />
          Más Popular
        </div>
      )}

      {/* Header */}
      <div className="mb-6 pt-2">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
            <Zap className="h-3 w-3" />
            {plan.dias} días
          </span>
          {isPopular && (
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Mejor valor
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          {plan.connection_limit === 1 
            ? '1 dispositivo' 
            : `Hasta ${plan.connection_limit} dispositivos`
          }
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Conexión simultánea
        </p>
      </div>

      {/* Precio */}
      <div className="mb-6 pb-6 border-b border-gray-100">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl md:text-5xl font-bold text-gray-900">
            ${plan.precio}
          </span>
          <span className="text-sm text-gray-500 ml-1">
            ARS
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Equivale a <span className="font-semibold text-purple-600">${precioPorDia}/día</span>
        </p>
      </div>

      {/* Features */}
      <ul className="flex-1 space-y-3 mb-6">
        {[
          `Conecta ${plan.connection_limit} dispositivos a la vez`,
          'Velocidad ilimitada de VPN',
          'Servidores premium en +15 países',
          'Soporte prioritario 24/7',
          'Sin registros de actividad',
        ].map((feature, index) => (
          <li 
            key={index} 
            className="flex items-start gap-3 text-sm text-gray-600"
          >
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
              <Check className="h-3 w-3 text-emerald-600" />
            </div>
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        onClick={onSelect}
        className={`w-full rounded-xl px-6 py-3.5 text-sm font-bold transition-all duration-200 ${
          isPopular
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25'
            : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        Obtener plan
      </button>

      {/* Footer text */}
      <p className="mt-4 text-xs text-center text-gray-400">
        ✓ Pago seguro con Mercado Pago
      </p>
    </div>
  );
}
