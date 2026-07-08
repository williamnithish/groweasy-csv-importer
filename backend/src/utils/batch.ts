/** Splits an array into fixed-size chunks, preserving order. */
export function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) throw new Error("Chunk size must be greater than 0");
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/**
 * Runs async tasks with a bounded concurrency ("promise pool"),
 * preserving the original ordering of results.
 */
export async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function runNext(): Promise<void> {
    const current = cursor++;
    if (current >= items.length) return;
    results[current] = await worker(items[current], current);
    await runNext();
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => runNext());
  await Promise.all(workers);
  return results;
}
