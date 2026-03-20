import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#030308',
        cosmic: {
          black: '#070711',
          deep: '#0c0c1a',
        },
        cream: {
          DEFAULT: '#e8e4dc',
          soft: '#d4d0c8',
          muted: '#9a9488',
        },
        gold: {
          DEFAULT: '#c8a84e',
          bright: '#ddc06a',
          dim: '#a88a3e',
        },
        silver: {
          DEFAULT: '#b8b4c8',
          soft: '#a09cac',
        },
        lavender: {
          DEFAULT: '#8b7fa8',
          soft: '#746898',
        },
      },
      fontFamily: {
        serif: ['var(--font-heading)', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['var(--font-body)', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        breathe: 'breathe 6s ease-in-out infinite',
        twinkle: 'twinkle 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        fadeIn: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(184, 180, 200, 0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(184, 180, 200, 0.4)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}

export default config
