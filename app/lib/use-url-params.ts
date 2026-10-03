import { useCallback } from "react";
import { useSearchParams } from "react-router";

/**
 * Structured list state in the URL (filters, sort, page, drawer id) so refresh, back/forward
 * and shared links work (DSH-GEN-04). Changing anything but `page` resets to page 1.
 */
export function useUrlParams() {
  const [params, setParams] = useSearchParams();

  const get = useCallback((key: string) => params.get(key) ?? undefined, [params]);

  const set = useCallback(
    (updates: Record<string, string | number | boolean | undefined | null>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(updates)) {
            if (value === undefined || value === null || value === "" || value === false) next.delete(key);
            else next.set(key, String(value));
          }
          if (!("page" in updates)) next.delete("page");
          return next;
        },
        { replace: true, preventScrollReset: true },
      );
    },
    [setParams],
  );

  return { params, get, set };
}
