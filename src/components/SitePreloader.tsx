"use client";

/**
 * SitePreloader — first-paint preloader with brand block, themed per example.
 *
 * Pattern adapted from psylesny-zaulek: sessionStorage gate (per `storageKey`)
 * so the preloader only shows on first visit, default `loading=true` so SSR
 * renders the overlay, and `prefers-reduced-motion` respected. The brand block
 * sits on its own fixed layer above the react-bits Preloader so the variant's
 * exit animation (stairs / slide / curtain / etc.) still plays as designed.
 */

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import Preloader, {
  type PreloaderProps,
} from "@/components/react-bits/preloader";

function LeafIcon({
  size = 56,
  style,
  className,
}: {
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={style}
      className={className}
    >
      <path d="M12 2c-3 4-6 7-6 11a6 6 0 0 0 12 0c0-4-3-7-6-11z" />
    </svg>
  );
}

export interface SitePreloaderProps {
  /** Session storage key — unique per example */
  storageKey: string;
  /** How long the preloader stays before exiting */
  duration?: number;
  /** react-bits variant */
  variant?: PreloaderProps["variant"];
  /** Stairs configuration (only when variant="stairs") */
  stairCount?: number;
  stairsRevealFrom?: PreloaderProps["stairsRevealFrom"];

  /** Solid background color of the preloader */
  bgColor: string;

  /** Brand text (default: "Ogrody Kryscar") */
  brandName?: string;
  /** Brand subtitle (default: "Pracownia ogrodnicza") */
  tagline?: string;
  /** Tailwind classes for the brand name */
  brandClassName?: string;
  /** Tailwind classes for the tagline */
  taglineClassName?: string;
  /** Replace the whole brand block (overrides brandName/tagline) */
  brand?: ReactNode;
  /** Custom icon node (defaults to LeafIcon) */
  icon?: ReactNode;
  /** Fill color of the default leaf icon */
  iconColor?: string;
  /** Pixel size of the default leaf icon */
  iconSize?: number;
  /** Skip rendering the icon entirely */
  hideIcon?: boolean;
}

const HOLD_DEFAULT = 1500;
const STORAGE_VALUE = "1";

export function SitePreloader({
  storageKey,
  duration = HOLD_DEFAULT,
  variant = "slide",
  stairCount,
  stairsRevealFrom,
  bgColor,
  brandName = "Ogrody Kryscar",
  tagline = "Pracownia ogrodnicza",
  brandClassName = "text-4xl md:text-5xl font-medium tracking-tight",
  taglineClassName = "text-[10px] uppercase tracking-[0.4em] font-medium opacity-70",
  brand,
  icon,
  iconColor,
  iconSize = 56,
  hideIcon = false,
}: SitePreloaderProps) {
  // `loading` starts true so the preloader is part of the SSR HTML — the first
  // paint is the preloader, not the page content. Don't gate on a `mounted`
  // flag here: that would suppress the SSR render and let page content flash
  // before hydration.
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem(storageKey) === STORAGE_VALUE;
    } catch {
      alreadySeen = true; // private mode / blocked → skip
    }
    if (alreadySeen) {
      setSkip(true);
      setLoading(false);
      return;
    }
    const id = window.setTimeout(() => {
      setLoading(false);
      try {
        sessionStorage.setItem(storageKey, STORAGE_VALUE);
      } catch {
        /* noop */
      }
    }, duration);
    return () => window.clearTimeout(id);
  }, [storageKey, duration]);

  // After hydration, if we'd already seen the preloader this session, drop the
  // whole tree. The brief SSR paint is acceptable — much less jarring than
  // letting the full page content flash before the preloader.
  if (skip) return null;

  return (
    <>
      <Preloader
        loading={loading}
        variant={variant}
        position="fixed"
        zIndex={70}
        bgColor={bgColor}
        duration={duration}
        stairCount={stairCount}
        stairsRevealFrom={stairsRevealFrom}
        respectReducedMotion
        reducedMotionFallback="fade"
        ariaLabel="Ładowanie strony"
        loadingText=""
      />
      <AnimatePresence>
        {loading && (
          <motion.div
            key="brand-block"
            initial={{ opacity: 0, y: 8 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.55,
                delay: 0.12,
                ease: [0.22, 1, 0.36, 1],
              },
            }}
            exit={{
              opacity: 0,
              y: -6,
              transition: { duration: 0.18, ease: "easeOut" },
            }}
            className="pointer-events-none fixed inset-0 z-[71] flex items-center justify-center px-6"
            aria-hidden
          >
            {brand ?? (
              <div className="flex flex-col items-center gap-5 text-center">
                {hideIcon ? null : (
                  <div aria-hidden>
                    {icon ?? (
                      <LeafIcon size={iconSize} style={{ color: iconColor }} />
                    )}
                  </div>
                )}
                <div className="flex flex-col items-center gap-3">
                  <span className={brandClassName}>{brandName}</span>
                  {tagline ? (
                    <span className={taglineClassName}>{tagline}</span>
                  ) : null}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
