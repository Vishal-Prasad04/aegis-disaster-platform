/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#080D17',
          900: '#0B1220',
          800: '#121B2E',
          700: '#1B2740',
          600: '#28395A',
        },
        ink: {
          100: '#E7ECF3',
          300: '#B7C2D3',
          500: '#8592A6',
          700: '#4B5A74',
        },
        signal: {
          critical: '#FF5A36',
          warning: '#F2B341',
          safe: '#22C55E',
          info: '#3EA6FF',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '32px 32px',
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.8' },
          '80%, 100%': { transform: 'scale(1.8)', opacity: '0' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
}
