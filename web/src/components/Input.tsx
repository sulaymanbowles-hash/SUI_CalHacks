/**
 * Input Component - Unified text inputs with design tokens
 * Supports text, number, email, url, date, datetime-local, and textarea
 */
import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { tokens } from '../design-tokens';

interface BaseInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

type InputProps = BaseInputProps & InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = BaseInputProps & TextareaHTMLAttributes<HTMLTextAreaElement> & { multiline: true };

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps | TextareaProps>(
  ({ label, error, helperText, fullWidth, className = '', style, ...props }, ref) => {
    const isTextarea = 'multiline' in props && props.multiline;
    const isDisabled = props.disabled;

    const inputStyles = {
      width: fullWidth ? '100%' : 'auto',
      padding: isTextarea ? tokens.spacing.md : `${tokens.spacing.sm} ${tokens.spacing.md}`,
      fontSize: tokens.typography.body.size,
      lineHeight: tokens.typography.body.lineHeight,
      color: tokens.colors.text.primary,
      backgroundColor: tokens.colors.bg.surface1,
      border: `1px solid ${error ? tokens.colors.status.error : tokens.colors.border.default}`,
      borderRadius: tokens.radius.md,
      outline: 'none',
      transition: `all ${tokens.motion.duration.base} ${tokens.motion.easing.default}`,
      minHeight: isTextarea ? '120px' : '44px',
      resize: isTextarea ? 'vertical' as const : undefined,
      cursor: isDisabled ? 'not-allowed' : 'text',
      opacity: isDisabled ? 0.5 : 1,
      ...style,
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!isDisabled && !error) {
        e.currentTarget.style.borderColor = tokens.colors.border.focus;
        e.currentTarget.style.boxShadow = `0 0 0 3px ${tokens.colors.brand.primary}1A`;
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = error ? tokens.colors.status.error : tokens.colors.border.default;
      e.currentTarget.style.boxShadow = 'none';
    };

    const handleHover = (e: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!isDisabled && !error) {
        e.currentTarget.style.borderColor = tokens.colors.border.hover;
      }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!isDisabled && document.activeElement !== e.currentTarget) {
        e.currentTarget.style.borderColor = error ? tokens.colors.status.error : tokens.colors.border.default;
      }
    };

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label 
            className="block mb-2 font-medium"
            style={{
              fontSize: tokens.typography.small.size,
              color: tokens.colors.text.secondary,
            }}
          >
            {label}
          </label>
        )}
        
        {isTextarea ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={`${className}`}
            style={inputStyles}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleHover}
            onMouseLeave={handleMouseLeave}
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            className={`${className}`}
            style={inputStyles}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleHover}
            onMouseLeave={handleMouseLeave}
            {...(props as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}

        {error && (
          <p 
            className="mt-1.5"
            style={{
              fontSize: tokens.typography.micro.size,
              color: tokens.colors.status.error,
            }}
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p 
            className="mt-1.5"
            style={{
              fontSize: tokens.typography.micro.size,
              color: tokens.colors.text.muted,
            }}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';