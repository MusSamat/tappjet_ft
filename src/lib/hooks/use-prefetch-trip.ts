"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getTrip } from "@/lib/api/trips";

// Warm the trip detail (["trip", id]) before the user opens it, so the detail
// view has data ready. staleTime dedupes repeat calls, so hover + viewport can
// both fire safely and each card only actually fetches once.
export function usePrefetchTrip(): (id?: string | null) => void {
  const qc = useQueryClient();
  return useCallback(
    (id?: string | null) => {
      if (!id) return;
      void qc.prefetchQuery({
        queryKey: ["trip", id],
        queryFn: () => getTrip(id),
        staleTime: 60_000,
      });
    },
    [qc],
  );
}
