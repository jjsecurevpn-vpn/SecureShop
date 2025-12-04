import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface PromoConfig {
  activa: boolean;
  activada_en: string | null;
  duracion_horas: number;
}

interface PromoHeaderProps {
  showButton?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
}

export function PromoHeader({ 
  showButton = true, 
  buttonText = "Obtener la oferta",
  onButtonClick 
}: PromoHeaderProps) {
  const navigate = useNavigate();
  const [promoVisible, setPromoVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [promo_config, setPromoConfig] = useState<PromoConfig | null>(null);
  const [tiempo_restante_segundos, setTiempoRestante] = useState(0);
  const configRef = useRef<PromoConfig | null>(null);

  // Calcular horas, minutos y segundos
  const segundosTotales = tiempo_restante_segundos || 0;
  const horas = Math.floor(segundosTotales / 3600);
  const minutos = Math.floor((segundosTotales % 3600) / 60);
  const segundos = segundosTotales % 60;

  // Función para calcular tiempo restante
  const calcularTiempoRestante = (config: PromoConfig) => {
    if (!config.activa || !config.activada_en) {
      return 0;
    }

    const ahora = new Date();
    const activadaEn = new Date(config.activada_en);
    const duracionMs = config.duracion_horas * 60 * 60 * 1000;
    const expiracion = activadaEn.getTime() + duracionMs;
    const tiempoRestanteMs = expiracion - ahora.getTime();

    if (tiempoRestanteMs <= 0) {
      return 0;
    }

    return Math.floor(tiempoRestanteMs / 1000);
  };

  // Cargar promo config desde el endpoint correcto
  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const res = await fetch("/api/config/promo-status");
        const data = await res.json();
        configRef.current = data.promo_config;
        setPromoConfig(data.promo_config);
        setTiempoRestante(calcularTiempoRestante(data.promo_config));
      } catch (err) {
        console.error("Error fetching promo config:", err);
      }
    };

    fetchPromo();
    const interval = setInterval(fetchPromo, 1000); // Actualizar cada segundo
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Solo restaurar visibilidad si la promo está habilitada
    // y no fue cerrada por el usuario
    if (promo_config?.activa) {
      const wasClosed = localStorage.getItem('promoHeaderClosed');
      if (!wasClosed) {
        setPromoVisible(true);
        setIsClosing(false);
      }
    } else {
      // Si la promo está desactivada, ocultar siempre
      setPromoVisible(false);
    }
  }, [promo_config]);

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      navigate('/planes');
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    // Guardar que el usuario cerró la promo
    localStorage.setItem('promoHeaderClosed', 'true');
    // Esperar a que termine la animación antes de ocultar
    setTimeout(() => {
      setPromoVisible(false);
      setIsClosing(false);
    }, 300);
  };

  // Estilos de animación
  const animationStyles = `
    @keyframes slideUpOut {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-100%);
      }
    }

    .promo-banner-closing {
      animation: slideUpOut 0.3s ease-in-out forwards;
    }

    .promo-banner-hidden {
      display: none;
    }
  `;

  // No renderizar si la promo está desactivada o ya fue cerrada
  if (!promoVisible || !promo_config?.activa) {
    return null;
  }

  return (
    <>
      <style>{animationStyles}</style>
      <div 
        className={isClosing && !promoVisible ? 'promo-banner-hidden' : isClosing ? 'promo-banner-closing' : ''}
        style={{
          backgroundColor: '#110723',
          color: '#ffffff',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          width: '100%',
          overflow: 'auto',
          overflowY: 'hidden',
          flexWrap: 'wrap'
        }}>
        {/* Texto y timer a la izquierda */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: 1,
          minWidth: '0'
        }}>
          {/* Texto principal - oculto en móvil extra pequeño */}
          <span style={{
            fontSize: 'clamp(10px, 2vw, 13px)',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            whiteSpace: 'nowrap',
            color: '#ffffff',
            display: window.innerWidth < 420 ? 'none' : 'inline-block'
          }}>
            OFERTA
          </span>

          {/* Timer en formato HH : MM : SS */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            fontWeight: '700',
            letterSpacing: '0.06em',
            color: '#d4ff00',
            whiteSpace: 'nowrap'
          }}>
            <span>{String(horas).padStart(2, '0')}</span>
            <span style={{ opacity: 0.6, color: '#ffffff', margin: '0 1px' }}>:</span>
            <span>{String(minutos).padStart(2, '0')}</span>
            <span style={{ opacity: 0.6, color: '#ffffff', margin: '0 1px' }}>:</span>
            <span>{String(segundos).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Botón a la derecha */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexShrink: 0
        }}>
          {/* Botón Obtener la oferta */}
          {showButton && (
            <button
              onClick={handleButtonClick}
              style={{
                flexShrink: 0,
                backgroundColor: '#d4ff00',
                border: 'none',
                color: '#110723',
                cursor: 'pointer',
                padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px)',
                borderRadius: '16px',
                fontSize: 'clamp(10px, 1.8vw, 12px)',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e8ff33';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#d4ff00';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {buttonText || 'Obtener'}
            </button>
          )}

          {/* Botón Cerrar */}
          <button
            onClick={handleClose}
            style={{
              flexShrink: 0,
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'opacity 0.2s',
              opacity: 0.7
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
            aria-label="Cerrar promoción"
          >
            <X style={{width: 'clamp(16px, 4vw, 18px)', height: 'clamp(16px, 4vw, 18px)'}} />
          </button>
        </div>
      </div>
    </>
  );
}
