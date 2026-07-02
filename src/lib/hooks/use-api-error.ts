"use client";

import { useCallback, useState } from "react";
import { useMessages } from "next-intl";
import { extractError } from "@/lib/api/client";
import {
  friendlyError,
  type ErrorShape,
  type ErrorTranslate,
} from "@/lib/utils/api-error";

type ErrorMessages = {
  api_errors?: Record<string, string>;
  api_error_codes?: Record<string, string>;
};

/** Builds a translator over the active-locale error dictionaries. */
function useErrorTranslate(): ErrorTranslate {
  const messages = useMessages() as ErrorMessages;
  return useCallback((namespace, key) => messages[namespace]?.[key], [messages]);
}

/** Returns a locale-aware friendlyError bound to the active translations. */
export function useFriendlyError() {
  const translate = useErrorTranslate();
  return useCallback((err: ErrorShape) => friendlyError(err, translate), [translate]);
}

export function useApiError() {
  const fe = useFriendlyError();
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback(
    (e: unknown) => {
      setError(fe(extractError(e)));
    },
    [fe],
  );

  const clearError = useCallback(() => setError(null), []);

  return { error, setError, handleError, clearError };
}
