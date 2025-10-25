import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'ghost';
  loading?: boolean;
  size?: 'md' | 'lg';
}

export function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled,
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'rounded-xl font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-canvas';
  
  const sizeStyles = {
    md: 'px-5 py-2.5 text-[15px] min-h-[40px]',
    lg: 'px-7 py-3.5 text-base min-h-[48px]',
  };
  
  const variants = {
    primary: 'bg-brand text-white hover:bg-[#5DADFF] active:scale-[0.98]',
    outline: 'border border-border bg-transparent text-ink hover:bg-surface-1 active:scale-[0.98]',
    ghost: 'bg-surface-2 text-ink hover:bg-surface-1 active:scale-[0.98]',
  };

  return (
    <motion.button
      whileHover={!disabled && !loading ? { y: -1 } : {}}
      whileTap={!disabled && !loading ? { y: 0 } : {}}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  );
}
