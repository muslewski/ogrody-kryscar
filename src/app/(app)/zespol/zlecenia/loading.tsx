import { Skeleton } from "@/components/ui/skeleton";

/**
 * Tuned fallback for /zespol/zlecenia — mirrors the triage layout (section label
 * + a two-column grid of cards, each with the lawn map snapshot, title, service
 * chips and a price/action footer) so the swap reads as the same page loading.
 */
export default function ZleceniaLoading() {
  return (
    <div className="mx-auto max-w-4xl">
      <Skeleton className="mb-6 h-8 w-40" />
      <Skeleton className="mb-3 h-3 w-24" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <Skeleton className="mb-3 aspect-[16/6] w-full rounded-xl" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-2 h-3 w-1/2" />
            <div className="mt-3 flex gap-1.5">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
