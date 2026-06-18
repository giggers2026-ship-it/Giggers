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
        primary: {
          50:  '#e8f0fe',
          100: '#d2e3fc',
          200: '#aecbfa',
          300: '#8ab4f8',
          400: '#669df6',
          500: '#4285f4',
          600: '#1a73e8', // Original primary
          700: '#1967d2',
          800: '#185abc',
          900: '#174ea6',
          950: '#0f326a',
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
          50:  '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        danger: {
          50:  '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        },
        dark: {
          900: '#0a0a0f',
          800: '#0f0f16',
          700: '#14141e',
          600: '#1a1a2e',
          500: '#22223a',
          400: '#2d2d4a',
          300: '#3d3d5c',
        },
        surface: {
          light: '#f8fafc',
          dark:  '#1a1a2e',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card':    '0 4px 24px rgba(0,0,0,0.06)',
        'card-md': '0 8px 32px rgba(0,0,0,0.10)',
        'card-lg': '0 16px 48px rgba(0,0,0,0.15)',
        'glow':    '0 0 24px rgba(99,102,241,0.35)',
        'glow-sm': '0 0 12px rgba(99,102,241,0.25)',
        'primary': '0 8px 24px rgba(99,102,241,0.35)',
        'amber':   '0 8px 24px rgba(245,158,11,0.35)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4285f4 0%, #1a73e8 100%)',
        'gradient-dark':    'linear-gradient(135deg, #0f0f16 0%, #1a1a2e 100%)',
        'gradient-amber':   'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'gradient-success': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'glass-light':      'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2))',
        'glass-dark':       'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
