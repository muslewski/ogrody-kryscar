// src/lib/season.ts
/**
 * Seasonal engine for the winter arc.
 *
 * `isWinterActive` is pure (month + mode injected) so it is trivially
 * reasoned about and reusable. `isWinterNow` is the server-component
 * convenience that reads the current month. Pages that branch on the
 * season MUST set `export const revalidate = 86400` so the toggle flips
 * within a day without a redeploy (a statically-prerendered `new Date()`
 * would otherwise freeze at build time).
 *
 * Manual override: set WINTER.mode to "on" (force the winter push, e.g.
 * an early cold snap or promo) or "off" (suppress it). "auto" follows the
 * WINTER_MONTHS window (Nov–Mar).
 */

/** 1-based month numbers that count as "winter" (Nov, Dec, Jan, Feb, Mar). */
export const WINTER_MONTHS = [11, 12, 1, 2, 3] as const;

export type WinterMode = "auto" | "on" | "off";

/** Site-wide winter control. Flip `mode` to force the seasonal push on/off. */
export const WINTER: { mode: WinterMode } = { mode: "auto" };

/**
 * Pure: is winter active for a given 1-based month under the given mode?
 * @param month 1-based (1 = January … 12 = December)
 */
export function isWinterActive(
  month: number,
  mode: WinterMode = WINTER.mode,
): boolean {
  if (mode === "on") return true;
  if (mode === "off") return false;
  return (WINTER_MONTHS as readonly number[]).includes(month);
}

/** Server-component convenience: is winter active right now? */
export function isWinterNow(now: Date = new Date()): boolean {
  return isWinterActive(now.getMonth() + 1);
}
