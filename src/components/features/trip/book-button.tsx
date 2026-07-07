"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MessageCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";
import { saveDeferredAction } from "@/lib/auth/deferred-action";
import { useAuth } from "@/store/auth";
import { AddPhoneModal } from "@/components/features/auth/add-phone-modal";

interface Props {
  tripId: string;
  seatsAvailable: number;
  driverId?: string;
  disabled?: boolean;
  /** Viewer's active booking on this trip — blocks a duplicate up front. */
  myBooking?: { id: string; status: string } | null;
}

export function BookButton({ tripId, seatsAvailable, driverId, disabled, myBooking }: Props) {
  const t = useTranslations("book_button");
  const router = useRouter();
  const authStatus = useAuth((s) => s.status);
  const me = useAuth((s) => s.user);
  const [seats, setSeats] = useState(1);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const isOwnTrip = !!driverId && driverId === me?.id;
  const soldOut = seatsAvailable <= 0;
  const max = Math.min(4, Math.max(1, seatsAvailable));

  function proceedToBooking() {
    router.push(`/trips/${tripId}/book?seats=${seats}`);
  }

  const handleClick = () => {
    if (authStatus !== "authenticated") {
      saveDeferredAction({ action: "book_trip", trip_id: tripId, seats });
      router.push("/auth/login");
      return;
    }
    if (!me?.phoneVerified) {
      setShowPhoneModal(true);
      return;
    }
    proceedToBooking();
  };

  // While auth is bootstrapping, don't flash the booking form then switch to "own trip"
  if (authStatus === "idle" || authStatus === "loading") {
    return <div className="h-20 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800" />;
  }

  if (isOwnTrip) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-center">
        <p className="text-body font-bold text-brand-700">{t("own_trip_title")}</p>
        <p className="mt-1 text-caption text-brand-600">{t("own_trip_hint")}</p>
      </div>
    );
  }

  // Already booked this trip → no duplicate; offer the chat instead.
  if (myBooking) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-center">
        <p className="flex items-center justify-center gap-1.5 text-body font-bold text-brand-700">
          <CheckCircle className="h-4 w-4" aria-hidden="true" />
          {t("already_booked_title")}
        </p>
        <p className="mt-1 text-caption text-brand-600">{t("already_booked_hint")}</p>
        <Link href={`/my/bookings/${myBooking.id}/chat`} className="mt-3 inline-block">
          <Button type="button" variant="primary" size="md">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {t("already_booked_cta")}
          </Button>
        </Link>
      </div>
    );
  }

  if (soldOut) {
    return (
      <div className="rounded-2xl border border-ink-200 bg-ink-50 p-4 text-center dark:border-ink-800 dark:bg-ink-900">
        <p className="text-body font-bold text-ink-700 dark:text-white">{t("sold_out_title")}</p>
        <p className="mt-1 text-caption text-ink-500 dark:text-ink-400">{t("sold_out_hint")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <label className="flex items-center justify-between rounded-2xl border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">
          <span className="text-body font-bold text-ink-900 dark:text-white">{t("seats_label")}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSeats((s) => Math.max(1, s - 1))}
              aria-label={t("seat_minus")}
              disabled={seats <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-300 text-h2 text-ink-900 hover:bg-ink-100 disabled:opacity-40 dark:border-ink-700 dark:text-white dark:hover:bg-ink-800"
            >
              −
            </button>
            <span className="min-w-[24px] text-center text-h2 font-extrabold">{seats}</span>
            <button
              type="button"
              onClick={() => setSeats((s) => Math.min(max, s + 1))}
              aria-label={t("seat_plus")}
              disabled={seats >= max}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-300 text-h2 text-ink-900 hover:bg-ink-100 disabled:opacity-40 dark:border-ink-700 dark:text-white dark:hover:bg-ink-800"
            >
              +
            </button>
          </div>
        </label>

        <Button type="button" variant="submit" size="lg" onClick={handleClick} disabled={disabled}>
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          {t("book")}
        </Button>
      </div>

      <AddPhoneModal
        open={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onDone={proceedToBooking}
      />
    </>
  );
}
