import { useEffect, useRef, useState } from "react";

/**
 * Generic page-level data hook that tracks loading and error states.
 * Pages use this to gate rendering behind a consistent loading/error boundary.
 */
export function usePageData<T>(
  fetchFn: () => Promise<T> | T,
  deps: any[] = [],
  initialData?: T
): { data: T | undefined; isLoading: boolean; error: string | null; refetch: () => void } {
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const run = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      if (isMountedRef.current) {
        setData(result);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err?.message || "An unexpected error occurred.");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    run();
    return () => {
      isMountedRef.current = false;
    };
  }, deps);

  return { data, isLoading, error, refetch: run };
}
