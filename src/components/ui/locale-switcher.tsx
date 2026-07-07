"use client";

import { useTranslations, useLocale } from "next-intl";
import { locales, type Locale } from "@/i18n.config";
import { updateProfile } from "@/lib/api/auth";
import { useAuth } from "@/store/auth";

export function LocaleSwitcher() {
  const t = useTranslations("locale");
  const isAuthenticated = useAuth((s) => s.status === "authenticated");
  // useLocale — the SAME locale the page's translations render with, identical
  // on server and client. Reading document.cookie here rendered "ru" during
  // SSR and React never patches the mismatched active class after hydration —
  // that's why the interface could be Kyrgyz while the switcher highlighted RU.
  const current = useLocale() as Locale;

  const switchTo = async (locale: Locale) => {
    document.cookie = `tappjet_locale=${locale};path=/;max-age=31536000;samesite=lax`;
    // Keep the backend copy in sync — Telegram notifications are localized
    // from user.language, not the cookie. Best-effort: a failure must not
    // block the UI switch.
    if (isAuthenticated) {
      try {
        await updateProfile({ language: locale });
      } catch {
        /* offline / token refresh in flight — cookie switch still applies */
      }
    }
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
              ? "rounded-lg bg-brand-50 px-3 py-1.5 text-[13px] font-bold text-brand-700 ring-1 ring-brand-300"
              : "rounded-lg px-3 py-1.5 text-[13px] font-semibold text-ink-500 hover:bg-ink-50 dark:text-ink-400 dark:hover:bg-ink-800"
          }
        >
          {t(locale)}
        </button>
      ))}
    </div>
  );
}
