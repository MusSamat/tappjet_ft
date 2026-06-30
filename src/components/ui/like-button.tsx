"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { likeTrip, unlikeTrip } from "@/lib/api/trips";
import { likePassengerRequest, unlikePassengerRequest } from "@/lib/api/passenger-requests";
import { useAuth } from "@/store/auth";
import { cn } from "@/lib/utils/cn";

interface LikeButtonProps {
  targetType: "trip" | "passenger_request";
  id: string;
  liked: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function LikeButton({ targetType, id, liked, className, size = "md" }: LikeButtonProps) {
  const t = useTranslations("engagement");
  const router = useRouter();
  const authStatus = useAuth((s) => s.status);
  const qc = useQueryClient();
  const [optimistic, setOptimistic] = useState(liked);

  // Re-sync with server truth after refetch/invalidation.
  useEffect(() => {
    setOptimistic(liked);
  }, [liked]);

  const mutation = useMutation({
    mutationFn: async (next: boolean): Promise<{ liked: boolean }> => {
      if (targetType === "trip") {
        return next ? likeTrip(id) : unlikeTrip(id);
      }
      return next ? likePassengerRequest(id) : unlikePassengerRequest(id);
    },
    onError: () => setOptimistic((v) => !v),
    onSettled: () => {
      if (targetType === "trip") {
        void qc.invalidateQueries({ queryKey: ["trips"] });
        void qc.invalidateQueries({ queryKey: ["trip", id] });
      } else {
        void qc.invalidateQueries({ queryKey: ["passenger-requests"] });
      }
    },
  });

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (authStatus !== "authenticated") {
      router.push("/auth/login");
      return;
    }
    const next = !optimistic;
    setOptimistic(next);
    mutation.mutate(next);
  };

  const iconCls = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const boxCls = size === "sm" ? "h-8 w-8" : "h-9 w-9";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={optimistic}
      aria-label={optimistic ? t("unlike") : t("like")}
      className={cn(
        "inline-flex flex-shrink-0 items-center justify-center rounded-full bg-white/80 text-ink-400 transition-colors hover:bg-coral-100 hover:text-coral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:ring-offset-1",
        boxCls,
        className,
      )}
    >
      <Heart className={cn(iconCls, optimistic && "fill-coral-500 text-coral-500")} aria-hidden="true" />
    </button>
  );
}
