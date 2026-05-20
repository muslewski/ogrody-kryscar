"use client";

/**
 * Tweened animated number — fast, predictable, no spring bounce.
 *
 * History: first version used `useSpring` so a slider drag felt smooth.
 * Problem in practice: the spring overshoots the perceived feel — every
 * keystroke chained the easing past 0.7s, and at high velocity the
 * displayed number jumped through values in big chunks. For an
 * interactive price (where the user expects the number to track the
 * slider), a short tween reads better.
 *
 * Behaviors:
 *   1. **First reveal** (scroll into view) → count up from 0 → `value`
 *      over `firstRevealDuration` (default 0.5 s, easeOut).
 *   2. **Subsequent changes** → tween from current displayed value to the
 *      new `value` over `duration` (default 0.3 s, easeOut). Each new
 *      `value` cancels the in-flight animation, so dragging a slider
 *      never queues a backlog.
 *   3. **prefers-reduced-motion** → snap directly to `value`, no tween.
 */

import { useEffect, useRef, useState } from "react";
import {
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControlsWithThen,
} from "motion/react";

export interface AnimatedNumberProps {
  /** Target numeric value. */
  value: number;
  /** Format the rendered string (e.g. `formatPLN`). Default: rounded integer. */
  format?: (n: number) => string;
  /** Tween duration (seconds) for `value` changes after first reveal. */
  duration?: number;
  /** Tween duration (seconds) for the first count-up on viewport reveal. */
  firstRevealDuration?: number;
  className?: string;
  /** If true, animates whenever `value` changes even outside the viewport. */
  alwaysAnimate?: boolean;
}

export function AnimatedNumber({
  value,
  format = (n) => String(Math.round(n)),
  duration = 0.3,
  firstRevealDuration = 0.5,
  className,
  alwaysAnimate = false,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px" });
  const reduced = useReducedMotion();

  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  const firstRunRef = useRef(true);
  const controlsRef = useRef<AnimationPlaybackControlsWithThen | null>(null);

  useEffect(() => {
    if (reduced) {
      mv.jump(value);
      setDisplay(value);
      return;
    }
    if (!inView && !alwaysAnimate) return;

    controlsRef.current?.stop();
    const dur = firstRunRef.current ? firstRevealDuration : duration;
    firstRunRef.current = false;
    controlsRef.current = animate(mv, value, {
      duration: dur,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(latest),
    });
    return () => {
      controlsRef.current?.stop();
    };
  }, [
    inView,
    value,
    mv,
    alwaysAnimate,
    reduced,
    duration,
    firstRevealDuration,
  ]);

  return (
    <span ref={ref} className={className}>
      {format(display)}
    </span>
  );
}
