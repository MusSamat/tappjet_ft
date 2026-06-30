import { cn } from "@/lib/utils/cn";

export type LifecycleStatus =
  | "active"
  | "completed"
  | "cancelled"
  | "pending"
  | "accepted"
  | "rejected";

const MAP: Record<LifecycleStatus, { label: string; cls: string }> = {
  active: { label: "Активна", cls: "bg-brand-50 text-brand-700" },
  completed: { label: "Завершена", cls: "bg-ink-100 text-ink-500" },
  cancelled: { label: "Отменена", cls: "bg-coral-100 text-coral-600" },
  pending: { label: "Ожидает", cls: "bg-accent-100 text-accent-700" },
  accepted: { label: "Принята", cls: "bg-brand-50 text-brand-700" },
  rejected: { label: "Отклонена", cls: "bg-coral-100 text-coral-600" },
};

/** Lifecycle status pill for trips/bookings (active/completed/cancelled/…). */
export function StatusBadge({
  status,
  label,
  className,
}: {
  status: LifecycleStatus;
  label?: string;
  className?: string;
}) {
  const m = MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold",
        m.cls,
        className,
      )}
    >
      {label ?? m.label}
    </span>
  );
}
