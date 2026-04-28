"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { listVerifications, type VerificationQueueItem } from "@/lib/api/admin";
import { cn } from "@/lib/utils/cn";
import { ChevronRight, Clock, AlertTriangle } from "lucide-react";

type StatusFilter = "all" | "pending" | "verified" | "rejected" | "docs_requested";

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "pending", label: "На проверке" },
  { id: "docs_requested", label: "Нужны документы" },
  { id: "all", label: "Все" },
  { id: "verified", label: "Одобрены" },
  { id: "rejected", label: "Отклонены" },
];

const STATUS_CFG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pending:        { label: "На проверке",  bg: "bg-amber-50",  text: "text-amber-800", dot: "bg-amber-500" },
  verified:       { label: "Одобрен",      bg: "bg-teal-50",   text: "text-teal-800",  dot: "bg-teal-500" },
  rejected:       { label: "Отклонён",     bg: "bg-red-50",    text: "text-red-700",   dot: "bg-red-500" },
  docs_requested: { label: "Нужны доки",   bg: "bg-blue-50",   text: "text-blue-700",  dot: "bg-blue-500" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.pending;
  return (
    <span className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold", cfg.bg, cfg.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function AdminVerificationsPage() {
  const [status, setStatus] = useState<StatusFilter>("pending");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "verifications", status],
    queryFn: () =>
      listVerifications({ status: status === "all" ? undefined : status, limit: 50 }),
    staleTime: 30_000,
  });

  const items: VerificationQueueItem[] = data?.data ?? [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-[24px] font-extrabold text-slate-900">Верификации водителей</h1>
        <p className="text-[13px] text-slate-500">Очередь заявок на верификацию</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setStatus(t.id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-[12px] font-bold transition-colors",
              status === t.id
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center">
          <Clock className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="font-bold text-slate-600">Нет заявок в этой категории</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Link key={item.id} href={`/admin/verifications/${item.id}`}>
              <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-[14px] font-bold text-slate-600">
                    {item.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900">{item.userName}</p>
                      {item.slaBreach && (
                        <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                          <AlertTriangle className="h-3 w-3" />
                          SLA
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-slate-500">
                      {item.userPhone} · {item.carMake} {item.carModel} · {item.carPlate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden text-right sm:block">
                    <p className="text-[12px] text-slate-500">Подано {fmt(item.submittedAt)}</p>
                  </div>
                  <StatusBadge status={item.verificationStatus} />
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
