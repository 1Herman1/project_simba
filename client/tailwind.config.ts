import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Единый цвет линии: рамки карточек, разделители.
        line: '#E4EBF7',
        // Действие. Насыщенный синий макета #4C82F7 даёт с белым текстом
        // только 3.59:1 — под текстом идёт затемнённый DEFAULT (4.63:1),
        // а исходный оттенок остаётся на иконках и рамках, где текста нет.
        primary: {
          DEFAULT: '#3A6FE0',
          hover: '#2E5DC8',
          soft: '#4C82F7',
          tint: '#F2F6FE',
          fg: '#FFFFFF',
        },
        blue: {
          50: '#F5F8FF',
          100: '#D6EAFE',
          200: '#A4D4FC',
          300: '#6BB8F5',
          400: '#3A9AE8',
          500: '#1A3A5C',
        },
        amber: {
          50: '#FFF8E8',
          100: '#FFEDC4',
          200: '#FFD9A0',
          300: '#FFD580',
          400: '#FFB347',
          500: '#E8921A',
          600: '#A66200',
          800: '#7A4700',
        },
        navy: {
          900: '#16233C',
          800: '#1F2E48',
          700: '#2A3A56',
          600: '#3A4B66',
          500: '#4A5C7A',
          400: '#6B85A0',
          300: '#8FA8C0',
          200: '#C4D3E0',
          100: '#E4EBF7',
        },
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(22, 35, 60, 0.06)',
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        display: ['Nunito', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        smooth: 'var(--ease-out)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'badge-pop': 'badgePop 220ms var(--ease-out)',
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
        badgePop: {
          '0%': { transform: 'scale(0.85)' },
          '55%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
