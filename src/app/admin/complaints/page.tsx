"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { listAdminComplaints, type ComplaintItem } from "@/lib/api/admin";
import { cn } from "@/lib/utils/cn";
import { ChevronRight, MessageSquareWarning, AlertTriangle } from "lucide-react";

type StatusFilter = "all" | "new" | "in_review" | "resolved" | "dismissed";

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "new", label: "Новые" },
  { id: "in_review", label: "На рассмотрении" },
  { id: "all", label: "Все" },
  { id: "resolved", label: "Решены" },
  { id: "dismissed", label: "Отклонены" },
];

const STATUS_CFG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  new:       { label: "Новая",           bg: "bg-red-50",    text: "text-red-700",   dot: "bg-red-500" },
  in_review: { label: "На рассмотрении", bg: "bg-amber-50",  text: "text-amber-800", dot: "bg-amber-500" },
  resolved:  { label: "Решена",          bg: "bg-teal-50",   text: "text-teal-800",  dot: "bg-teal-500" },
  dismissed: { label: "Отклонена",       bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
};

const PRIORITY_CFG: Record<string, string> = {
  P0: "bg-red-600 text-white",
  P1: "bg-orange-500 text-white",
  P2: "bg-amber-400 text-amber-900",
  P3: "bg-slate-200 text-slate-600",
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.new;
  return (
    <span className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold", cfg.bg, cfg.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export default function AdminComplaintsPage() {
  const [status, setStatus] = useState<StatusFilter>("new");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "complaints", status],
    queryFn: () =>
      listAdminComplaints({ status: status === "all" ? undefined : status, limit: 50 }),
    staleTime: 30_000,
  });

  const items: ComplaintItem[] = data?.data ?? [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-[24px] font-extrabold text-slate-900">Жалобы</h1>
        <p className="text-[13px] text-slate-500">Обращения пользователей</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setStatus(t.id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-[12px] font-bold transition-colors",
              status === t.id ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center">
          <MessageSquareWarning className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="font-bold text-slate-600">Нет жалоб в этой категории</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((c) => (
            <Link key={c.id} href={`/admin/complaints/${c.id}`}>
              <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", PRIORITY_CFG[c.priority] ?? PRIORITY_CFG.P3)}>
                      {c.priority}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                      {c.category}
                    </span>
                    {c.slaBreach && (
                      <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                        <AlertTriangle className="h-3 w-3" />
                        SLA
                      </span>
                    )}
                    <span className="text-[12px] text-slate-400">{fmt(c.createdAt)}</span>
                  </div>
                  <p className="truncate text-[13px] font-bold text-slate-900">
                    {c.reporterName}
                    {c.targetUserId && " → пользователь"}
                    {c.targetTripId && " → поездка"}
                  </p>
                  <p className="truncate text-[12px] text-slate-500">{c.description}</p>
                </div>
                <div className="ml-3 flex flex-shrink-0 items-center gap-2">
                  <StatusBadge status={c.status} />
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
