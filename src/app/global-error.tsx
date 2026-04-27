"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

type Locale = "ru" | "kg";

const MSGS: Record<Locale, { title: string; desc: string; retry: string; code: string }> = {
  ru: {
    title: "Что-то пошло не так",
    desc: "Произошла непредвиденная ошибка. Попробуйте обновить страницу.",
    retry: "Попробовать снова",
    code: "Код: ",
  },
  kg: {
    title: "Бир нерсе туура эмес болду",
    desc: "Күтүлбөгөн ката кетти. Баракчаны жаңыртып көрүңүз.",
    retry: "Кайра аракет кылуу",
    code: "Код: ",
  },
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale, setLocale] = useState<Locale>("ru");

  useEffect(() => {
    const m = document.cookie.match(/(?:^|;\s*)tappjet_locale=([^;]+)/);
    if (m?.[1] === "kg") setLocale("kg");
  }, []);

  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  const msg = MSGS[locale];

  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center bg-white px-5 py-12 text-center font-sans">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-8 w-8 text-red-500" aria-hidden="true" />
        </div>
        <h1 className="text-[22px] font-extrabold text-gray-900">{msg.title}</h1>
        <p className="mt-2 max-w-sm text-[14px] text-gray-500">{msg.desc}</p>
        {error.digest && (
          <p className="mt-1 font-mono text-[11px] text-gray-400">{msg.code}{error.digest}</p>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-6 flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-[14px] font-bold text-white hover:bg-teal-700"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {msg.retry}
        </button>
      </body>
    </html>
  );
}
