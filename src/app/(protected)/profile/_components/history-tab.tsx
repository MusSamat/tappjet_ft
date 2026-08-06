"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Spinner } from "@/components/ui";
import { QueryError } from "@/components/ui/query-error";
import { ListCard } from "@/components/ui/list-card";
import { listMyBookings, type Booking } from "@/lib/api/bookings";

// Terminal booking statuses — the same set the my/bookings «История» tab uses.
const HISTORY_STATUSES = new Set([
  "completed",
  "rejected",
  "cancelled_by_passenger",
  "cancelled_by_driver",
  "cancelled_late",
  "no_show",
  "expired",
]);

type BookingExt = Booking & {
  trip?: { originCity?: string; destinationCity?: string; departureAt?: string };
};

function fmt(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }) +
    " · " +
    d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
  );
}

// Profile → «История»: read-only timeline of finished/cancelled bookings. No
// action buttons and no phone — mirrors the Flutter ProfileHistoryView.
export function HistoryTab() {
  const t = useTranslations("profile");
  const q = useQuery({
    queryKey: ["bookings", "my", "history"],
    queryFn: () => listMyBookings(),
  });

  if (q.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }
  if (q.isError) {
    return <QueryError error={q.error} onRetry={() => void q.refetch()} />;
  }

  const items = ((q.data?.data ?? []) as BookingExt[])
    .filter((b) => HISTORY_STATUSES.has((b.status ?? "") as string))
    .sort((a, b) => (b.trip?.departureAt ?? "").localeCompare(a.trip?.departureAt ?? ""));

  if (items.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-card dark:bg-ink-900">
        <p className="text-[15px] font-medium text-ink-500">{t("history_empty")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((b) => (
        <ListCard
          key={b.id}
          when={fmt(b.trip?.departureAt)}
          role={t("history_as_passenger")}
          status={(b.status ?? "") as string}
          origin={b.trip?.originCity ?? ""}
          destination={b.trip?.destinationCity ?? ""}
        />
      ))}
    </div>
  );
}
