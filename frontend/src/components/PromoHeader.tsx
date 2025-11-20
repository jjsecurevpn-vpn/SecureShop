import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useHeroConfig } from "../hooks/useHeroConfig";

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
  const { config: heroConfig } = useHeroConfig();

  useEffect(() => {
    // Restaurar visibilidad si hay nueva promo
    if (heroConfig?.promocion?.habilitada) {
      setPromoVisible(true);
      setIsClosing(false);
    }
  }, [heroConfig?.promocion?.habilitada]);

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      navigate('/planes');
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    // Esperar a que termine la animación antes de ocultar
    setTimeout(() => {
      setPromoVisible(false);
      setIsClosing(false);
    }, 300);
  };

  // Extraer el descuento (ej: "20%" de "DESCUENTO 20%")
  const textoPromo = heroConfig?.promocion?.texto || "";
  const descuentoMatch = textoPromo.match(/(\d+)%/);
  const descuento = descuentoMatch ? descuentoMatch[1] : null;

  // Si no hay promo activa y no está cerrando, no renderizar nada
  if (!heroConfig?.promocion?.habilitada && !isClosing && !promoVisible) {
    return null;
  }

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

  return (
    <>
      <style>{animationStyles}</style>
      <div 
        className={isClosing && !promoVisible ? 'promo-banner-hidden' : isClosing ? 'promo-banner-closing' : ''}
        style={{
          background: 'linear-gradient(to bottom, #1a1a1a 0%, #f3f4f6 100%)',
          color: 'white',
          padding: '16px',
          display: (!heroConfig?.promocion?.habilitada && !isClosing) ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          width: '100%',
          flexWrap: 'wrap',
          overflow: 'hidden'
        }}>
        <div style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {/* Texto principal */}
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {/* Parte del texto sin el descuento */}
            {textoPromo.split(/\d+%/)[0].trim()}
            
            {/* Badge con el descuento */}
            {descuento && (
              <span style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}>
                {descuento}%
              </span>
            )}
          </span>
        </div>

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
                backgroundColor: '#6366f1',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
            >
              {buttonText}
            </button>
          )}

          {/* Botón Cerrar */}
          <button
            onClick={handleClose}
            style={{
              flexShrink: 0,
              backgroundColor: 'transparent',
              border: 'none',
              color: '#d1d5db',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
            aria-label="Cerrar promoción"
          >
            <svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
