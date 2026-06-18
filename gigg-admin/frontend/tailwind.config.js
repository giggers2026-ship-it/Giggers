/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        admin: {
          bg: '#0a0d1a',
          surface: '#0f1220',
          border: 'rgba(255,255,255,0.07)',
          accent: '#6366f1',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-in': 'slideIn 0.3s ease forwards',
      },
    },
  },
  plugins: [],
};
