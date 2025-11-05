import React, { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";

interface CollapsibleProps {
  isOpen: boolean;
  children: ReactNode;
  durationMs?: number;
  className?: string;
}

/**
 * Collapsible: contenedor con animación de altura para abrir/cerrar suavemente.
 * - Usa transición en max-height y opacidad para un efecto fluido.
 * - Mantiene los hijos montados para poder animar el cierre.
 */
export default function Collapsible({ isOpen, children, durationMs = 250, className = "" }: CollapsibleProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [maxHeight, setMaxHeight] = useState<number>(0);
  const [rendered, setRendered] = useState<boolean>(isOpen);
  const roRef = useRef<ResizeObserver | null>(null);

  // Asegura que el contenido esté montado cuando abrimos para poder medir
  useEffect(() => {
    if (isOpen) setRendered(true);
  }, [isOpen]);

  // Medir altura del contenido cuando cambia o al abrir
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const measure = () => {
      // Medimos scrollHeight real del contenido
      const newHeight = el.scrollHeight;
      setMaxHeight(newHeight);
    };

    // Medir inmediatamente
    measure();

    // Observa cambios de tamaño del contenido (imágenes, fuentes, datos async)
    if (typeof ResizeObserver !== "undefined") {
      roRef.current = new ResizeObserver(() => {
        // Usamos rAF para evitar layout thrashing en ráfagas
        requestAnimationFrame(measure);
      });
      roRef.current.observe(el);
    }

    // Recalcular también en resize de ventana como respaldo
    let raf: number | null = null;
    const onResize = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
      if (roRef.current && el) {
        try { roRef.current.unobserve(el); } catch {}
        try { roRef.current.disconnect(); } catch {}
        roRef.current = null;
      }
    };
  }, [children, isOpen]);

  // Tras acabar la animación de cierre, desmontar si está cerrado
  const onTransitionEnd = () => {
    if (!isOpen) setRendered(false);
  };

  const transitionStyle: React.CSSProperties = {
    maxHeight: isOpen ? maxHeight : 0,
    opacity: isOpen ? 1 : 0,
    transition: `max-height ${durationMs}ms ease, opacity ${durationMs}ms ease`,
    overflow: "hidden",
    willChange: "max-height, opacity",
  };

  return (
    <div className={className} style={transitionStyle} onTransitionEnd={onTransitionEnd}>
      {/* Renderizamos el contenido siempre que esté abierto o en animación de cierre */}
      {(rendered || isOpen) && (
        <div ref={contentRef}>
          {children}
        </div>
      )}
    </div>
  );
}
