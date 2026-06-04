/** Reject if the promise doesn't settle within `ms`. */
export function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

export interface ChainResult<T> {
  value: T;
  provider: string;
}

/**
 * Try providers in order. Each `run(provider)` is wrapped in a timeout; a provider
 * that throws, times out, or returns a value failing `isUsable` is skipped and the
 * next is tried. Returns the first usable result (and which provider answered), or
 * null if all fail. This is the failover seam — add providers by extending the array.
 */
export async function runChain<P extends { name: string }, T>(
  providers: P[],
  run: (p: P) => Promise<T>,
  isUsable: (v: T) => boolean,
  timeoutMs: number,
): Promise<ChainResult<T> | null> {
  for (const p of providers) {
    try {
      const value = await withTimeout(run(p), timeoutMs);
      if (isUsable(value)) return { value, provider: p.name };
    } catch {
      // skip this provider, try the next
    }
  }
  return null;
}
