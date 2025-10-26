/**
 * Button Component - Unified across the app
 * Follows design tokens for size, spacing, and motion
 */
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { tokens } from '../design-tokens';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { 
      variant = 'primary', 
      size = 'md', 
      loading = false,
      fullWidth = false,
      disabled,
      children,
      icon,
      className = '',
      style,
      ...props 
    },
    ref
  ) => {
    const variants = {
      primary: {
        backgroundColor: tokens.colors.brand.primary,
        color: '#fff',
        border: 'none',
        hoverBg: tokens.colors.brand.primaryHover,
        activeBg: tokens.colors.brand.primary,
        shadow: tokens.shadow.glow,
      },
      secondary: {
        backgroundColor: tokens.colors.bg.surface2,
        color: tokens.colors.text.primary,
        border: `1px solid ${tokens.colors.border.default}`,
        hoverBg: tokens.colors.bg.surface3,
        activeBg: tokens.colors.bg.surface2,
        shadow: 'none',
      },
      outline: {
        backgroundColor: 'transparent',
        color: tokens.colors.text.primary,
        border: `1px solid ${tokens.colors.border.default}`,
        hoverBg: tokens.colors.bg.surface1,
        activeBg: 'transparent',
        shadow: 'none',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: tokens.colors.text.secondary,
        border: 'none',
        hoverBg: tokens.colors.bg.surface1,
        activeBg: 'transparent',
        shadow: 'none',
      },
      danger: {
        backgroundColor: tokens.colors.status.error,
        color: '#fff',
        border: 'none',
        hoverBg: tokens.colors.status.error,
        activeBg: tokens.colors.status.error,
        shadow: 'none',
      },
    };

    const sizes = {
      sm: {
        height: '36px',
        padding: `0 ${tokens.spacing.md}`,
        fontSize: tokens.typography.small.size,
        gap: tokens.spacing.xs,
      },
      md: {
        height: '44px',
        padding: `0 ${tokens.spacing.lg}`,
        fontSize: tokens.typography.body.size,
        gap: tokens.spacing.sm,
      },
      lg: {
        height: '52px',
        padding: `0 ${tokens.spacing.xl}`,
        fontSize: tokens.typography.body.size,
        gap: tokens.spacing.sm,
      },
    };

    const variantStyle = variants[variant];
    const sizeStyle = sizes[size];
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center font-medium transition-all focus:outline-none ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
        style={{
          height: sizeStyle.height,
          padding: sizeStyle.padding,
          fontSize: sizeStyle.fontSize,
          gap: sizeStyle.gap,
          backgroundColor: variantStyle.backgroundColor,
          color: variantStyle.color,
          border: variantStyle.border,
          borderRadius: tokens.radius.lg,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.5 : 1,
          transition: `all ${tokens.motion.duration.base} ${tokens.motion.easing.default}`,
          ...style,
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = variantStyle.hoverBg;
            if (variant === 'primary') {
              e.currentTarget.style.boxShadow = tokens.shadow.glowStrong;
            }
          }
        }}
        onMouseLeave={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = variantStyle.backgroundColor;
            e.currentTarget.style.boxShadow = variantStyle.shadow;
          }
        }}
        onMouseDown={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.transform = 'scale(0.98)';
          }
        }}
        onMouseUp={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
        onFocus={(e) => {
          e.currentTarget.style.outline = tokens.focus.ring;
          e.currentTarget.style.outlineOffset = tokens.focus.offset;
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = 'none';
        }}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" style={{ width: '18px', height: '18px' }} />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {icon && icon}
            {children}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
