import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeRiseProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FadeRise({ children, delay = 0, className }: FadeRiseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.28, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
