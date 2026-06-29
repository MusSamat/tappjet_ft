"use client";

import { Eye, Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

interface ListingMetricsProps {
  metrics: { views: number; likes: number } | null;
  className?: string;
}

export function ListingMetrics({ metrics, className }: ListingMetricsProps) {
  const t = useTranslations("engagement");
  if (!metrics) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 text-[11px] font-semibold text-gray-400",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1" title={t("views")}>
        <Eye className="h-3 w-3" aria-hidden="true" />
        {metrics.views}
      </span>
      <span className="inline-flex items-center gap-1" title={t("likes")}>
        <Heart className="h-3 w-3" aria-hidden="true" />
        {metrics.likes}
      </span>
    </div>
  );
}
