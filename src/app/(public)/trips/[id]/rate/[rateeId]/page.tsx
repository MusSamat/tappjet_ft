"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  DRIVER_TAGS,
  PASSENGER_TAGS,
  getPendingRatings,
  submitRating,
  type SubmitRatingInput,
} from "@/lib/api/ratings";
import { Button, Spinner, Textarea, DriverAvatar } from "@/components/ui";
import { useAuth } from "@/store/auth";
import { cn } from "@/lib/utils/cn";
import { saveDeferredAction } from "@/lib/auth/deferred-action";

const MAX_COMMENT = 500;

interface Props {
  params: { id: string; rateeId: string };
}

export default function RatePage({ params }: Props) {
  const { id: tripId, rateeId } = params;
  const router = useRouter();
  const t = useTranslations("rate");
  const status = useAuth((s) => s.status);

  useEffect(() => {
    if (status === "anonymous") {
      saveDeferredAction({ action: "rate_user", trip_id: tripId, ratee_id: rateeId });
      router.replace("/auth/login");
    }
  }, [status, tripId, rateeId, router]);

  const { data: pendingList, isLoading } = useQuery({
    queryKey: ["ratings", "pending"],
    queryFn: getPendingRatings,
    enabled: status === "authenticated",
    staleTime: 60_000,
  });

  const pending = useMemo(
    () => pendingList?.data.find((p) => p.tripId === tripId && p.counterpartId === rateeId),
    [pendingList, tripId, rateeId],
  );

  const [score, setScore] = useState<1 | 2 | 3 | 4 | 5 | 0>(0);
  const [hover, setHover] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const tagList = pending?.direction === "driver" ? DRIVER_TAGS : PASSENGER_TAGS;

  const toggleTag = (v: string) =>
    setTags((prev) => (prev.includes(v) ? prev.filter((t) => t !== v) : [...prev, v]));

  const { mutate, isPending, error } = useMutation({
    mutationFn: (input: SubmitRatingInput) => submitRating(input),
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => router.push("/my/bookings"), 2000);
    },
  });

  if (status === "loading" || status === "idle" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container max-w-lg py-16 text-center">
        {/* Animated stars burst */}
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-amber-100 opacity-60" style={{ animationDuration: "1.2s" }} />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-amber-50">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="absolute h-5 w-5 fill-amber-400 text-amber-400"
                style={{
                  transform: `rotate(${i * 72}deg) translateY(-36px)`,
                  animation: `cardIn 0.4s ease both`,
                  animationDelay: `${i * 80}ms`,
                }}
                aria-hidden="true"
              />
            ))}
            <span className="text-[32px]">🙌</span>
          </div>
        </div>
        <h1 className="text-[26px] font-extrabold text-gray-900">{t("success_title")}</h1>
        <p className="mx-auto mt-3 max-w-[320px] text-[15px] leading-relaxed text-gray-600">
          {t("success_desc")}
        </p>
        <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-amber-300" />
        <p className="mt-4 text-[12px] font-semibold text-gray-400">{t("success_redirect")}</p>
      </div>
    );
  }

  if (!pending) {
    return (
      <div className="container max-w-lg py-20 text-center">
        <h1 className="text-h1 text-gray-900">{t("unavailable_title")}</h1>
        <p className="mt-2 text-body-lg text-gray-700">{t("unavailable_desc")}</p>
        <Button variant="primary" size="md" className="mt-6" onClick={() => router.push("/my/bookings")}>
          {t("my_bookings_link")}
        </Button>
      </div>
    );
  }

  const errMsg =
    error &&
    ((error as { code?: string }).code === "ALREADY_RATED"
      ? t("already_rated")
      : t("error"));

  return (
    <div className="mx-auto max-w-[520px] px-4 py-8">
      <button
        type="button"
        onClick={() => router.push("/my/bookings")}
        className="mb-4 inline-flex items-center gap-1 text-[13px] font-bold text-gray-600 hover:text-gray-900"
      >
        {t("back")}
      </button>

      <div className="rounded-[20px] border-[0.5px] border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <DriverAvatar name={pending.counterpartName} size="lg" />
          <div>
            <h1 className="text-[22px] font-extrabold text-gray-900">
              {t("question", { name: pending.counterpartName })}
            </h1>
          </div>
        </div>

        {/* Star score */}
        <div
          className="mt-6 flex items-center justify-center gap-2"
          role="radiogroup"
          aria-label={t("rating_aria")}
        >
          {([1, 2, 3, 4, 5] as const).map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={score === s}
              aria-label={t("star_aria", { n: s })}
              onClick={() => setScore(s)}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                className={cn(
                  "h-11 w-11 transition-colors",
                  (hover || score) >= s ? "fill-amber-400 text-amber-400" : "text-gray-300",
                )}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-[13px] font-semibold text-gray-500">
          {[t("label_0"), t("label_1"), t("label_2"), t("label_3"), t("label_4"), t("label_5")][score]}
        </p>

        {score > 0 && (
          <>
            {/* Tags */}
            <div className="mt-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {score >= 4 ? t("liked") : t("disliked")}
              </p>
              <div className="flex flex-wrap gap-2">
                {tagList.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleTag(value)}
                    className={cn(
                      "rounded-full border-[1.5px] px-3 py-1 text-[12px] font-bold transition-colors",
                      tags.includes(value)
                        ? "border-teal-600 bg-teal-50 text-teal-700"
                        : "border-gray-300 text-gray-700 hover:border-teal-400",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mt-4">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">{t("comment_label")}</p>
              <Textarea
                rows={3}
                maxLength={MAX_COMMENT}
                placeholder={t("comment_placeholder")}
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))}
              />
              <p className="mt-1 text-right text-[11px] text-gray-400">{comment.length}/{MAX_COMMENT}</p>
            </div>

            {/* Mutual review notice */}
            <div className="mt-4 rounded-[14px] bg-gray-50 p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg className="h-3.5 w-3.5 text-gray-700 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8z"/><path d="m9 12 2 2 4-4"/></svg>
                <span className="text-[13px] font-bold text-gray-900">{t("blind_title")}</span>
              </div>
              <p className="text-[12px] font-semibold text-gray-500">
                {t("blind_desc", { name: pending.counterpartName.split(" ")[0] })}
              </p>
            </div>

            {errMsg && (
              <p className="mt-3 rounded-xl bg-coral-50 px-4 py-2 text-[13px] font-semibold text-coral-700">{errMsg}</p>
            )}

            <Button
              variant="submit"
              size="lg"
              className="mt-5 w-full"
              disabled={score === 0 || isPending}
              onClick={() =>
                mutate({
                  tripId,
                  rateeId,
                  score: score as 1 | 2 | 3 | 4 | 5,
                  tags: tags.length ? tags : undefined,
                  comment: comment.trim() || undefined,
                })
              }
            >
              {isPending ? <Spinner size={18} /> : t("submit")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
