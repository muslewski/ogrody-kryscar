"use client";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";

export interface SliderImage {
  src: string;
  blurDataURL?: string;
  alt: string;
}

/**
 * Hand-rolled before/after comparison. The "after" image is the base layer;
 * the "before" image is layered on top and revealed from the left up to the
 * handle position via clip-path (so it never squishes). Drag (mouse/touch via
 * pointer events) or keyboard (←/→). Blur strings are passed in as props so the
 * client bundle doesn't import the whole BLUR_DATA map.
 */
export function BeforeAfterSlider({
  before,
  after,
}: {
  before: SliderImage;
  after: SliderImage;
}) {
  const [pos, setPos] = useState(50); // % revealed of "before" (from left)
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  return (
    <div
      ref={ref}
      className="relative aspect-[4/3] w-full touch-none select-none overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100"
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        setFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (dragging.current) setFromClientX(e.clientX);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
    >
      {/* AFTER (base) */}
      <Image
        src={after.src}
        alt={after.alt}
        fill
        sizes="(min-width: 768px) 768px, 100vw"
        className="object-cover"
        placeholder={after.blurDataURL ? "blur" : "empty"}
        blurDataURL={after.blurDataURL}
      />
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
        PO
      </span>

      {/* BEFORE (revealed from the left up to pos%) */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image
          src={before.src}
          alt={before.alt}
          fill
          sizes="(min-width: 768px) 768px, 100vw"
          className="object-cover"
          placeholder={before.blurDataURL ? "blur" : "empty"}
          blurDataURL={before.blurDataURL}
        />
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
          PRZED
        </span>
      </div>

      {/* Handle */}
      <div
        role="slider"
        aria-label="Porównanie przed i po — przesuń, aby odsłonić"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            setPos((p) => Math.max(0, p - 4));
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            setPos((p) => Math.min(100, p + 4));
          }
        }}
        className="absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 cursor-ew-resize bg-white/90 outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        style={{ left: `${pos}%` }}
      >
        <span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-neutral-800 shadow-md ring-1 ring-neutral-300">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 7l-4 5 4 5M16 7l4 5-4 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  );
}
