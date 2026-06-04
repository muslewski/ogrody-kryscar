import { Skeleton } from "@/components/ui/skeleton";

/**
 * Suspense fallback for the whole /panel segment. The AppShell chrome (sidebar +
 * topbar) lives in panel/layout.tsx and persists across navigations, so only this
 * content area swaps — on click the skeleton paints instantly while the dynamic
 * page (auth + Neon queries) streams in behind it. Fixes the "frozen old page"
 * navigation stall: dynamic panel routes can't be data-prefetched, but a loading
 * boundary gives instant feedback. Generic heading + card grid reads correctly for
 * the dashboard, /ogrody and /zamowienia (card grids); acceptable for deeper routes.
 */
export default function PanelLoading() {
  return (
    <div className="mx-auto max-w-5xl">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-3 h-4 w-72" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-neutral-200"
          >
            <Skeleton className="aspect-[16/8] w-full rounded-none" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="mt-2 h-9 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
