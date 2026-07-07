"use client";

import { useLocale } from "next-intl";
import { DriverAvatar, RatingStars } from "@/components/ui";
import { formatShortDate } from "@/lib/utils/date";
import type { Locale } from "@/i18n.config";

export function ReviewCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-ink-100 bg-white p-4 dark:bg-ink-900 dark:border-ink-800">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-ink-200 dark:bg-ink-800" />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <div className="h-4 w-24 rounded bg-ink-200 dark:bg-ink-800" />
            <div className="h-3 w-12 rounded bg-ink-200 dark:bg-ink-800" />
          </div>
          <div className="h-3 w-20 rounded bg-ink-200 dark:bg-ink-800" />
          <div className="h-3 w-full rounded bg-ink-200 dark:bg-ink-800" />
          <div className="h-3 w-3/4 rounded bg-ink-200 dark:bg-ink-800" />
        </div>
      </div>
    </div>
  );
}

export function ReviewCard({
  review,
}: {
  review: {
    id: string;
    rater: { name: string; avatarUrl: string | null };
    score: number;
    comment: string | null;
    createdAt: string;
  };
}) {
  const locale = useLocale() as Locale;
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4 dark:bg-ink-900 dark:border-ink-800">
      <div className="flex items-start gap-3">
        <DriverAvatar name={review.rater.name} src={review.rater.avatarUrl} size="md" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-bold text-ink-900 dark:text-white">{review.rater.name}</span>
            <span className="text-[11px] text-ink-400">
              {formatShortDate(review.createdAt, locale)}
            </span>
          </div>
          <div className="mt-0.5">
            <RatingStars value={review.score} size={12} />
          </div>
          {review.comment && (
            <p className="mt-2 text-[13px] leading-relaxed text-ink-700 dark:text-ink-300">{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
}
