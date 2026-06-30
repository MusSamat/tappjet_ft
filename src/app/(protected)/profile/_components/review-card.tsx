"use client";

import { DriverAvatar, RatingStars } from "@/components/ui";
import { formatShortDate } from "@/lib/utils/date";

export function ReviewCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-ink-100 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="h-3 w-12 rounded bg-gray-200" />
          </div>
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="h-3 w-full rounded bg-gray-200" />
          <div className="h-3 w-3/4 rounded bg-gray-200" />
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
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4">
      <div className="flex items-start gap-3">
        <DriverAvatar name={review.rater.name} src={review.rater.avatarUrl} size="md" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-bold text-gray-900">{review.rater.name}</span>
            <span className="text-[11px] text-gray-400">
              {formatShortDate(review.createdAt)}
            </span>
          </div>
          <div className="mt-0.5">
            <RatingStars value={review.score} size={12} />
          </div>
          {review.comment && (
            <p className="mt-2 text-[13px] leading-relaxed text-gray-700">{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
}
