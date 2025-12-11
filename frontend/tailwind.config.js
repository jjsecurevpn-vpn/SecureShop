/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ============================================
      // SISTEMA DE FUENTES - Inspirado en Proton VPN
      // ============================================
      fontFamily: {
        // Inter - Textos generales (igual que Proton VPN)
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        // Fraunces - Títulos (alternativa gratuita a ABC Arizona)
        serif: ['Fraunces', 'ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        // Syne - Elementos destacados (igual que Proton VPN)
        display: ['Syne', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Monospace
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        // Tamaños exactos de ProtonVPN con line-heights optimizados
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.625' }],
        'base': ['1rem', { lineHeight: '1.625' }],
        'lg': ['1.125rem', { lineHeight: '1.55' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.34' }],
        '3xl': ['1.875rem', { lineHeight: '1.13' }],
        '4xl': ['2.25rem', { lineHeight: '1.11' }],
        '5xl': ['3rem', { lineHeight: '1.125' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
        '7xl': ['4.5rem', { lineHeight: '1.08' }],
      },
      lineHeight: {
        'tight': '1.08',      // Títulos hero
        'snug': '1.125',      // Títulos sección  
        'normal': '1.34',     // Subtítulos
        'relaxed': '1.5',     // Texto grande
        'loose': '1.625',     // Texto cuerpo
      },
      letterSpacing: {
        'tighter': '-0.02em',
        'tight': '-0.01em',
        'normal': '0',
        'wide': '0.01em',
        'wider': '0.025em',
      },
      colors: {
        neutral: {
          850: '#1a202c',
        },
        // Colores exactos de ProtonVPN
        purple: {
          50: '#F8F7FF',
          100: '#EFEAFF',
          200: '#DED5FF',
          300: '#C4B5FF',
          400: '#A78BFF',
          500: '#6D4AFF',
          600: '#5B3FD6',
          700: '#4A32AD',
          800: 'rgb(55, 37, 128)',  // Exacto de ProtonVPN
          900: '#240053',
        },
        // Grises exactos de ProtonVPN
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',  // rgb(75, 85, 99) - Proton gray-600
          700: '#374151',
          800: '#1f2937',  // Proton text oscuro
          900: '#111827',
        },
        proton: {
          purple: '#6D4AFF',
          darkPurple: '#372580',
          light: '#F8F7FF',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}
