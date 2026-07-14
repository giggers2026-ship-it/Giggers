/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        /* ── Employer Blue ── */
        blue: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        /* ── Worker Green ── */
        green: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        /* ── Shared semantic ── */
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#172554',
          950: '#0f1f42',
        },
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        success: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        danger: {
          50:  '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        },
        /* ── Dark surface scale (Navy-based) ── */
        dark: {
          950: '#060b14',
          900: '#0f172a',
          800: '#111827',
          700: '#1e2433',
          600: '#252d3d',
          500: '#2e3a50',
          400: '#3d4e68',
          300: '#4f6380',
        },
        surface: {
          light: '#f8fafc',
          dark:  '#0f172a',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        /* Card levels */
        'card':     '0 2px 12px rgba(0,0,0,0.06)',
        'card-md':  '0 6px 24px rgba(0,0,0,0.10)',
        'card-lg':  '0 16px 48px rgba(0,0,0,0.16)',
        /* Blue employer glows */
        'blue':     '0 8px 24px rgba(37,99,235,0.35)',
        'blue-sm':  '0 4px 12px rgba(37,99,235,0.25)',
        /* Green worker glows */
        'green':    '0 8px 24px rgba(34,197,94,0.35)',
        'green-sm': '0 4px 12px rgba(34,197,94,0.25)',
        /* Generic glow kept for fallbacks */
        'glow':     '0 0 24px rgba(37,99,235,0.30)',
        'glow-sm':  '0 0 12px rgba(37,99,235,0.20)',
        'primary':  '0 8px 24px rgba(37,99,235,0.35)',
        'amber':    '0 8px 24px rgba(245,158,11,0.35)',
      },
      backgroundImage: {
        /* Employer */
        'gradient-blue':    'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        /* Worker */
        'gradient-green':   'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        /* Shared */
        'gradient-primary': 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        'gradient-dark':    'linear-gradient(135deg, #0f172a 0%, #1e2433 100%)',
        'gradient-amber':   'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'gradient-success': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        'glass-light':      'linear-gradient(135deg, rgba(255,255,255,0.60), rgba(255,255,255,0.20))',
        'glass-dark':       'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
        /* Stat card gradients */
        'stat-blue':        'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
        'stat-green':       'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
        'stat-amber':       'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':        'float 3s ease-in-out infinite',
        'shimmer':      'shimmer 2s infinite',
        'bounce-soft':  'bounce-soft 2s ease-in-out infinite',
        'fade-up':      'fade-up 0.4s ease both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
