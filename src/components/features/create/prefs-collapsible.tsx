"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Chip, SectionLabel, OptionalTag } from "@/components/ui";
import type { UiRole } from "@/lib/role-colors";
import { cn } from "@/lib/utils/cn";

// Preferences collapsible — design-spec §2.4: header toggles a hidden chip
// grid. Chips use the brand ON recipe regardless of role.

export const PREF_KEYS = ["clean", "music", "no_smoking", "ac", "pets", "quiet", "chat", "women_only"] as const;
export type PrefKey = (typeof PREF_KEYS)[number];

const EMOJI: Record<PrefKey, string> = {
  clean: "✨",
  music: "🎵",
  no_smoking: "🚭",
  ac: "❄️",
  pets: "🐾",
  quiet: "🤫",
  chat: "💬",
  women_only: "👩",
};

interface Props {
  role: UiRole;
  prefs: Record<PrefKey, boolean>;
  onToggle: (k: PrefKey) => void;
}

export function PrefsCollapsible({ role, prefs, onToggle }: Props) {
  const t = useTranslations("create");
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-3xl bg-white p-4 shadow-card dark:bg-ink-900">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2"
        aria-expanded={open}
      >
        <SlidersHorizontal className="h-4 w-4 text-ink-500" aria-hidden="true" />
        <SectionLabel>{t("prefs_title")}</SectionLabel>
        <OptionalTag />
        <ChevronDown className={cn("ml-auto h-4 w-4 text-ink-400 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open && (
        <>
          <p className="mb-3 mt-3 text-[14px] font-700 text-ink-400">
            {role === "driver" ? t("prefs_hint_driver") : t("prefs_hint_passenger")}
          </p>
          <div className="flex flex-wrap gap-2">
            {PREF_KEYS.map((k) => (
              <Chip key={k} kind="pref" accent="brand" selected={prefs[k]} onClick={() => onToggle(k)}>
                {EMOJI[k]} {t(`pref_${k}`)}
              </Chip>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
