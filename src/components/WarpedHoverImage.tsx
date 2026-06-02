"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Drop-in `<img>` replacement with a hover-only WebGL bulge warp.
 *
 *  - Static `<img>` is always rendered (SSR, SEO, fallback, fade-in
 *    base layer while the WebGL texture uploads).
 *  - A r3f Canvas with a bulge shader mounts only while the cursor is
 *    inside, and the bulge animates back to 0 on leave before the
 *    Canvas unmounts. Idle pages spawn zero WebGL contexts.
 *  - `next/dynamic({ ssr: false })` keeps three.js out of the initial
 *    bundle — the chunk loads the first time a user hovers any warped
 *    image on the page.
 *  - Reduced-motion users and touch-primary devices (`(hover: hover)
 *    and (pointer: fine)` fails) short-circuit to the static `<img>`
 *    path. No Canvas, no pointer handlers, no three.js download.
 */

function getHoverSnapshot(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function")
    return true;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function getHoverServerSnapshot(): boolean {
  // SSR defaults to "desktop has hover". The client reconciles on first
  // paint via useSyncExternalStore without a hydration warning.
  return true;
}

function subscribeHover(onChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function")
    return () => {};
  const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (mq.addEventListener) mq.addEventListener("change", onChange);
   
  else mq.addListener(onChange);
  return () => {
    if (mq.removeEventListener) mq.removeEventListener("change", onChange);
     
    else mq.removeListener(onChange);
  };
}

function useHasHoverCapability(): boolean {
  return useSyncExternalStore(
    subscribeHover,
    getHoverSnapshot,
    getHoverServerSnapshot,
  );
}

const WarpedCard = dynamic(() => import("./react-bits/warped-card"), {
  ssr: false,
  loading: () => null,
});

/**
 * How long to keep the Canvas mounted after pointerleave. The bulge
 * animates back to 0 over `transitionDuration` seconds inside WarpedCard;
 * we add a small cushion so quick re-hovers don't churn WebGL context
 * creation (each new context costs 30–50ms and counts toward the
 * browser's hard cap of ~16 live contexts).
 */
const UNMOUNT_DELAY_MS = 1200;

export interface WarpedHoverImageProps {
  src: string;
  alt: string;
  /**
   * Applied to BOTH the static `<img>` and the Canvas wrapper so CSS
   * filters (grayscale, sepia, saturate) and `object-fit` propagate to
   * both layers and the warped pixels match the static look at bulge=0.
   * Don't put aspect-ratio here — the parent wrapper should own that.
   */
  className?: string;
  /** Bulge strength at full hover, 0–2. Default 1.1. */
  strength?: number;
  /** Bulge radius as a fraction of the card, 0–1. Default 0.95. */
  radius?: number;
  /** Easing time in seconds for hover in/out. Default 0.8. */
  transitionDuration?: number;
  /** Force-disable the effect (renders bare `<img>` only). */
  disabled?: boolean;
}

export function WarpedHoverImage({
  src,
  alt,
  className,
  strength = 1.1,
  radius = 0.95,
  transitionDuration = 0.8,
  disabled = false,
}: WarpedHoverImageProps) {
  const reduced = useReducedMotion();
  const hasHover = useHasHoverCapability();

  // `mounted` keeps the Canvas alive until UNMOUNT_DELAY_MS after the
  // pointer left, so the bulge can animate back to 0 smoothly.
  const [mounted, setMounted] = useState(false);
  // `active` is the prop we hand to WarpedCard — it drives the bulge
  // target (1 while pointer is inside, 0 once it leaves).
  const [active, setActive] = useState(false);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  const handleEnter = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setMounted(true);
    setActive(true);
  }, []);

  const handleLeave = useCallback(() => {
    setActive(false);
    leaveTimerRef.current = setTimeout(() => {
      setMounted(false);
    }, UNMOUNT_DELAY_MS);
  }, []);

  // ALWAYS render the same wrapper structure — `<div><img></div>` —
  // regardless of whether the warp is active or not. This prevents a
  // hydration-time DOM swap on mobile: SSR runs with `hasHover=true`
  // (desktop default) and `useSyncExternalStore` flips it false on the
  // client. If we conditionally returned a bare `<img>` for the
  // touch/reduced-motion path, React would re-parent the image, the
  // browser would treat it as a new node, and the StaggerItem entrance
  // would flash through a half-loaded image.  Keeping the wrapper means
  // only the event handlers + Canvas vary; the img keeps its identity.
  const isInteractive = !(disabled || reduced || !hasHover);
  return (
    <div
      className="relative size-full"
      onPointerEnter={isInteractive ? handleEnter : undefined}
      onPointerLeave={isInteractive ? handleLeave : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={className} />
      {isInteractive && mounted && (
        <WarpedCard
          imageSrc={src}
          radius={radius}
          strength={strength}
          transitionDuration={transitionDuration}
          active={active}
          className={cn("absolute inset-0", className)}
        />
      )}
    </div>
  );
}
