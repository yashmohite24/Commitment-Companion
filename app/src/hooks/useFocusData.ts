import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

const cache = new Map<string, { data: unknown; at: number }>();

const DEFAULT_STALE_MS = 25_000;

function readCache<T>(key: string): T | null {
  const entry = cache.get(key);
  return entry ? (entry.data as T) : null;
}

function writeCache<T>(key: string, data: T) {
  cache.set(key, { data, at: Date.now() });
}

export function invalidateFocusData(key: string) {
  cache.delete(key);
}

export function invalidateAllFocusData() {
  cache.clear();
}

export function prefetchFocusData<T>(key: string, fetcher: () => Promise<T>) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.at < DEFAULT_STALE_MS) return;
  void fetcher().then((data) => writeCache(key, data));
}

export function invalidateTabListCaches(userId: string | undefined) {
  if (!userId) return;
  invalidateFocusData(`challenges:${userId}`);
  invalidateFocusData(`companion:${userId}`);
}

interface Options {
  staleMs?: number;
}

export function useFocusData<T>(
  key: string,
  fetcher: () => Promise<T>,
  deps: readonly unknown[],
  options?: Options,
) {
  const staleMs = options?.staleMs ?? DEFAULT_STALE_MS;
  const cached = readCache<T>(key);
  const [data, setData] = useState<T | null>(cached);
  const [loading, setLoading] = useState(cached === null);
  const inFlight = useRef(false);

  const refresh = useCallback(
    async (opts?: { force?: boolean; showLoading?: boolean }) => {
      const force = opts?.force ?? false;
      const showLoading = opts?.showLoading ?? false;
      const entry = cache.get(key);
      const isStale = !entry || Date.now() - entry.at > staleMs;

      if (!force && entry && !isStale) {
        setData(entry.data as T);
        return;
      }
      if (inFlight.current) return;

      inFlight.current = true;
      if (showLoading && !entry) setLoading(true);
      try {
        const next = await fetcher();
        writeCache(key, next);
        setData(next);
      } finally {
        inFlight.current = false;
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller supplies stable deps
    [key, staleMs, fetcher, ...deps],
  );

  useFocusEffect(
    useCallback(() => {
      const entry = cache.get(key);
      if (entry) setData(entry.data as T);
      refresh({ force: false, showLoading: !entry });
    }, [key, refresh]),
  );

  return { data, loading, refresh: () => refresh({ force: true, showLoading: false }) };
}
