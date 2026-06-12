import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        blush: {
          50: 'rgb(var(--color-blush-50) / <alpha-value>)',
          100: 'rgb(var(--color-blush-100) / <alpha-value>)',
          500: 'rgb(var(--color-blush-500) / <alpha-value>)',
          600: 'rgb(var(--color-blush-600) / <alpha-value>)'
        },
        merlot: {
          900: 'rgb(var(--color-merlot-900) / <alpha-value>)'
        },
        cream: {
          50: 'rgb(var(--color-cream-50) / <alpha-value>)'
        },
        ink: {
          900: 'rgb(var(--color-ink-900) / <alpha-value>)',
          600: 'rgb(var(--color-ink-600) / <alpha-value>)'
        }
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Manrope', 'Avenir Next', 'sans-serif']
      },
      boxShadow: {
        card: '0 24px 80px rgb(var(--color-merlot-900) / 0.14)',
        glow: '0 20px 70px rgb(var(--color-blush-500) / 0.28)'
      },
      borderRadius: {
        app: '2rem'
      }
    }
  },
  plugins: []
} satisfies Config;
