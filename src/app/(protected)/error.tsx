"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

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
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-coral-50">
        <AlertTriangle className="h-7 w-7 text-coral-500" aria-hidden="true" />
      </div>
      <h1 className="text-[20px] font-extrabold text-gray-900">{t("page_title")}</h1>
      <p className="mt-2 max-w-sm text-[13px] text-gray-500">{t("page_desc")}</p>
      {error.digest && (
        <p className="mt-1 font-mono text-[11px] text-gray-400">{t("code", { code: error.digest })}</p>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-[13px] font-bold text-white hover:bg-teal-700"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {t("repeat")}
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          {t("home")}
        </button>
      </div>
    </div>
  );
}
