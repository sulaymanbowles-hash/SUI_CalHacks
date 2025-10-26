/**
 * Chip - Unified pill component across app
 * Same height, padding, font-size everywhere
 */
import { ReactNode } from 'react';
import { tokens } from '../design-tokens';

interface ChipProps {
  children: ReactNode;
  selected?: boolean;
  icon?: ReactNode;
  count?: number;
  onClick?: () => void;
  variant?: 'default' | 'verified' | 'hot' | 'upcoming' | 'demo' | 'listed';
  size?: 'sm' | 'md';
}

export function Chip({ 
  children, 
  selected = false, 
  icon, 
  count,
  onClick, 
  variant = 'default',
  size = 'md'
}: ChipProps) {
  const variantStyles = {
    default: {
      bg: selected ? tokens.colors.status.upcomingBg : tokens.colors.bg.surface1,
      color: selected ? tokens.colors.brand.primary : tokens.colors.text.secondary,
      border: selected ? `1px solid ${tokens.colors.brand.primary}4D` : 'none',
      shadow: selected ? tokens.shadow.glow : 'none',
    },
    verified: {
      bg: tokens.colors.status.verifiedBg,
      color: tokens.colors.status.verified,
      border: 'none',
      shadow: 'none',
    },
    hot: {
      bg: tokens.colors.status.hotBg,
      color: tokens.colors.status.hot,
      border: 'none',
      shadow: 'none',
    },
    upcoming: {
      bg: tokens.colors.status.upcomingBg,
      color: tokens.colors.status.upcoming,
      border: 'none',
      shadow: 'none',
    },
    demo: {
      bg: tokens.colors.status.demoBg,
      color: tokens.colors.status.demo,
      border: 'none',
      shadow: 'none',
    },
    listed: {
      bg: tokens.colors.status.listedBg,
      color: tokens.colors.status.listed,
      border: 'none',
      shadow: 'none',
    },
  };

  const sizeStyles = size === 'sm' 
    ? { height: '24px', padding: '0 8px', fontSize: tokens.typography.micro.size }
    : { height: tokens.chip.height, padding: tokens.chip.padding, fontSize: tokens.chip.fontSize };

  const style = variantStyles[variant];

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="inline-flex items-center gap-1.5 font-medium transition-all"
      style={{
        ...sizeStyles,
        borderRadius: tokens.radius.full,
        backgroundColor: style.bg,
        color: style.color,
        border: style.border,
        boxShadow: style.shadow,
        cursor: onClick ? 'pointer' : 'default',
        transform: selected ? 'scale(1.02)' : 'scale(1)',
        transition: `all ${tokens.motion.duration.base} ${tokens.motion.easing.default}`,
      }}
      onMouseEnter={(e) => {
        if (!onClick) return;
        if (!selected) {
          e.currentTarget.style.backgroundColor = tokens.colors.bg.surface2;
          e.currentTarget.style.color = tokens.colors.text.primary;
        }
        e.currentTarget.style.transform = selected ? 'scale(1.05)' : 'scale(1.02)';
      }}
      onMouseLeave={(e) => {
        if (!onClick) return;
        if (!selected) {
          e.currentTarget.style.backgroundColor = style.bg;
          e.currentTarget.style.color = style.color;
        }
        e.currentTarget.style.transform = selected ? 'scale(1.02)' : 'scale(1)';
      }}
    >
      {icon && (
        <span className="inline-flex" style={{ 
          width: size === 'sm' ? '14px' : tokens.chip.iconSize, 
          height: size === 'sm' ? '14px' : tokens.chip.iconSize,
          opacity: tokens.icon.opacity 
        }}>
          {icon}
        </span>
      )}
      <span>{children}</span>
      {count !== undefined && (
        <span style={{ opacity: 0.8 }}>• {count}</span>
      )}
    </button>
  );
}
