"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { saveDeferredAction } from "@/lib/auth/deferred-action";
import { useAuth } from "@/store/auth";
import { AddPhoneModal } from "@/components/features/auth/add-phone-modal";

interface Props {
  tripId: string;
  seatsAvailable: number;
  driverId?: string;
  disabled?: boolean;
}

export function BookButton({ tripId, seatsAvailable, driverId, disabled }: Props) {
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
    return <div className="h-20 animate-pulse rounded-2xl bg-ink-100" />;
  }

  if (isOwnTrip) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-center">
        <p className="text-body font-bold text-brand-700">Это ваша поездка</p>
        <p className="mt-1 text-caption text-brand-600">Вы водитель этого маршрута</p>
      </div>
    );
  }

  if (soldOut) {
    return (
      <div className="rounded-2xl border border-ink-200 bg-ink-50 p-4 text-center">
        <p className="text-body font-bold text-ink-700">Мест больше нет</p>
        <p className="mt-1 text-caption text-ink-500">Попробуйте другую поездку</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <label className="flex items-center justify-between rounded-2xl border border-ink-200 bg-white p-4">
          <span className="text-body font-bold text-ink-900">Количество мест</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSeats((s) => Math.max(1, s - 1))}
              aria-label="Меньше мест"
              disabled={seats <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-300 text-h2 text-ink-900 hover:bg-ink-100 disabled:opacity-40"
            >
              −
            </button>
            <span className="min-w-[24px] text-center text-h2 font-extrabold">{seats}</span>
            <button
              type="button"
              onClick={() => setSeats((s) => Math.min(max, s + 1))}
              aria-label="Больше мест"
              disabled={seats >= max}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-300 text-h2 text-ink-900 hover:bg-ink-100 disabled:opacity-40"
            >
              +
            </button>
          </div>
        </label>

        <Button type="button" variant="submit" size="lg" onClick={handleClick} disabled={disabled}>
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Забронировать
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
