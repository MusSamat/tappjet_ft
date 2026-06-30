"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Bell, Clock, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { createBooking } from "@/lib/api/bookings";
import { extractError } from "@/lib/api/client";
import { friendlyError } from "@/lib/utils/api-error";
import { uuid } from "@/lib/utils/uuid";
import { saveDeferredAction } from "@/lib/auth/deferred-action";
import { useAuth } from "@/store/auth";
import { Button, Label, NotifCard, Spinner, Textarea } from "@/components/ui";
import { formatPrice } from "@/lib/utils/date";

type Step = "form" | "waiting";

interface Props {
  tripId: string;
  pricePerSeat: number;
  seatsAvailable: number;
  initialSeats?: number;
  bookingId?: string;
}

export function BookForm({ tripId, pricePerSeat, seatsAvailable, initialSeats = 1 }: Props) {
  const router = useRouter();
  const status = useAuth((s) => s.status);

  const [step, setStep] = useState<Step>("form");
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [seats, setSeats] = useState(Math.min(initialSeats, Math.max(1, seatsAvailable)));
  const [comment, setComment] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const idempotencyKey = useMemo(() => uuid(), []);

  useEffect(() => {
    if (status === "anonymous") {
      saveDeferredAction({ action: "book_trip", trip_id: tripId, seats, comment });
      router.replace("/auth/login");
    }
  }, [status, tripId, seats, comment, router]);

  const mutation = useMutation({
    mutationFn: () =>
      createBooking(
        { tripId, seatsCount: seats, comment: comment.trim() || undefined },
        idempotencyKey,
      ),
    onSuccess: (booking) => {
      setCreatedBookingId(booking.id ?? null);
      setStep("waiting");
    },
    onError: (e) => {
      setServerError(friendlyError(extractError(e)));
    },
  });

  const max = Math.min(4, Math.max(1, seatsAvailable));
  const total = pricePerSeat * seats;
  const disabled = seatsAvailable <= 0 || mutation.isPending;

  if (status === "loading" || status === "idle") {
    return (
      <div className="flex justify-center py-12">
        <Spinner size={28} />
      </div>
    );
  }

  if (step === "waiting") {
    return (
      <div className="rounded-3xl border border-ink-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
          <Clock className="h-9 w-9 text-amber-500" aria-hidden="true" />
        </div>
        <h2 className="text-[22px] font-extrabold text-gray-900">Запрос отправлен</h2>
        <p className="mx-auto mt-2 max-w-[340px] text-[14px] leading-relaxed text-gray-500">
          Водитель уведомлён. Пока ждёте ответ, можете задать уточняющие вопросы в чате.
        </p>

        {/* Progress bar */}
        <div className="mx-auto mt-5 h-1 w-full max-w-[320px] overflow-hidden rounded-full bg-gray-100">
          <div className="h-full w-2/5 rounded-full bg-amber-500" />
        </div>

        {/* Pre-booking chat notice */}
        <div className="mx-auto mt-5 max-w-[400px] rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-left">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="h-3.5 w-3.5 text-teal-700 flex-shrink-0" aria-hidden="true" />
            <span className="text-[13px] font-extrabold text-teal-800">Чат до бронирования</span>
          </div>
          <p className="text-[12px] leading-relaxed text-teal-700">
            Вы можете задать вопросы водителю. После принятия запроса лимит снимется и история сохранится.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/my/bookings">
            <Button variant="outline" size="md" className="w-full sm:w-auto">
              Мои поездки
            </Button>
          </Link>
          {createdBookingId && (
            <Link href={`/my/bookings/${createdBookingId}/chat`}>
              <Button variant="primary" size="md" className="w-full sm:w-auto">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Открыть чат
              </Button>
            </Link>
          )}
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-[12px] text-gray-400">
          <Bell className="h-3.5 w-3.5" aria-hidden="true" />
          Уведомление придёт в Telegram и в приложение
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setServerError(null);
        if (disabled) return;
        mutation.mutate();
      }}
      className="flex flex-col gap-4"
      noValidate
    >
      {serverError && (
        <NotifCard variant="error" title="Не удалось забронировать">
          {serverError}
        </NotifCard>
      )}

      {/* Seat stepper */}
      <div className="rounded-2xl border border-ink-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[15px] font-bold text-gray-900">Количество мест</p>
            <p className="mt-0.5 text-[12px] font-semibold text-gray-500">Свободно: {seatsAvailable}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSeats((s) => Math.max(1, s - 1))}
              aria-label="Меньше мест"
              disabled={seats <= 1 || disabled}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-[20px] font-bold text-gray-900 hover:bg-gray-100 disabled:opacity-40"
            >
              −
            </button>
            <span className="min-w-[28px] text-center text-[24px] font-extrabold text-gray-900">{seats}</span>
            <button
              type="button"
              onClick={() => setSeats((s) => Math.min(max, s + 1))}
              aria-label="Больше мест"
              disabled={seats >= max || disabled}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-[20px] font-bold text-gray-900 hover:bg-gray-100 disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Comment */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="comment">Комментарий водителю (необязательно)</Label>
        <div className="flex flex-wrap gap-1.5">
          {["Буду у автовокзала", "Небольшой багаж", "Еду один", "Могу выехать раньше"].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setComment((prev) => prev ? `${prev}, ${chip.toLowerCase()}` : chip)}
              className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-600 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
            >
              {chip}
            </button>
          ))}
        </div>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 300))}
          placeholder="Например: Большой багаж, еду один, готов к ранней встрече..."
          rows={3}
        />
        <span className="text-caption text-gray-500">{comment.length} / 300 · номера телефонов автоматически скрываются</span>
      </div>

      {/* Price summary */}
      <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-extrabold text-gray-900">К оплате водителю</span>
          <span className="text-[24px] font-extrabold text-teal-700">{formatPrice(total)}</span>
        </div>
        <p className="mt-1 text-[12px] font-semibold text-gray-500">
          {pricePerSeat} сом × {seats} {seats === 1 ? "место" : "места"} · Наличными при встрече
        </p>
      </div>

      {/* Warning */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-amber-600" aria-hidden="true" />
          <span className="text-[13px] font-bold text-gray-900">Водитель может отклонить запрос</span>
        </div>
        <p className="mt-1 text-[12px] font-semibold text-gray-500">
          Вы получите ответ в течение часа. Номер водителя станет виден после принятия.
        </p>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="ghost" size="lg" className="flex-1" onClick={() => router.back()}>
          Отмена
        </Button>
        <Button type="submit" variant="submit" size="lg" disabled={disabled} className="flex-[2]">
          <Send className="h-4 w-4" aria-hidden="true" />
          {mutation.isPending ? "Отправляем…" : "Отправить запрос"}
        </Button>
      </div>
    </form>
  );
}
