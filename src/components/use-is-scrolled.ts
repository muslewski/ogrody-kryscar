"use client";

import { useEffect, useState } from "react";

/**
 * Returns `true` once the page has scrolled past `threshold` px.
 * Pattern lifted from fadok's navigation-9 — single listener, passive,
 * fires on mount to handle deep-scroll page loads.
 */
export function useIsScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}
