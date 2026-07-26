import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#F5FAFF',
          100: '#D6EAFE',
          200: '#A4D4FC',
          300: '#6BB8F5',
          400: '#3A9AE8',
          500: '#1A3A5C',
        },
        amber: {
          300: '#FFD580',
          400: '#FFB347',
          500: '#E8921A',
        },
        navy: {
          900: '#1A2B3C',
          700: '#2D4A6A',
          600: '#3A5670',
          500: '#4A6A8A',
          400: '#6B85A0',
          300: '#8FA8C0',
          200: '#C4D3E0',
          100: '#E2E9F0',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        display: ['Nunito', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
