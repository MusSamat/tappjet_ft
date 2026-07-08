"use client";

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/store/auth";

/**
 * Wipes the query cache whenever the signed-in user CHANGES (logout or
 * account switch) — otherwise «Мои», cars, bookings etc. keep showing the
 * previous user's cached data in the same tab.
 */
function SessionCacheGuard() {
  const userId = useAuth((s) => s.user?.id);
  const qc = useQueryClient();
  const prev = useRef<string | undefined>(undefined);
  useEffect(() => {
    // Clear only when a REAL previous user differs (logout / account switch).
    // Anonymous → login keeps the public-feed cache; hydration is a no-op.
    if (typeof prev.current === "string" && prev.current !== userId) {
      qc.clear();
    }
    prev.current = userId;
  }, [userId, qc]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error: unknown) => {
              const status = (error as { response?: { status?: number } } | null)?.response?.status;
              if (status && status >= 400 && status < 500) return false;
              return failureCount < 3;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <SessionCacheGuard />
      {children}
    </QueryClientProvider>
  );
}
