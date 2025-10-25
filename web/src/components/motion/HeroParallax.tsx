import { motion, useMotionValue, useTransform } from "framer-motion";
import { ReactNode } from "react";

interface HeroParallaxProps {
  children: ReactNode;
}

export function HeroParallax({ children }: HeroParallaxProps) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useTransform(my, [-20, 20], [4, -4]);
  const rotateY = useTransform(mx, [-20, 20], [-4, 4]);

  return (
    <motion.div
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width - 0.5) * 40);
        my.set(((e.clientY - r.top) / r.height - 0.5) * 40);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      style={{ rotateX, rotateY }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  );
}
