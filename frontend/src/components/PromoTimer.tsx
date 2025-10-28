import { Clock, Zap, Flame } from 'lucide-react';
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

  // Calcular configuración de colores basado en tiempo restante
  const getColorConfig = () => {
    if (porcentaje > 50) {
      return {
        text: 'text-emerald-400',
        glow: 'shadow-emerald-500/30',
        border: 'border-emerald-500/40',
        progress: 'bg-emerald-500',
        icon: <Zap className="w-4 h-4" />
      };
    }
    if (porcentaje > 20) {
      return {
        text: 'text-amber-400',
        glow: 'shadow-amber-500/30',
        border: 'border-amber-500/40',
        progress: 'bg-amber-500',
        icon: <Flame className="w-4 h-4" />
      };
    }
    return {
      text: 'text-rose-400',
      glow: 'shadow-rose-500/30',
      border: 'border-rose-500/40',
      progress: 'bg-rose-500',
      icon: <Clock className="w-4 h-4" />
    };
  };

  const colorConfig = getColorConfig();

  return (
    <div className="w-full flex justify-center px-4 py-3">
      <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full border ${colorConfig.border} bg-slate-900/60 backdrop-blur-md ${colorConfig.glow} shadow-lg transition-all duration-300 hover:scale-105`}>
        {/* Icono animado */}
        <div className={`${colorConfig.text} animate-pulse`}>
          {colorConfig.icon}
        </div>
        
        {/* Tiempo */}
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${colorConfig.text}`}>
            Oferta termina en
          </span>
          <span className="text-sm font-mono font-bold text-white bg-slate-800/80 px-2.5 py-0.5 rounded-md">
            {tiempo}
          </span>
        </div>

        {/* Mini barra de progreso */}
        <div className="w-16 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorConfig.progress} transition-all duration-500`}
            style={{ width: `${Math.max(0, Math.min(100, porcentaje))}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export const PromoTimer = memo(PromoTimerComponent);