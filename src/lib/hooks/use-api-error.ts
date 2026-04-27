"use client";

import { useCallback, useState } from "react";
import { extractError } from "@/lib/api/client";
import { friendlyError } from "@/lib/utils/api-error";

export function useApiError() {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((e: unknown) => {
    setError(friendlyError(extractError(e)));
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { error, setError, handleError, clearError };
}
