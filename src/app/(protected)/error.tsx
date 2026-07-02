"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");
  const router = useRouter();

  useEffect(() => {
    console.error("[ProtectedError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 py-12 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-danger-100 text-danger-600 dark:bg-danger-500/10 dark:text-danger-400">
        <AlertTriangle className="h-8 w-8" aria-hidden="true" />
      </div>
      <h1 className="font-disp text-[20px] font-900 text-ink-900 dark:text-white">{t("page_title")}</h1>
      <p className="mt-2 max-w-sm text-[13px] font-600 text-ink-500 dark:text-ink-400">{t("page_desc")}</p>
      {error.digest && (
        <p className="mt-1 font-mono text-[11px] text-ink-400">{t("code", { code: error.digest })}</p>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button variant="brand" size="md" onClick={reset}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {t("repeat")}
        </Button>
        <Button variant="outline" size="md" onClick={() => router.push("/")}>
          <Home className="h-4 w-4" aria-hidden="true" />
          {t("home")}
        </Button>
      </div>
    </div>
  );
}
