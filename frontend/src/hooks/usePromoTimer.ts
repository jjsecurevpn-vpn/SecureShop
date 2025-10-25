import { useEffect, useState, useRef, useCallback } from 'react';

interface PromoConfig {
  activa: boolean;
  activada_en: string | null;
  duracion_horas: number;
  auto_desactivar: boolean;
}

interface PromoTimerData {
  promo_config: PromoConfig;
  tiempo_restante_segundos: number;
  tiempo_restante_formateado: string;
  porcentaje_restante: number;
}

/**
 * Hook para obtener el estado de la promoción y el tiempo restante
 * Se actualiza cada segundo localmente sin hacer refetch continuo
 */
export function usePromoTimer() {
  const [data, setData] = useState<PromoTimerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const configRef = useRef<PromoConfig | null>(null);

  // Función para calcular el tiempo restante
  const calcularTiempoRestante = useCallback(
    (config: PromoConfig): { segundos: number; formateado: string; porcentaje: number } => {
      if (!config.activa || !config.activada_en) {
        return { segundos: 0, formateado: '', porcentaje: 0 };
      }

      const ahora = new Date().getTime();
      const activada = new Date(config.activada_en).getTime();
      const duracionMs = config.duracion_horas * 60 * 60 * 1000;
      const expiracion = activada + duracionMs;
      const tiempoRestanteMs = expiracion - ahora;

      if (tiempoRestanteMs <= 0) {
        return { segundos: 0, formateado: 'Expirada', porcentaje: 0 };
      }

      const segundos = Math.floor(tiempoRestanteMs / 1000);
      const horas = Math.floor(segundos / 3600);
      const minutos = Math.floor((segundos % 3600) / 60);
      const segs = segundos % 60;

      const formateado = 
        horas > 0 
          ? `${horas}h ${minutos}m ${segs}s`
          : minutos > 0
          ? `${minutos}m ${segs}s`
          : `${segs}s`;

      const porcentaje = (tiempoRestanteMs / duracionMs) * 100;

      return { segundos, formateado, porcentaje };
    },
    []
  );

  // Función para obtener los datos de la promo (solo la primera vez)
  const obtenerPromo = useCallback(async () => {
    try {
      const response = await fetch('/api/config/promo-status');
      
      if (!response.ok) {
        throw new Error('Error obteniendo estado de promoción');
      }

      const result = await response.json();
      configRef.current = result.promo_config;
      
      const { segundos, formateado, porcentaje } = calcularTiempoRestante(result.promo_config);

      setData({
        promo_config: result.promo_config,
        tiempo_restante_segundos: segundos,
        tiempo_restante_formateado: formateado,
        porcentaje_restante: porcentaje,
      });

      setError(null);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setLoading(false);
    }
  }, [calcularTiempoRestante]);

  // Obtener datos iniciales (solo una vez)
  useEffect(() => {
    obtenerPromo();
    
    // Refetch cada 30 segundos para sincronizar con el servidor
    const refetchInterval = setInterval(obtenerPromo, 30000);
    
    return () => clearInterval(refetchInterval);
  }, [obtenerPromo]);

  // Actualizar el timer localmente cada segundo (sin hacer fetch)
  useEffect(() => {
    if (!configRef.current?.activa) {
      return;
    }

    const timerInterval = setInterval(() => {
      if (configRef.current && data) {
        const { segundos, formateado, porcentaje } = calcularTiempoRestante(configRef.current);
        
        // Solo actualizar si cambió algo
        if (formateado !== data.tiempo_restante_formateado) {
          setData(prev => 
            prev ? {
              ...prev,
              tiempo_restante_segundos: segundos,
              tiempo_restante_formateado: formateado,
              porcentaje_restante: porcentaje,
            } : null
          );
        }
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [data, calcularTiempoRestante]);

  return {
    ...data,
    loading,
    error,
    refetch: obtenerPromo,
  };
}
