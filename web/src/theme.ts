// Design tokens from FRONTEND_DESIGN_BRIEF.md
export const theme = {
  colors: {
    brand: {
      900: '#0B1020',
      800: '#0F172A',
      600: '#2B6CF0',
      500: '#3D7BFF',
    },
    aqua: {
      500: '#10B3B3',
    },
    orchid: {
      500: '#7C3AED',
    },
    text: {
      100: '#E2E8F0',
      300: '#C7D2FE',
    },
    success: {
      500: '#22C55E',
    },
    warning: {
      500: '#F59E0B',
    },
    error: {
      500: '#EF4444',
    },
  },
  fonts: {
    sans: 'Inter, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
} as const;

export type Theme = typeof theme;
