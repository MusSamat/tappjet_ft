"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 py-12 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle className="h-7 w-7 text-red-500" aria-hidden="true" />
      </div>
      <h1 className="text-[20px] font-extrabold text-gray-900">Ошибка</h1>
      <p className="mt-2 text-[13px] text-gray-500">
        Произошла ошибка. Попробуйте перезагрузить страницу.
      </p>
      {error.digest && (
        <p className="mt-1 font-mono text-[11px] text-gray-400">Код: {error.digest}</p>
      )}
      <button
        type="button"
        onClick={reset}
        className="mt-6 flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-[13px] font-bold text-white hover:bg-red-700"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Повторить
      </button>
    </div>
  );
}
