"use client";

import { RefreshCw, ServerCrash } from "lucide-react";
import { useTranslations } from "next-intl";
import { extractError } from "@/lib/api/client";
import { useFriendlyError } from "@/lib/hooks/use-api-error";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface QueryErrorProps {
  /** The query error (unknown/AxiosError) — resolved via useFriendlyError. */
  error: unknown;
  /** Usually the query's refetch. */
  onRetry: () => void;
  className?: string;
}

/**
 * Standard inline error block for failed queries (design-spec §3.10):
 * danger medallion + friendly message + «Повторить» retry button.
 * Renders where the list/content would have been — distinct from empty states.
 */
export function QueryError({ error, onRetry, className }: QueryErrorProps) {
  const t = useTranslations("errors");
  const fe = useFriendlyError();

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-3xl bg-white p-6 text-center shadow-card ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800",
        className,
      )}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-100 text-danger-600 dark:bg-danger-500/15 dark:text-danger-400">
        <ServerCrash className="h-7 w-7" aria-hidden="true" />
      </span>
      <p className="max-w-[320px] text-[15px] font-700 text-ink-500 dark:text-ink-400">
        {fe(extractError(error))}
      </p>
      <Button type="button" variant="ghost" size="sm" onClick={onRetry}>
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        {t("repeat")}
      </Button>
    </div>
  );
}
