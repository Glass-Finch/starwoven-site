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
        cosmic: {
          black: '#0a0a1a',
          deep: '#0d0d24',
        },
        cream: {
          DEFAULT: '#e8e4dc',
          light: '#f5f3ef',
          dark: '#d4d0c8',
        },
        gold: {
          DEFAULT: '#c8a84e',
          light: '#ddc06a',
          dark: '#a88a3e',
        },
        gray: {
          muted: '#9a9488',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(200, 168, 78, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(200, 168, 78, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
