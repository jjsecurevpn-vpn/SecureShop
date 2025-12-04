import { Zap, Check } from "lucide-react";
import { protonColors } from "../../../styles/colors";
import { Plan } from "../../../types";

interface PlanCardProps {
  plan: Plan;
  precioPorDia: string | number;
  isPopular?: boolean;
  onSelect: () => void;
}

export function PlanCard({ plan, isPopular = false, onSelect }: PlanCardProps) {
  return (
    <div
      className={`
        relative flex h-full flex-col rounded-2xl p-6 md:p-8 transition-all duration-300
        ${isPopular 
          ? 'ring-2 scale-[1.02]' 
          : 'hover:scale-[1.01]'
        }
      `}
      style={{
        background: isPopular 
          ? `linear-gradient(135deg, rgb(30, 20, 60) 0%, rgb(20, 12, 45) 100%)`
          : `linear-gradient(135deg, rgb(25, 18, 50) 0%, rgb(15, 10, 35) 100%)`,
        border: isPopular 
          ? `2px solid ${protonColors.green[300]}`
          : 'none',
        boxShadow: isPopular 
          ? `0 0 30px rgba(190, 242, 100, 0.15)` 
          : undefined,
      }}
    >
      {/* Badge "Oferta Relámpago" */}
      {isPopular && (
        <div 
          className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
          style={{
            backgroundColor: protonColors.green[300],
            color: protonColors.purple[900],
          }}
        >
          <Zap className="h-3.5 w-3.5" />
          Oferta Relámpago
        </div>
      )}

      {/* Header */}
      <div className="mb-6 pt-2">
        <div className="flex items-center justify-between mb-3">
          <span 
            className="text-base font-semibold"
            style={{ color: protonColors.white }}
          >
            {plan.dias} días
          </span>
        </div>
        <h3 
          className="text-lg font-semibold"
          style={{ color: 'rgba(255, 255, 255, 0.9)' }}
        >
          {plan.connection_limit === 1 
            ? '1 dispositivo' 
            : `Hasta ${plan.connection_limit} dispositivos`
          }
        </h3>
      </div>

      {/* Precio */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span 
            className="text-3xl md:text-4xl font-bold"
            style={{ color: protonColors.green[300] }}
          >
            ${plan.precio}
          </span>
          <span 
            className="text-sm"
            style={{ color: 'rgba(255, 255, 255, 0.5)' }}
          >
            ARS
          </span>
        </div>
      </div>

      {/* Features */}
      <ul className="flex-1 space-y-3 mb-6">
        {[
          `Conecta ${plan.connection_limit} dispositivos a la vez`,
          'Máxima velocidad de VPN',
          'Servidores premium en +15 países',
          'Soporte prioritario 24/7',
        ].map((feature, index) => (
          <li 
            key={index} 
            className="flex items-center gap-3 text-sm"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            <Check 
              className="h-4 w-4 flex-shrink-0" 
              style={{ color: protonColors.green[300] }} 
            />
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        onClick={onSelect}
        className="w-full rounded-full px-6 py-3 text-sm font-bold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={
          isPopular
            ? {
                backgroundColor: protonColors.green[300],
                color: protonColors.purple[900],
              }
            : {
                backgroundColor: 'transparent',
                color: protonColors.white,
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }
        }
        onMouseEnter={(e) => {
          if (isPopular) {
            e.currentTarget.style.backgroundColor = protonColors.green[400];
          } else {
            e.currentTarget.style.borderColor = protonColors.green[300];
            e.currentTarget.style.color = protonColors.green[300];
          }
        }}
        onMouseLeave={(e) => {
          if (isPopular) {
            e.currentTarget.style.backgroundColor = protonColors.green[300];
          } else {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.color = protonColors.white;
          }
        }}
      >
        Obtener la oferta
      </button>

      {/* Footer text */}
      <p 
        className="mt-4 text-xs text-center"
        style={{ color: 'rgba(255, 255, 255, 0.5)' }}
      >
        Garantía de reembolso durante 30 días
      </p>
    </div>
  );
}
