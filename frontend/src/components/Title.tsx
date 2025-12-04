import { ReactNode } from 'react';
import { protonColors } from '../styles/colors';

type TitleSize = 'h1' | 'h2' | 'h3';

interface TitleProps {
  children: ReactNode;
  as?: TitleSize;
  className?: string;
  center?: boolean;
}

// Tamaños EXACTOS de ProtonVPN - más conservadores
const sizeStyles: Record<TitleSize, { fontSize: string; lineHeight: string }> = {
  h1: {
    fontSize: 'clamp(2.25rem, 3vw, 3rem)',    // 36px → 48px (ProtonVPN usa 48px base, 72px solo en pantallas muy grandes)
    lineHeight: '1.08',
  },
  h2: {
    fontSize: 'clamp(1.875rem, 2.5vw, 2.25rem)', // 30px → 36px (Secciones)
    lineHeight: '1.13',
  },
  h3: {
    fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',  // 20px → 24px (Subtítulos)
    lineHeight: '1.34',
  },
};

export function Title({ children, as = 'h1', className = '', center = false }: TitleProps) {
  const Tag = as;
  const styles = sizeStyles[as];

  return (
    <Tag
      className={`font-serif font-medium ${center ? 'text-center' : ''} ${className}`}
      style={{
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
        color: protonColors.purple[800],
      }}
    >
      {children}
    </Tag>
  );
}
