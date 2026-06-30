"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Check, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type AppNotification } from "@/lib/api/notifications";
import { acceptBooking, rejectBooking } from "@/lib/api/bookings";
import { Spinner } from "@/components/ui";

type ActionResult = "accepted" | "rejected" | "error" | null;

const chatLinkClass = "inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-1.5 text-[12px] font-bold text-white hover:bg-brand-700";
const softLinkClass = "inline-flex items-center gap-1 text-[12px] font-semibold text-brand-700 hover:underline";

export function NotificationActions({ notification }: { notification: AppNotification }) {
  const queryClient = useQueryClient();
  const p = notification.payload as Record<string, unknown>;
  const [result, setResult] = useState<ActionResult>(null);

  const bookingId = p["bookingId"] as string | undefined;
  const nestedBookingId = (p["booking"] as Record<string, unknown> | undefined)?.["id"] as string | undefined;
  const requestId = p["requestId"] as string | undefined;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const { mutate: accept, isPending: accepting } = useMutation({
    mutationFn: () => acceptBooking(bookingId!),
    onSuccess: () => { setResult("accepted"); invalidate(); },
    onError: () => { setResult("error"); invalidate(); },
  });

  const { mutate: decline, isPending: declining } = useMutation({
    mutationFn: () => rejectBooking(bookingId!),
    onSuccess: () => { setResult("rejected"); invalidate(); },
    onError: () => { setResult("error"); invalidate(); },
  });

  switch (notification.type) {
    case "new_booking_request": {
      if (!bookingId) return null;
      if (result === "accepted") {
        return (
          <Link href={`/my/bookings/${bookingId}/chat`} className={chatLinkClass}>
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
            Открыть чат
          </Link>
        );
      }
      if (result === "rejected") {
        return <span className="text-[12px] font-semibold text-ink-500">Бронь отклонена</span>;
      }
      if (result === "error") {
        return (
          <Link href={`/my/bookings`} className={softLinkClass}>
            Перейти к бронированиям →
          </Link>
        );
      }
      return (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => accept()}
            disabled={accepting || declining}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-1.5 text-[12px] font-bold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {accepting ? <Spinner size={12} /> : <Check className="h-3.5 w-3.5" aria-hidden="true" />}
            Принять
          </button>
          <button
            type="button"
            onClick={() => decline()}
            disabled={accepting || declining}
            className="inline-flex items-center gap-1.5 rounded-xl border border-coral-200 px-3 py-1.5 text-[12px] font-bold text-coral-600 hover:bg-coral-50 disabled:opacity-50"
          >
            {declining ? <Spinner size={12} /> : <X className="h-3.5 w-3.5" aria-hidden="true" />}
            Отклонить
          </button>
        </div>
      );
    }
    case "booking_accepted": {
      const id = nestedBookingId;
      if (!id) return null;
      return (
        <Link href={`/my/bookings/${id}/chat`} className={chatLinkClass}>
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Открыть чат
        </Link>
      );
    }
    case "booking_request_confirmed": {
      const id = p["bookingId"] as string | undefined;
      if (!id) return null;
      return (
        <Link href={`/my/bookings/${id}/chat`} className={chatLinkClass}>
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Открыть чат
        </Link>
      );
    }
    case "request_response_received": {
      return (
        <Link href={requestId ? `/my/requests` : "/my/requests"} className={softLinkClass}>
          Посмотреть предложения →
        </Link>
      );
    }
    case "request_response_accepted": {
      if (!bookingId) return null;
      return (
        <Link href={`/my/bookings/${bookingId}/chat`} className={chatLinkClass}>
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Открыть чат
        </Link>
      );
    }
    default:
      return null;
  }
}
