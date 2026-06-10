import { Skeleton } from "@/components/ui/skeleton";

/**
 * Tuned fallback for /zespol/grafik — mirrors the agenda layout (a day heading
 * over a stack of visit rows, each with two text lines and an action button row)
 * so the swap reads as the same page loading.
 */
export default function GrafikLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      <Skeleton className="mb-6 h-8 w-32" />
      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, s) => (
          <section key={s}>
            <Skeleton className="mb-3 h-3 w-40" />
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-neutral-200 bg-white p-3">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="mt-2 h-3 w-1/3" />
                  <div className="mt-3 flex gap-2">
                    <Skeleton className="h-7 w-24 rounded-lg" />
                    <Skeleton className="h-7 w-20 rounded-lg" />
                    <Skeleton className="h-7 w-28 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
