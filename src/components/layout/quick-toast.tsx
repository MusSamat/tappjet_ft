"use client";

import { useEffect, useState } from "react";
import { X, Car, CheckCircle, AlertCircle, MessageCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ToastItem {
  id: string;
  type:
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

const ICONS = {
  booking_request: Car,
  booking_accepted: CheckCircle,
  booking_rejected: AlertCircle,
  booking_cancelled: AlertCircle,
  booking_expired: AlertCircle,
  chat_message: MessageCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
} satisfies Record<ToastItem["type"], React.ElementType>;

const COLORS = {
  booking_request: "border-teal-200 bg-teal-50",
  booking_accepted: "border-teal-200 bg-teal-50",
  booking_rejected: "border-red-200 bg-red-50",
  booking_cancelled: "border-red-200 bg-red-50",
  booking_expired: "border-amber-200 bg-amber-50",
  chat_message: "border-gray-200 bg-white",
  error: "border-red-200 bg-red-50",
  warning: "border-amber-200 bg-amber-50",
  info: "border-teal-200 bg-teal-50",
} satisfies Record<ToastItem["type"], string>;

const ICON_COLORS = {
  booking_request: "text-teal-600",
  booking_accepted: "text-teal-600",
  booking_rejected: "text-red-500",
  booking_cancelled: "text-red-500",
  booking_expired: "text-amber-500",
  chat_message: "text-teal-600",
  error: "text-red-500",
  warning: "text-amber-500",
  info: "text-teal-600",
} satisfies Record<ToastItem["type"], string>;

const AUTO_DISMISS_MS = 6000;

function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const Icon = ICONS[item.type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex w-[320px] items-start gap-3 rounded-2xl border p-4 shadow-lg",
        COLORS[item.type],
      )}
    >
      <span className="mt-0.5 flex-shrink-0">
        <Icon className={cn("h-5 w-5", ICON_COLORS[item.type])} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold text-gray-900">{item.title}</p>
        <p className="mt-0.5 text-[12px] text-gray-700">{item.body}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Закрыть"
        className="flex-shrink-0 text-gray-400 hover:text-gray-600"
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
    <div className="fixed right-4 top-20 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}
