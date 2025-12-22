import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { fontFamily } from "../styles/typography";

type PromoTheme = {
  accent: string;
  accentDark: string;
  accentText: string;
};

const THEME_PLANES: PromoTheme = {
  // (Actual) verde/neón
  accent: "#d4ff00",
  accentDark: "#b8e600",
  accentText: "#110723",
};

const THEME_REVENDEDORES: PromoTheme = {
  // Naranja
  accent: "#fb923c",
  accentDark: "#f97316",
  accentText: "#110723",
};

const THEME_AMBAS: PromoTheme = {
  // Índigo (brillante para mantener texto oscuro)
  accent: "#a5b4fc",
  accentDark: "#818cf8",
  accentText: "#110723",
};

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3
    ? normalized.split("").map((c) => c + c).join("")
    : normalized;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface PromoConfig {
  activa: boolean;
  activada_en: string | null;
  duracion_horas: number;
}

interface PromoHeaderProps {
  tipo?: "planes" | "revendedores";
  showButton?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
}

// Componente para cada dígito con efecto flip
function FlipDigit({ digit, prevDigit, theme }: { digit: string; prevDigit: string; theme: PromoTheme }) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [displayPrev, setDisplayPrev] = useState(prevDigit);

  useEffect(() => {
    if (digit !== prevDigit) {
      setDisplayPrev(prevDigit);
      setIsFlipping(true);
      const timer = setTimeout(() => setIsFlipping(false), 600);
      return () => clearTimeout(timer);
    }
  }, [digit, prevDigit]);

  return (
    <div
      style={{
        position: 'relative',
        width: 'clamp(14px, 3.5vw, 20px)',
        height: 'clamp(18px, 4.5vw, 26px)',
        perspective: '400px',
        margin: '0 0.5px',
      }}
    >
      {/* Mitad inferior - muestra el número nuevo desde el inicio */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '50%',
          borderRadius: '0 0 3px 3px',
          background: 'linear-gradient(180deg, #150a24 0%, #0d0518 100%)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      >
        <span
          style={{
            fontFamily: fontFamily.mono,
            fontSize: 'clamp(10px, 2.5vw, 14px)',
            fontWeight: '700',
            color: theme.accent,
            textShadow: `0 0 6px ${hexToRgba(theme.accent, 0.3)}`,
            transform: 'translateY(-50%)',
          }}
        >
          {digit}
        </span>
      </div>

      {/* Mitad superior - muestra el número anterior durante el flip, luego el nuevo */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '50%',
          borderRadius: '3px 3px 0 0',
          background: 'linear-gradient(180deg, #1a0d2e 0%, #150a24 100%)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
          zIndex: 2,
        }}
      >
        <span
          style={{
            fontFamily: fontFamily.mono,
            fontSize: 'clamp(10px, 2.5vw, 14px)',
            fontWeight: '700',
            color: theme.accent,
            textShadow: `0 0 6px ${hexToRgba(theme.accent, 0.3)}`,
            transform: 'translateY(50%)',
          }}
        >
          {isFlipping ? displayPrev : digit}
        </span>
      </div>

      {/* Línea divisoria horizontal */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          height: '1px',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 5,
          transform: 'translateY(-0.5px)',
        }}
      />

      {/* Mitad superior que "cae" - muestra el número anterior */}
      {isFlipping && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            borderRadius: '3px 3px 0 0',
            background: 'linear-gradient(180deg, #1a0d2e 0%, #150a24 100%)',
            overflow: 'hidden',
            transformOrigin: 'bottom center',
            animation: 'flipDown 0.6s cubic-bezier(0.455, 0.030, 0.515, 0.955) forwards',
            zIndex: 3,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
        >
          <span
            style={{
              fontFamily: fontFamily.mono,
              fontSize: 'clamp(10px, 2.5vw, 14px)',
              fontWeight: '700',
              color: theme.accent,
              textShadow: `0 0 6px ${hexToRgba(theme.accent, 0.3)}`,
              transform: 'translateY(50%)',
            }}
          >
            {displayPrev}
          </span>
        </div>
      )}

      {/* Mitad inferior que "sube" - muestra el número nuevo */}
      {isFlipping && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            borderRadius: '0 0 3px 3px',
            background: 'linear-gradient(180deg, #150a24 0%, #0d0518 100%)',
            overflow: 'hidden',
            transformOrigin: 'top center',
            animation: 'flipUp 0.6s cubic-bezier(0.455, 0.030, 0.515, 0.955) forwards',
            zIndex: 4,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: fontFamily.mono,
              fontSize: 'clamp(10px, 2.5vw, 14px)',
              fontWeight: '700',
              color: theme.accent,
              textShadow: `0 0 6px ${hexToRgba(theme.accent, 0.3)}`,
              transform: 'translateY(-50%)',
            }}
          >
            {digit}
          </span>
        </div>
      )}

      {/* Brillo superior */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          borderRadius: '3px 3px 0 0',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 6,
        }}
      />
    </div>
  );
}

// Componente para un grupo de dos dígitos (ej: horas, minutos, segundos)
function FlipUnit({ value, label, theme }: { value: number; label: string; theme: PromoTheme }) {
  const prevValueRef = useRef(value);
  const digits = String(value).padStart(2, '0').split('');
  const prevDigits = String(prevValueRef.current).padStart(2, '0').split('');

  useEffect(() => {
    // Actualizar el ref después de que el render se complete
    // para que el próximo render tenga el valor anterior correcto
    prevValueRef.current = value;
  }, [value]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
      <div style={{ display: 'flex', gap: '1px' }}>
        <FlipDigit digit={digits[0]} prevDigit={prevDigits[0]} theme={theme} />
        <FlipDigit digit={digits[1]} prevDigit={prevDigits[1]} theme={theme} />
      </div>
      <span
        style={{
          fontSize: 'clamp(6px, 1.2vw, 7px)',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'rgba(255,255,255,0.4)',
          marginTop: '1px',
        }}
      >
        {label}
      </span>
    </div>
  );
}

// Separador entre unidades
function TimeSeparator({ theme }: { theme: PromoTheme }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        padding: '0 clamp(2px, 0.5vw, 4px)',
        alignSelf: 'flex-start',
        marginTop: 'clamp(4px, 1vw, 7px)',
      }}
    >
      <div
        style={{
          width: 'clamp(2px, 0.6vw, 3px)',
          height: 'clamp(2px, 0.6vw, 3px)',
          borderRadius: '50%',
          backgroundColor: theme.accent,
          boxShadow: `0 0 4px ${hexToRgba(theme.accent, 0.5)}`,
        }}
      />
      <div
        style={{
          width: 'clamp(2px, 0.6vw, 3px)',
          height: 'clamp(2px, 0.6vw, 3px)',
          borderRadius: '50%',
          backgroundColor: theme.accent,
          boxShadow: `0 0 4px ${hexToRgba(theme.accent, 0.5)}`,
        }}
      />
    </div>
  );
}

export function PromoHeader({ 
  tipo = "planes",
  showButton = true, 
  buttonText = "Obtener la oferta",
  onButtonClick 
}: PromoHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isPlanesPage = location.pathname === '/planes';
  const isRevendedoresPage = location.pathname === '/revendedores';
  const [promo_config, setPromoConfig] = useState<PromoConfig | null>(null);
  const [tiempo_restante_segundos, setTiempoRestante] = useState(0);
  const configRef = useRef<PromoConfig | null>(null);
  const [promoPlanes, setPromoPlanes] = useState<PromoConfig | null>(null);
  const [promoRevendedores, setPromoRevendedores] = useState<PromoConfig | null>(null);
  const [promoMostradaTipo, setPromoMostradaTipo] = useState<"planes" | "revendedores" | null>(null);

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

  const endpointPlanes = "/api/config/promo-status";
  const endpointRevendedores = "/api/config/promo-status-revendedores";

  // Cargar promo config desde el endpoint correcto
  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const [resPlanes, resRev] = await Promise.all([
          fetch(endpointPlanes).catch(() => null as any),
          fetch(endpointRevendedores).catch(() => null as any),
        ]);

        const dataPlanes = resPlanes ? await resPlanes.json().catch(() => null) : null;
        const dataRev = resRev ? await resRev.json().catch(() => null) : null;

        const planesCfg: PromoConfig | null = dataPlanes?.promo_config ?? null;
        const revCfg: PromoConfig | null = dataRev?.promo_config ?? null;

        setPromoPlanes(planesCfg);
        setPromoRevendedores(revCfg);

        const preferida = tipo;
        const preferidaCfg = preferida === "revendedores" ? revCfg : planesCfg;
        const alternativaTipo = preferida === "revendedores" ? "planes" : "revendedores";
        const alternativaCfg = alternativaTipo === "revendedores" ? revCfg : planesCfg;

        const preferidaActiva = Boolean(preferidaCfg?.activa);
        const alternativaActiva = Boolean(alternativaCfg?.activa);

        const mostradaTipo: "planes" | "revendedores" | null =
          preferidaActiva ? preferida : (alternativaActiva ? alternativaTipo : null);

        const mostradaCfg = mostradaTipo === "revendedores" ? revCfg : (mostradaTipo === "planes" ? planesCfg : null);

        configRef.current = mostradaCfg;
        setPromoMostradaTipo(mostradaTipo);
        setPromoConfig(mostradaCfg);
        setTiempoRestante(mostradaCfg ? calcularTiempoRestante(mostradaCfg) : 0);
      } catch (err) {
        console.error("Error fetching promo config:", err);
      }
    };

    fetchPromo();
    // Fetch cada 30 segundos para sincronizar
    const fetchInterval = setInterval(fetchPromo, 30000);
    return () => clearInterval(fetchInterval);
  }, [tipo]);

  // Contador local que actualiza cada segundo
  useEffect(() => {
    const tickInterval = setInterval(() => {
      if (configRef.current) {
        setTiempoRestante(calcularTiempoRestante(configRef.current));
      }
    }, 1000);
    return () => clearInterval(tickInterval);
  }, []);

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      navigate(promoMostradaTipo === "revendedores" ? "/revendedores" : "/planes");
    }
  };

  // No renderizar si la promo está desactivada
  if (!promo_config?.activa) {
    return null;
  }

  const ambasActivas = Boolean(promoPlanes?.activa) && Boolean(promoRevendedores?.activa);
  const theme: PromoTheme = ambasActivas
    ? THEME_AMBAS
    : (promoMostradaTipo === "revendedores" ? THEME_REVENDEDORES : THEME_PLANES);

  // Estilos de animación para el flip
  const flipStyles = `
    @keyframes flipDown {
      0% {
        transform: rotateX(0deg);
      }
      100% {
        transform: rotateX(-90deg);
      }
    }
    @keyframes flipUp {
      0% {
        transform: rotateX(90deg);
      }
      100% {
        transform: rotateX(0deg);
      }
    }
  `;

  return (
    <>
      <style>{flipStyles}</style>
      <div
        style={{
          background: 'linear-gradient(180deg, #110723 0%, #0a0312 100%)',
          color: '#ffffff',
          padding: 'clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isPlanesPage ? 'center' : 'space-between',
          gap: 'clamp(8px, 2vw, 16px)',
          width: '100%',
          borderBottom: `1px solid ${hexToRgba(theme.accent, 0.15)}`,
        }}
      >
        {/* Contenedor del timer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(6px, 1.5vw, 10px)',
            flex: isPlanesPage ? 'none' : 1,
            justifyContent: isPlanesPage ? 'center' : 'flex-start',
          }}
        >
          {/* Etiqueta OFERTA con icono */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {/* Icono de rayo */}
            <div
              style={{
                width: 'clamp(14px, 2.5vw, 16px)',
                height: 'clamp(14px, 2.5vw, 16px)',
                borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentDark} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                  boxShadow: `0 0 8px ${hexToRgba(theme.accent, 0.4)}`,
              }}
            >
              <svg
                width="clamp(8px, 1.5vw, 10px)"
                height="clamp(8px, 1.5vw, 10px)"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#110723"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            
            <span
              style={{
                fontSize: 'clamp(8px, 1.5vw, 10px)',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#ffffff',
                display: window.innerWidth < 380 ? 'none' : 'block',
              }}
            >
              Oferta
            </span>
          </div>

          {/* Flip Clock */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
            }}
          >
            <FlipUnit value={horas} label="hrs" theme={theme} />
            <TimeSeparator theme={theme} />
            <FlipUnit value={minutos} label="min" theme={theme} />
            <TimeSeparator theme={theme} />
            <FlipUnit value={segundos} label="seg" theme={theme} />
          </div>
        </div>

        {/* Botón CTA - oculto en /planes */}
        {showButton && !(promoMostradaTipo === "planes" && isPlanesPage) && !(promoMostradaTipo === "revendedores" && isRevendedoresPage) && (
          <button
            onClick={handleButtonClick}
            style={{
              flexShrink: 0,
              background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentDark} 100%)`,
              border: 'none',
              color: theme.accentText,
              cursor: 'pointer',
              padding: 'clamp(4px, 1vw, 6px) clamp(10px, 2vw, 14px)',
              borderRadius: '12px',
              fontSize: 'clamp(8px, 1.5vw, 10px)',
              fontWeight: '700',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              boxShadow: `0 1px 8px ${hexToRgba(theme.accent, 0.3)}`,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = `0 3px 12px ${hexToRgba(theme.accent, 0.5)}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 1px 8px ${hexToRgba(theme.accent, 0.3)}`;
            }}
          >
            {buttonText || 'Obtener'}
          </button>
        )}
      </div>
    </>
  );
}
