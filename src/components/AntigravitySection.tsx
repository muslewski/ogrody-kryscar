"use client";

/**
 * Full-bleed marketing section with the reactbits Antigravity particle field
 * rendered behind a slot of typography + (optional) CTA.
 *
 * The particle canvas is heavy (three.js + react-three-fiber). It's:
 *   - Dynamic-imported with `ssr: false` so the WebGL bundle never ships
 *     server-side (no hydration cost, no SSR errors).
 *   - Wrapped in a Suspense fallback so the rest of the section paints
 *     immediately while the canvas spins up.
 *   - `prefers-reduced-motion` aware — when reduced motion is on we skip
 *     the canvas entirely and just render the marketing copy on a flat
 *     background so the page stays accessible and battery-friendly.
 *
 * The Canvas inside Antigravity uses `eventSource={sectionRef}`, which
 * binds r3f pointer listeners to the surrounding `<section>` via event
 * bubbling. This lets the cursor magnet follow the mouse even when it's
 * hovering over text — without us having to clobber text selection with
 * `pointer-events: none`.
 *
 * Each example passes its own palette (color of the particles + page bg)
 * and its own copy via `children`. The motion field stays the same across
 * pages so the brand language reads consistently.
 */

import dynamic from "next/dynamic";
import { useRef, type CSSProperties, type ComponentType, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface AntigravityProps {
  color: string;
  count: number;
  ringRadius: number;
  particleSize: number;
  waveSpeed: number;
  fieldStrength: number;
  magnetRadius: number;
  lerpSpeed: number;
  depthFactor: number;
  particleShape: "capsule" | "sphere" | "box" | "tetrahedron";
  autoAnimate?: boolean;
  eventSource?: React.RefObject<HTMLElement | null> | HTMLElement;
}

const Antigravity = dynamic(
  () => import("./Antigravity"),
  { ssr: false, loading: () => null },
) as unknown as ComponentType<AntigravityProps>;

export interface AntigravitySectionProps {
  /** Particle hex color (with leading `#`). */
  color?: string;
  /** Section background — picks up the page palette. */
  bg?: string;
  /** Default text color inside the section. */
  textColor?: string;
  /** Override section padding (default `py-24 sm:py-32`). */
  paddingClass?: string;
  /** Optional extra Tailwind classes on the outer `<section>`. */
  className?: string;
  /** Soft inner shadow that softens the particle edges. */
  vignette?: boolean;
  /** Marketing copy + CTA goes in here. */
  children: ReactNode;

  // === Antigravity canvas params (passed through) ===
  count?: number;
  ringRadius?: number;
  particleSize?: number;
  waveSpeed?: number;
  fieldStrength?: number;
  magnetRadius?: number;
  lerpSpeed?: number;
  depthFactor?: number;
  particleShape?: "capsule" | "sphere" | "box" | "tetrahedron";
}

export function AntigravitySection({
  color = "#84CC16",
  bg = "#0a0a0a",
  textColor,
  paddingClass = "py-24 sm:py-32",
  className,
  vignette = true,
  children,
  count = 1800,
  ringRadius = 8,
  particleSize = 0.4,
  waveSpeed = 0.8,
  fieldStrength = 3.2,
  magnetRadius = 9,
  lerpSpeed = 0.06,
  depthFactor = 1.1,
  particleShape = "capsule",
}: AntigravitySectionProps) {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const sectionStyle: CSSProperties = {
    background: bg,
    color: textColor,
  };

  return (
    <section
      ref={sectionRef}
      className={cn("relative isolate overflow-hidden", className)}
      style={sectionStyle}
    >
      {/* Canvas — `eventSource={sectionRef}` is consumed by our patched
          Antigravity, which attaches its own pointermove listener to the
          section and re-reads getBoundingClientRect on every event. That
          way the cursor magnet (a) follows the mouse over text/buttons
          (events bubble from descendants → section), and (b) stays
          pixel-accurate after the user scrolls — r3f's default event
          compute caches top/left at ResizeObserver-time and drifts on
          scroll, which is the bug this works around. */}
      {!reducedMotion && (
        <div className="absolute inset-0" aria-hidden>
          <Antigravity
            color={color}
            count={count}
            ringRadius={ringRadius}
            particleSize={particleSize}
            waveSpeed={waveSpeed}
            fieldStrength={fieldStrength}
            magnetRadius={magnetRadius}
            lerpSpeed={lerpSpeed}
            depthFactor={depthFactor}
            particleShape={particleShape}
            autoAnimate
            eventSource={sectionRef}
          />
        </div>
      )}

      {/* Vignette — pointer-events-none so it doesn't block bubbling. */}
      {vignette && (
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          aria-hidden
          style={{
            background: `radial-gradient(ellipse at center, transparent 35%, ${bg} 100%)`,
          }}
        />
      )}

      {/* Content layer — normal pointer events. Text is selectable, links
          and buttons click, and r3f still sees the mouse via bubbling. */}
      <div
        className={cn(
          "relative z-10 mx-auto flex max-w-7xl items-center justify-center px-4 sm:px-6",
          paddingClass,
        )}
      >
        {children}
      </div>
    </section>
  );
}
