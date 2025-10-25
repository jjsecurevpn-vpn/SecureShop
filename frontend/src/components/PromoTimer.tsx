import { Clock } from 'lucide-react';
import { memo } from 'react';
import { usePromoTimer } from '../hooks/usePromoTimer';

/**
 * Componente que muestra el temporizador de promoción en tiempo real
 * Memoizado para evitar re-renders innecesarios
 */
function PromoTimerComponent() {
  const { promo_config, tiempo_restante_formateado, porcentaje_restante, loading } = usePromoTimer();

  // No mostrar nada si la promo no está activa
  if (!promo_config?.activa) {
    return null;
  }

  // No mostrar mientras carga
  if (loading) {
    return null;
  }

  // Valores por defecto si no están disponibles
  const porcentaje = porcentaje_restante ?? 0;
  const tiempo = tiempo_restante_formateado ?? 'Cargando...';

  // Calcular color basado en tiempo restante
  const getColorClass = () => {
    if (porcentaje > 50) return 'text-green-400';
    if (porcentaje > 20) return 'text-yellow-400';
    return 'text-red-500';
  };

  // Calcular color de borde basado en tiempo restante
  const getBorderColorClass = () => {
    if (porcentaje > 50) return 'border-green-400 bg-green-50 dark:bg-green-950';
    if (porcentaje > 20) return 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950';
    return 'border-red-500 bg-red-50 dark:bg-red-950';
  };

  // Calcular color de la barra de progreso
  const getProgressBarColor = () => {
    if (porcentaje > 50) return 'bg-green-500';
    if (porcentaje > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`w-full px-4 sm:px-6 lg:px-8 py-3 border-b-2 ${getBorderColorClass()} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 md:gap-4">
        <Clock className={`w-5 h-5 ${getColorClass()} animate-pulse flex-shrink-0`} />
        <div className="text-center flex-grow">
          <p className={`text-sm md:text-base font-bold ${getColorClass()} transition-colors duration-300`}>
            ⏱️ Promoción vence en: <span className="font-mono whitespace-nowrap">{tiempo}</span>
          </p>
          {/* Barra de progreso */}
          <div className="w-full max-w-xs mx-auto mt-2 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden shadow-sm">
            <div
              className={`h-full transition-all duration-300 ${getProgressBarColor()}`}
              style={{ width: `${Math.max(0, Math.min(100, porcentaje))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export const PromoTimer = memo(PromoTimerComponent);
