import { ReactNode } from 'react';
import { protonColors } from '../styles/colors';

type SubtitleSize = 'base' | 'lg' | 'sm';

interface SubtitleProps {
  children: ReactNode;
  size?: SubtitleSize;
  className?: string;
  center?: boolean;
}

// Tamaños exactos de ProtonVPN para subtítulos/párrafos
const sizeStyles: Record<SubtitleSize, { fontSize: string; lineHeight: string }> = {
  sm: {
    fontSize: '0.875rem',  // 14px
    lineHeight: '1.5',
  },
  base: {
    fontSize: '1rem',      // 16px - tamaño principal de ProtonVPN
    lineHeight: '1.625',
  },
  lg: {
    fontSize: '1.125rem',  // 18px
    lineHeight: '1.55',
  },
};

export function Subtitle({ children, size = 'base', className = '', center = false }: SubtitleProps) {
  return (
    <p
      className={`font-sans ${center ? 'text-center' : ''} ${className}`}
      style={{
        fontSize: sizeStyles[size].fontSize,
        lineHeight: sizeStyles[size].lineHeight,
        color: protonColors.gray[600],
      }}
    >
      {children}
    </p>
  );
}
