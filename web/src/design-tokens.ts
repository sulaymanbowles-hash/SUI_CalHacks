/**
 * Design Tokens - Single Source of Truth
 * North-star aesthetic: Dark, glassy surfaces with soft depth
 */

export const tokens = {
  // Colors - Dark glassy theme
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
      verifiedBg: 'rgba(34, 197, 94, 0.15)',
      hot: '#FF8C42',         // Orange
      hotBg: 'rgba(255, 140, 66, 0.15)',
      upcoming: '#4DA2FF',    // Blue
      upcomingBg: 'rgba(77, 162, 255, 0.15)',
      used: '#9CA3AF',        // Gray
      usedBg: 'rgba(156, 163, 175, 0.15)',
      listed: '#FFB020',      // Amber
      listedBg: 'rgba(255, 176, 32, 0.15)',
      error: '#EF4444',
      errorBg: 'rgba(239, 68, 68, 0.15)',
      success: '#22C55E',
      successBg: 'rgba(34, 197, 94, 0.15)',
      demo: '#A78BFA',        // Purple
      demoBg: 'rgba(167, 139, 250, 0.15)',
    },
    text: {
      primary: '#DCE7F0',     // High contrast white
      secondary: 'rgba(220, 231, 240, 0.7)',
      tertiary: 'rgba(220, 231, 240, 0.5)',
      muted: 'rgba(220, 231, 240, 0.4)',
    },
    border: {
      default: 'rgba(255, 255, 255, 0.1)',  // Consistent 1px hairline
      hover: 'rgba(255, 255, 255, 0.2)',
      focus: 'rgba(77, 162, 255, 0.5)',
    },
  },

  // Border Radius - Consistent across app
  radius: {
    sm: '8px',
    md: '12px',      // Pills, inputs
    lg: '16px',      // Cards, sheets
    xl: '20px',
    '2xl': '24px',
    full: '9999px',
  },

  // Elevation - One shadow recipe
  shadow: {
    0: 'none',
    elevated: '0 6px 24px rgba(0, 0, 0, 0.2)',  // Surface elevated token
    glow: '0 0 12px rgba(77, 162, 255, 0.15)',
    glowStrong: '0 0 24px rgba(77, 162, 255, 0.3)',
  },

  // Typography Scale - Consistent hierarchy
  typography: {
    display: {
      size: '44px',
      lineHeight: '1.18',      // 52px
      letterSpacing: '-0.02em',
      weight: '700',
    },
    h2: {
      size: '28px',
      lineHeight: '1.28',      // 36px
      letterSpacing: '-0.01em',
      weight: '600',
    },
    h3: {
      size: '20px',
      lineHeight: '1.4',       // 28px
      letterSpacing: '-0.005em',
      weight: '600',
    },
    body: {
      size: '16px',
      lineHeight: '1.5',       // 24px
      letterSpacing: '0',
      weight: '400',
    },
    small: {
      size: '14px',
      lineHeight: '1.43',      // 20px
      letterSpacing: '0',
      weight: '400',
    },
    micro: {
      size: '12px',
      lineHeight: '1.5',       // 18px
      letterSpacing: '0.01em',
      weight: '500',
    },
  },

  // Spacing - 8pt grid base with steps
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

  // Icons - 1.5px stroke, 80% opacity default
  icon: {
    inline: '20px',
    button: '24px',
    empty: '48px',
    stroke: '1.5px',
    opacity: 0.8,
  },

  // Motion - Consistent timing
  motion: {
    duration: {
      fast: '80ms',      // Backdrop blur
      base: '120ms',     // Cards, chips, buttons
      slow: '180ms',     // Sheets
    },
    easing: {
      default: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },

  // Card anatomy - Uniform aspect & scrim
  card: {
    imageAspect: '56%',      // 9:16 portrait
    scrimHeight: '22%',
    scrimAlpha: 0.6,
    hoverLift: '2px',
    hoverScale: 1.02,
  },

  // Ambient effects
  ambient: {
    orb: {
      radius: '560px',
      opacity: 0.08,
      blur: '80px',
    },
    noise: {
      opacity: 0.03,
    },
    parallax: {
      scroll: 6,       // px per scroll
      mouse: 8,        // px per mouse movement
    },
  },

  // Focus ring - Consistent 2px ring + 4px offset
  focus: {
    ring: '2px solid rgba(77, 162, 255, 0.5)',
    offset: '4px',
  },

  // Pills/Chips - Same everywhere
  chip: {
    height: '32px',
    padding: '0 12px',
    fontSize: '14px',
    gap: '6px',
    iconSize: '16px',
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

// Sheen animation for primary buttons
export const sheen = `
  @keyframes sheen {
    0% { transform: translateX(-100%) rotate(15deg); }
    100% { transform: translateX(200%) rotate(15deg); }
  }
`;
