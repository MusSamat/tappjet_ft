"use client";

import { Award } from "lucide-react";
import { useTranslations } from "next-intl";

const TIER_COLORS: Record<string, string> = {
  novice: "bg-ink-100 text-ink-600",
  traveler: "bg-sky-50 text-sky-700",
  expert: "bg-purple-50 text-purple-700",
  elite: "bg-accent-50 text-accent-700",
};

export function LoyaltyTierBadge({ tier }: { tier: string }) {
  const t = useTranslations("profile");
  const tierLabel =
    tier === "novice" ? t("tier_novice") :
    tier === "traveler" ? t("tier_traveler") :
    tier === "expert" ? t("tier_expert") :
    tier === "elite" ? t("tier_elite") : tier;
  return (
    <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${TIER_COLORS[tier] ?? "bg-ink-100 text-ink-600"}`}>
      <Award className="h-3 w-3" aria-hidden="true" />
      {tierLabel}
    </span>
  );
}
