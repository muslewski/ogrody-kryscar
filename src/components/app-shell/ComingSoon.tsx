/**
 * Shared placeholder body for app sections that exist in the nav (so the IA is
 * real) but aren't built yet. Rendered inside AppShell's <main>, so it is a
 * plain block — no <main> of its own.
 */
export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
        {title}
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        Wkrótce — ta sekcja jest w przygotowaniu.
      </p>
    </div>
  );
}
