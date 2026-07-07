"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { locales, type Locale } from "@/i18n.config";
import { useTheme } from "@/components/theme-provider";
import { Segmented } from "@/components/ui/segmented";
import { switchLocale } from "@/components/ui/locale-switcher";
import { useAuth } from "@/store/auth";

// Quick settings on the profile — two full-width segmented controls (house
// style, no dead space): language on top, theme below. Language changes sync
// to the backend (Telegram notifications localize from user.language).

export function SettingsCard() {
  const t = useTranslations("profile");
  const tLocale = useTranslations("locale");
  const isAuthenticated = useAuth((s) => s.status === "authenticated");
  const current = useLocale() as Locale;
  const { resolvedTheme, setTheme } = useTheme();
  // Avoid hydration mismatch — theme is only known on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const themeValue: "light" | "dark" = mounted && resolvedTheme === "dark" ? "dark" : "light";

  return (
    <div className="space-y-2 rounded-4xl bg-white p-3 shadow-card dark:bg-ink-900">
      <Segmented<Locale>
        value={current}
        onChange={(l) => void switchLocale(l, isAuthenticated)}
        options={locales.map((l) => ({ value: l, label: tLocale(l) }))}
      />
      <Segmented<"light" | "dark">
        value={themeValue}
        onChange={(v) => setTheme(v)}
        options={[
          { value: "light", label: t("theme_light"), icon: <Sun className="h-4 w-4" aria-hidden="true" /> },
          { value: "dark", label: t("theme_dark"), icon: <Moon className="h-4 w-4" aria-hidden="true" /> },
        ]}
      />
    </div>
  );
}
