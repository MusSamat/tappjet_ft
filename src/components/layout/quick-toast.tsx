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

// Container styling collapses into the 3 canonical §11 buckets:
// success → brand, error/warning → coral, info → ink. Text is always white.
const COLORS = {
  booking_request: "bg-ink-800 text-white shadow-lg",
  booking_accepted: "bg-brand-600 text-white shadow-brandcta",
  booking_rejected: "bg-coral-500 text-white shadow-lg",
  booking_cancelled: "bg-coral-500 text-white shadow-lg",
  booking_expired: "bg-coral-500 text-white shadow-lg",
  chat_message: "bg-ink-800 text-white shadow-lg",
  error: "bg-coral-500 text-white shadow-lg",
  warning: "bg-coral-500 text-white shadow-lg",
  info: "bg-ink-800 text-white shadow-lg",
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
        "flex w-[320px] items-center gap-3 rounded-2xl px-4 py-3",
        COLORS[item.type],
      )}
    >
      <span className="flex-shrink-0">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-800">{item.title}</p>
        <p className="mt-0.5 text-[12px] font-600 text-white/80">{item.body}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Закрыть"
        className="flex-shrink-0 text-white/70 hover:text-white"
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
