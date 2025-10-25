"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeRiseProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: any;
  delay?: number;
  children: ReactNode;
}

export function FadeRise({
  as: Tag = "div",
  delay = 0,
  children,
  ...rest
}: FadeRiseProps) {
  const MotionTag = motion(Tag);
  return (
    <MotionTag
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.28, ease: "easeOut", delay }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

interface StaggerProps {
  children: ReactNode;
  delay?: number;
}

export function Stagger({ children, delay = 0 }: StaggerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ staggerChildren: 0.06, delayChildren: delay }}
    >
      {children}
    </motion.div>
  );
}

export const item = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.24, ease: "easeOut" },
  },
};
