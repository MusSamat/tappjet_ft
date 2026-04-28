import { StatusDot } from "@/components/ui";
import type { BookingStatus } from "@/lib/api/bookings";

const MAP: Record<BookingStatus, { status: "accepted" | "pending" | "rejected" | "cancelled" | "completed"; label: string }> = {
  pending: { status: "pending", label: "Ожидание" },
  viewed: { status: "pending", label: "Просмотрено" },
  accepted: { status: "accepted", label: "Принято" },
  rejected: { status: "rejected", label: "Отклонено" },
  cancelled_by_passenger: { status: "cancelled", label: "Отменено пассажиром" },
  cancelled_by_driver: { status: "cancelled", label: "Отменено водителем" },
  cancelled_late: { status: "cancelled", label: "Поздняя отмена" },
  no_show: { status: "rejected", label: "Не явился" },
  completed: { status: "completed", label: "Завершено" },
  expired: { status: "cancelled", label: "Истёк срок" },
};

export function BookingStatusDot({ status }: { status: BookingStatus | undefined }) {
  if (!status) return null;
  const { status: ui, label } = MAP[status];
  return <StatusDot status={ui} label={label} />;
}
