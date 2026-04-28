"use client";

import { useTranslations } from "next-intl";
import { locales, type Locale } from "@/i18n.config";

function getCurrentLocale(): Locale {
  if (typeof document === "undefined") return "ru";
  const match = document.cookie.match(/(?:^|;\s*)tappjet_locale=([^;]+)/);
  const val = match?.[1];
  return val === "kg" ? "kg" : "ru";
}

export function LocaleSwitcher() {
  const t = useTranslations("locale");
  const current = getCurrentLocale();

  const switchTo = (locale: Locale) => {
    document.cookie = `tappjet_locale=${locale};path=/;max-age=31536000;samesite=lax`;
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2">
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => switchTo(locale)}
          className={
            locale === current
              ? "rounded-lg bg-teal-50 px-3 py-1.5 text-[13px] font-bold text-teal-700 ring-1 ring-teal-300"
              : "rounded-lg px-3 py-1.5 text-[13px] font-semibold text-gray-500 hover:bg-gray-50"
          }
        >
          {t(locale)}
        </button>
      ))}
    </div>
  );
}
