import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface TweenNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function TweenNumber({ value, decimals = 2, prefix = '$', suffix = '', className = '' }: TweenNumberProps) {
  const mv = useMotionValue(value);
  const rounded = useTransform(mv, (latest) => latest.toFixed(decimals));

  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.2, ease: 'easeOut' });
    return () => controls.stop();
  }, [value, mv]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}
