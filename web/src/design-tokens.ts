/**
 * Design Tokens - Single Source of Truth
 * Apply these tokens everywhere for visual continuity
 */

export const tokens = {
  // Colors
  colors: {
    bg: {
      canvas: '#061522',      // Deep navy base
      card: 'rgba(255, 255, 255, 0.02)',  // Canvas + 2% overlay
      cardHover: 'rgba(255, 255, 255, 0.04)',
      surface1: 'rgba(255, 255, 255, 0.03)',
      surface2: 'rgba(255, 255, 255, 0.06)',
      surface3: 'rgba(255, 255, 255, 0.08)',
    },
    brand: {
      primary: '#4DA2FF',     // Electric blue
      primaryHover: '#5DADFF',
      secondary: '#5AE0E5',   // Teal/cyan accent
      secondaryHover: '#6BE9ED',
    },
    status: {
      verified: '#22C55E',    // Green
      verifiedBg: 'rgba(34, 197, 94, 0.2)',
      hot: '#FF8C42',         // Orange
      hotBg: 'rgba(255, 140, 66, 0.2)',
      upcoming: '#4DA2FF',    // Blue
      upcomingBg: 'rgba(77, 162, 255, 0.2)',
      used: '#9CA3AF',        // Gray
      usedBg: 'rgba(156, 163, 175, 0.2)',
      listed: '#FFB020',      // Amber
      listedBg: 'rgba(255, 176, 32, 0.2)',
      error: '#EF4444',
      errorBg: 'rgba(239, 68, 68, 0.2)',
    },
    text: {
      primary: '#DCE7F0',     // High contrast white
      secondary: 'rgba(220, 231, 240, 0.7)',
      tertiary: 'rgba(220, 231, 240, 0.5)',
      muted: 'rgba(220, 231, 240, 0.4)',
    },
    border: {
      default: 'rgba(255, 255, 255, 0.1)',
      hover: 'rgba(255, 255, 255, 0.2)',
      focus: 'rgba(77, 162, 255, 0.5)',
    },
  },

  // Border Radius
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    full: '9999px',
  },

  // Elevation (shadows)
  shadow: {
    0: 'none',
    1: '0 2px 8px rgba(0, 0, 0, 0.08)',                    // Faint hover on chips
    2: '0 12px 32px rgba(3, 15, 28, 0.14)',                // Card hover
    3: '0 24px 48px rgba(0, 0, 0, 0.24)',                  // Modal/sheet
    glow: '0 0 12px rgba(77, 162, 255, 0.12)',            // Brand glow
    glowStrong: '0 0 24px rgba(77, 162, 255, 0.25)',
  },

  // Typography
  typography: {
    display: {
      size: '64px',
      lineHeight: '1.1',
      letterSpacing: '-0.02em',
      weight: '700',
    },
    h1: {
      size: '44px',
      lineHeight: '1.15',
      letterSpacing: '-0.015em',
      weight: '600',
    },
    h2: {
      size: '32px',
      lineHeight: '1.2',
      letterSpacing: '-0.01em',
      weight: '600',
    },
    h3: {
      size: '24px',
      lineHeight: '1.25',
      letterSpacing: '-0.005em',
      weight: '600',
    },
    body: {
      size: '16px',
      lineHeight: '1.6',
      letterSpacing: '0',
      weight: '400',
    },
    small: {
      size: '14px',
      lineHeight: '1.5',
      letterSpacing: '0',
      weight: '400',
    },
    micro: {
      size: '12px',
      lineHeight: '1.4',
      letterSpacing: '0.01em',
      weight: '500',
    },
  },

  // Spacing (8pt grid)
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px',
  },

  // Layout
  layout: {
    maxWidth: '1280px',
    gutter: '24px',
    gutterMobile: '16px',
  },

  // Icons
  icon: {
    inline: '18px',
    button: '20px',
    buttonLarge: '24px',
    empty: '48px',
  },

  // Motion
  motion: {
    duration: {
      fast: '120ms',
      base: '180ms',
      slow: '240ms',
      slower: '320ms',
    },
    easing: {
      default: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      ease: 'ease-out',
    },
  },

  // Ambient effects
  ambient: {
    orb: {
      radius: '520px',
      opacity: 0.08,
      blur: '76px',
    },
    glow: {
      radius: '280px',
      opacity: 0.07,
      blur: '52px',
    },
    noise: {
      opacity: 0.028,
    },
  },
} as const;

// Utility functions
export const rgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const addAlpha = (color: string, amount: number): string => {
  if (color.includes('rgba')) {
    const alpha = parseFloat(color.match(/[\d.]+(?=\))/)?.[0] || '1');
    return color.replace(/[\d.]+(?=\))/, String(Math.min(1, alpha + amount)));
  }
  return color;
};
