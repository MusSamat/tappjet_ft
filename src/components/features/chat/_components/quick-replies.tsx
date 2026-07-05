"use client";

// Pre-booking chat: curated template picker instead of free text (TZ анти-обход:
// до принятия брони произвольный текст закрыт — телефон физически не утечёт).
// Two-level UX: theme chip → phrase chips. Phrases are i18n keys; the sent
// message is the localized plain text of the sender's language.

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Clock, MapPin, Briefcase, Hand, CheckCircle, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const THEMES = [
  { key: "greeting", icon: Hand, phrases: ["hello_actual", "seats_free", "still_going"] },
  { key: "time", icon: Clock, phrases: ["what_time", "on_time", "late_5", "late_15", "already_here"] },
  { key: "place", icon: MapPin, phrases: ["where_meet", "pickup_me", "come_to_point", "at_station"] },
  { key: "luggage", icon: Briefcase, phrases: ["one_person", "two_persons", "have_luggage", "small_bag"] },
  { key: "wrapup", icon: CheckCircle, phrases: ["agreed", "thanks", "plans_changed"] },
] as const;

type ThemeKey = (typeof THEMES)[number]["key"];

export function QuickReplies({ onSend, disabled }: {
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("chat_templates");
  const [theme, setTheme] = useState<ThemeKey | null>(null);
  const active = THEMES.find((th) => th.key === theme);

  return (
    <div className="space-y-2">
      {!active ? (
        <div className="flex flex-wrap gap-1.5">
          {THEMES.map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => setTheme(key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-[12px] font-800 text-ink-700 shadow-soft ring-1 ring-ink-100 transition hover:ring-brand-300",
                "disabled:opacity-50 dark:bg-ink-900 dark:text-ink-200 dark:ring-ink-700",
              )}
            >
              <Icon className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
              {t(`theme_${key}`)}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setTheme(null)}
            aria-label={t("back")}
            className="inline-flex items-center rounded-full bg-ink-100 px-2.5 py-2 text-ink-500 dark:bg-ink-800"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          {active.phrases.map((p) => {
            const text = t(`p_${active.key}_${p}`);
            return (
              <button
                key={p}
                type="button"
                disabled={disabled}
                onClick={() => {
                  onSend(text);
                  setTheme(null);
                }}
                className="rounded-full bg-brand-50 px-3 py-2 text-[12px] font-800 text-brand-700 ring-1 ring-brand-200 transition hover:bg-brand-100 disabled:opacity-50 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/30"
              >
                {text}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
