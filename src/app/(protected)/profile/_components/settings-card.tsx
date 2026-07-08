"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useLocale } from "next-intl";
import { locales, type Locale } from "@/i18n.config";
import { useTheme } from "@/components/theme-provider";
import { Segmented } from "@/components/ui/segmented";
import { switchLocale } from "@/components/ui/locale-switcher";
import { useAuth } from "@/store/auth";

// Quick settings — one compact line: [RU|KG] + [☀|🌙]. Language codes and
// theme icons are language-neutral, no labels needed. Language changes sync
// to the backend (Telegram notifications localize from user.language).

export function SettingsCard() {
  const isAuthenticated = useAuth((s) => s.status === "authenticated");
  const current = useLocale() as Locale;
  const { resolvedTheme, setTheme } = useTheme();
  // Avoid hydration mismatch — theme is only known on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const themeValue: "light" | "dark" = mounted && resolvedTheme === "dark" ? "dark" : "light";

  return (
    <div className="flex gap-2 rounded-4xl bg-white p-2.5 shadow-card dark:bg-ink-900">
      <Segmented<Locale>
        className="flex-1"
        value={current}
        onChange={(l) => void switchLocale(l, isAuthenticated)}
        options={locales.map((l) => ({ value: l, label: l.toUpperCase() }))}
      />
      <Segmented<"light" | "dark">
        className="flex-1"
        value={themeValue}
        onChange={(v) => setTheme(v)}
        options={[
          { value: "light", label: "", icon: <Sun className="h-4 w-4" aria-hidden="true" /> },
          { value: "dark", label: "", icon: <Moon className="h-4 w-4" aria-hidden="true" /> },
        ]}
      />
    </div>
  );
}
