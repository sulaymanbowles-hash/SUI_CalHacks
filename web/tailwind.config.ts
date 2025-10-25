import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#061522',
        ink: '#E6F0F7',
        muted: 'rgba(230, 240, 247, 0.74)',
        brand: {
          DEFAULT: '#4DA2FF',
          2: '#11C7C5',
          900: '#0A0E1A',
          800: '#0F1419',
          700: '#1A1F2E',
          600: '#4DA8FF', // Sui blue
          500: '#6FB6FF',
          400: '#8FC5FF',
        },
        sui: {
          blue: '#4DA8FF',
          cyan: '#00D4FF',
          dark: '#0F1419',
        },
        aqua: {
          400: '#00E5CC',
          500: '#00D4D4',
          600: '#00B8B8',
        },
        orchid: {
          400: '#9D6CFF',
          500: '#8B5CF6',
          600: '#7C3AED',
        },
        text: {
          100: '#F8FAFC',
          200: '#E2E8F0',
          300: '#94A3B8',
          400: '#64748B',
        },
        surface: {
          1: 'rgba(255, 255, 255, 0.02)',
          2: 'rgba(255, 255, 255, 0.04)',
        },
        border: 'rgba(255, 255, 255, 0.12)',
        success: '#2ED67A',
        warning: '#FFB020',
        danger: '#FF5C6C',
      },
      borderRadius: {
        DEFAULT: '14px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter Tight', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display-lg': ['44px', { lineHeight: '1.15', letterSpacing: '-0.05em' }],
        'display-md': ['32px', { lineHeight: '1.15', letterSpacing: '-0.04em' }],
        'display-sm': ['24px', { lineHeight: '1.15', letterSpacing: '-0.03em' }],
      },
      spacing: {
        'section': '88px',
        'card': '24px',
      },
      boxShadow: {
        card: '0 8px 24px rgba(3, 15, 28, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(77, 168, 255, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(77, 168, 255, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-sui': 'linear-gradient(135deg, #4DA8FF 0%, #00D4FF 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
