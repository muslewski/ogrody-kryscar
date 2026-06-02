"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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

const cardLiftVariants: Variants = {
  rest: { y: 0, scale: 1 },
  hover: { y: -6, scale: 1 },
  tap: { y: -6, scale: 0.985 },
};

const cardShadowVariants: Variants = {
  rest: { opacity: 0 },
  hover: { opacity: 1 },
  tap: { opacity: 1 },
};

/**
 * Card-sized hover affordance: a spring-driven lift, plus an elevating
 * shadow that *crossfades* on hover.
 *
 * Why not animate `box-shadow` directly: JS box-shadow interpolation is
 * unreliable and tends to pop in suddenly. Instead we stack a dedicated
 * shadow layer behind the card and animate its `opacity` (GPU-composited,
 * always smooth). The wrapper is NOT `overflow-hidden`, so the shadow
 * layer isn't clipped — the caller's `overflow-hidden` lives on the inner
 * card element and only clips that element's own children (e.g. the image).
 *
 * Why motion instead of CSS `hover:`:
 *  - Motion's hover gesture only fires for real pointer (mouse) input and
 *    ignores touch, so the lift can't stick or flicker on mobile.
 *  - `tap` keeps the lift and adds a subtle press scale — deliberate touch
 *    feedback that resolves on release (no sticking).
 *
 * The caller's `className` (incl. `group`) stays on the inner card so the
 * existing `group-hover:` child effects keep working.
 */
export function HoverCard({
  children,
  className,
  radiusClassName = "rounded-3xl",
}: {
  children: ReactNode;
  className?: string;
  radiusClassName?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className="relative h-full"
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileTap="tap"
      variants={cardLiftVariants}
      transition={{
        y: { type: "spring", stiffness: 320, damping: 26, mass: 0.6 },
        scale: { type: "spring", stiffness: 400, damping: 30 },
      }}
    >
      {/* Unclipped shadow layer — crossfaded via opacity, never pops. */}
      <motion.span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 shadow-2xl shadow-neutral-900/15",
          radiusClassName,
        )}
        variants={cardShadowVariants}
        transition={{ duration: 0.35, ease: EASE }}
      />
      <div className={className}>{children}</div>
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
