"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listAuditLog, type AuditLogItem } from "@/lib/api/admin";
import { useAdminAuth } from "@/store/admin-auth";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

const ACTION_COLORS: Record<string, string> = {
  approve_verification: "bg-brand-50 text-brand-700",
  reject_verification:  "bg-danger-50 text-danger-700",
  request_docs:         "bg-sky-50 text-sky-700",
  block_user:           "bg-danger-50 text-danger-700",
  unblock_user:         "bg-brand-50 text-brand-700",
  force_cancel_trip:    "bg-accent-50 text-accent-700",
  resolve_complaint:    "bg-brand-50 text-brand-700",
  dismiss_complaint:    "bg-ink-100 text-ink-600",
  create_city:          "bg-sky-50 text-sky-700",
  update_city:          "bg-sky-50 text-sky-700",
  create_admin:         "bg-accent-50 text-accent-700",
};

function ActionBadge({ action }: { action: string }) {
  const cls = ACTION_COLORS[action] ?? "bg-ink-100 text-ink-600";
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold", cls)}>
      {action.replace(/_/g, " ")}
    </span>
  );
}

const LIMIT = 25;

export default function AdminAuditLogPage() {
  const { admin } = useAdminAuth();
  const isSuperAdmin = admin?.role === "superadmin";
  const [cursors, setCursors] = useState<string[]>([]);
  const cursor = cursors[cursors.length - 1];

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "audit-log", cursor],
    queryFn: () => listAuditLog({ cursor, limit: LIMIT }),
    staleTime: 30_000,
  });

  const items: AuditLogItem[] = data?.data ?? [];
  const hasNext = !!data?.nextCursor;
  const hasPrev = cursors.length > 0;

  function nextPage() {
    if (data?.nextCursor) setCursors((prev) => [...prev, data.nextCursor!]);
  }
  function prevPage() {
    setCursors((prev) => prev.slice(0, -1));
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-[24px] font-disp font-extrabold text-ink-900">Журнал действий</h1>
        <p className="text-[13px] text-ink-500">
          {isSuperAdmin ? "Все действия администраторов" : "Ваши действия"}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 text-ink-300" />
          <p className="font-bold text-ink-600">Нет записей</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl bg-white shadow-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-100">
                  {["Время", "Администратор", "Действие", "Объект", "IP"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-ink-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-ink-50">
                    <td className="whitespace-nowrap px-4 py-3 text-[12px] text-ink-500">
                      {fmt(item.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[13px] font-bold text-ink-900">{item.admin.name}</p>
                      <p className="text-[11px] text-ink-400">{item.admin.role}</p>
                    </td>
                    <td className="px-4 py-3">
                      <ActionBadge action={item.action} />
                    </td>
                    <td className="px-4 py-3 text-[12px] text-ink-600">
                      {item.targetType && (
                        <span className="mr-1 rounded bg-ink-100 px-1.5 py-0.5 text-[10px] text-ink-500">
                          {item.targetType}
                        </span>
                      )}
                      {item.targetId ? (
                        <span className="font-mono text-[11px]">
                          {item.targetId.slice(0, 8)}…
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-ink-400">
                      {item.ipAddress ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[13px] text-ink-500">
              Показано {items.length} записей
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={prevPage}
                disabled={!hasPrev}
              >
                <ChevronLeft className="h-4 w-4" />
                Назад
              </Button>
              <Button
                variant="outline"
                onClick={nextPage}
                disabled={!hasNext}
              >
                Далее
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
