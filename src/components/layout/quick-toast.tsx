"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ToastItem {
  id: string;
  type:
    | "success"
    | "booking_request"
    | "booking_accepted"
    | "booking_rejected"
    | "booking_cancelled"
    | "booking_expired"
    | "chat_message"
    | "error"
    | "warning"
    | "info";
  title: string;
  body: string;
}

// design-spec §3.11 — 3 visual buckets: success → brand, error → danger, info → ink.
type ToastVariant = "success" | "error" | "info";

const VARIANT = {
  success: "success",
  booking_request: "info",
  booking_accepted: "success",
  booking_rejected: "error",
  booking_cancelled: "error",
  booking_expired: "error",
  chat_message: "info",
  error: "error",
  warning: "error",
  info: "info",
} satisfies Record<ToastItem["type"], ToastVariant>;

const ICONS: Record<ToastVariant, React.ElementType> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const COLORS: Record<ToastVariant, string> = {
  success: "bg-brand-600 text-white shadow-brandcta",
  error: "bg-danger-500 text-white shadow-lift",
  info: "bg-ink-800 text-white shadow-lift dark:bg-ink-700",
};

const AUTO_DISMISS_MS = 2600;

function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const variant = VARIANT[item.type];
  const Icon = ICONS[variant];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "pointer-events-auto flex w-full max-w-[360px] items-center gap-2.5 rounded-2xl px-4 py-3",
        COLORS[variant],
      )}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-800">{item.title}</p>
        {item.body && <p className="mt-0.5 text-[14px] font-600 text-white/80">{item.body}</p>}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Закрыть"
        className="shrink-0 text-white/70 hover:text-white"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

// Module-level queue so NotificationListener can push toasts without prop-drilling
type Listener = (item: ToastItem) => void;
const listeners = new Set<Listener>();

export function pushToast(item: Omit<ToastItem, "id">): void {
  const id = `${Date.now()}-${Math.random()}`;
  listeners.forEach((fn) => fn({ ...item, id }));
}

// One-line action feedback (design-spec §3.11): success → brand, error → danger.
export const toastSuccess = (title: string) => pushToast({ type: "success", title, body: "" });
export const toastError = (title: string) => pushToast({ type: "error", title, body: "" });

export function QuickToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler: Listener = (item) => setToasts((prev) => [...prev, item]);
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  const dismiss = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-5">
      {toasts.map((t) => (
        <Toast key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}
