import { Skeleton } from "@/components/ui/skeleton";

/**
 * Generic Suspense fallback for the /zespol segment (dashboard, klienci,
 * ustawienia). The AppShell chrome lives in zespol/layout.tsx and persists across
 * navigations, so only this content area swaps — the skeleton paints instantly
 * while the dynamic page (auth + Neon queries) streams in. /zlecenia and /grafik
 * ship their own tuned fallbacks (nested loading.tsx). Mirrors the dashboard's
 * heading + two stacked summary cards. See panel/loading.tsx for the rationale.
 */
export default function ZespolLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-3 h-4 w-72" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-2xl border border-neutral-200 p-5"
          >
            <div className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-7 w-40" />
            </div>
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
