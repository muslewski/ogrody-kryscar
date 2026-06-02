"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  children,
  delay = 0,
  className,
  y = 24,
  amount = 0.2,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
  amount?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function HeroReveal({
  children,
  delay = 0,
  className,
  y = 24,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export function StaggerGrid({
  children,
  className,
  amount = 0.15,
  style,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  if (reduced)
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={containerVariants}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className} style={style}>{children}</div>;
  return (
    <motion.div variants={itemVariants} className={className} style={style}>
      {children}
    </motion.div>
  );
}

export function HoverLift({
  children,
  className,
  scale = 1.03,
}: {
  children: ReactNode;
  className?: string;
  scale?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      whileHover={{ y: -4, scale }}
      transition={{ duration: 0.3, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Card-sized hover affordance: a spring-driven lift + elevating shadow on
 * pointer hover, and a subtle press on tap.
 *
 * Why motion instead of CSS `hover:-translate-y`:
 *  - Motion's hover gesture only fires for real pointer (mouse) input and
 *    ignores `touch`, so the lift can never get "stuck" or flicker on a
 *    phone after a tap. `whileTap` still gives touch users press feedback
 *    via `scale` (a transform — no layout shift, no reflow flicker).
 *  - A spring feels considered; the old linear 300ms tween snapped.
 *
 * Keep the `group` class on this element so existing `group-hover:` child
 * effects (image zoom, button color) still work on hover-capable devices.
 */
export function HoverCard({
  children,
  className,
  lift = 6,
}: {
  children: ReactNode;
  className?: string;
  lift?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ y: 0, boxShadow: "0 1px 2px 0 rgba(17,24,39,0)" }}
      whileHover={{
        y: -lift,
        boxShadow: "0 22px 45px -16px rgba(17,24,39,0.18)",
      }}
      whileTap={{ scale: 0.985 }}
      transition={{
        y: { type: "spring", stiffness: 320, damping: 26, mass: 0.6 },
        scale: { type: "spring", stiffness: 400, damping: 30 },
        boxShadow: { duration: 0.3, ease: EASE },
      }}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
