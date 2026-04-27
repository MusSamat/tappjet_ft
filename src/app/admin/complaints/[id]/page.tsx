"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminComplaint, resolveComplaint, type ComplaintItem } from "@/lib/api/admin";
import { cn } from "@/lib/utils/cn";
import { ArrowLeft, AlertTriangle } from "lucide-react";

const PRIORITY_CFG: Record<string, string> = {
  P0: "bg-red-600 text-white",
  P1: "bg-orange-500 text-white",
  P2: "bg-amber-400 text-amber-900",
  P3: "bg-slate-200 text-slate-600",
};

function fmt(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: complaint, isLoading } = useQuery<ComplaintItem>({
    queryKey: ["admin", "complaint", id],
    queryFn: () => getAdminComplaint(id),
    staleTime: 30_000,
  });

  const [resolveStatus, setResolveStatus] = useState<"resolved" | "dismissed">("resolved");
  const [resolution, setResolution] = useState("");

  const resolveMut = useMutation({
    mutationFn: () => resolveComplaint(id, resolveStatus, resolution),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "complaints"] });
      void qc.invalidateQueries({ queryKey: ["admin", "complaint", id] });
      void qc.invalidateQueries({ queryKey: ["admin", "kpi"] });
      router.push("/admin/complaints");
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    );
  }

  if (!complaint) return null;

  const isOpen = complaint.status === "new" || complaint.status === "in_review";

  return (
    <div className="p-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1.5 text-[13px] font-bold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад
      </button>

      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-extrabold text-slate-900">Жалоба</h1>
          <p className="text-[13px] text-slate-500">{fmt(complaint.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", PRIORITY_CFG[complaint.priority] ?? PRIORITY_CFG.P3)}>
            {complaint.priority}
          </span>
          <span className={cn(
            "rounded-full px-3 py-1.5 text-[12px] font-bold",
            complaint.status === "new" ? "bg-red-50 text-red-700" :
            complaint.status === "in_review" ? "bg-amber-50 text-amber-800" :
            complaint.status === "resolved" ? "bg-teal-50 text-teal-800" :
            "bg-slate-100 text-slate-600",
          )}>
            {complaint.status === "new" ? "Новая" :
             complaint.status === "in_review" ? "На рассмотрении" :
             complaint.status === "resolved" ? "Решена" : "Отклонена"}
          </span>
          {complaint.slaBreach && (
            <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-700">
              <AlertTriangle className="h-3 w-3" />
              SLA нарушен
            </span>
          )}
        </div>
      </div>

      {/* Reporter & target */}
      <div className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Участники</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Подал жалобу</p>
            <p className="mt-1 font-bold text-slate-900">{complaint.reporterName}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Объект жалобы</p>
            {complaint.targetUserId ? (
              <p className="mt-1 font-mono text-[12px] text-slate-600">{complaint.targetUserId.slice(0, 12)}…</p>
            ) : complaint.targetTripId ? (
              <p className="mt-1 font-mono text-[12px] text-slate-600">Поездка: {complaint.targetTripId.slice(0, 12)}…</p>
            ) : (
              <p className="mt-1 text-[13px] text-slate-400">—</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[12px] font-bold text-slate-600">
            {complaint.category}
          </span>
        </div>
        <p className="text-[14px] leading-relaxed text-slate-800">{complaint.description}</p>
        {complaint.attachments.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {complaint.attachments.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                <img src={url} alt="" className="h-20 w-full rounded-xl object-cover hover:opacity-90" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Resolution (already closed) */}
      {!isOpen && complaint.resolution && (
        <div className="mb-4 rounded-2xl bg-slate-50 p-4">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">Решение</p>
          <p className="text-[13px] text-slate-700">{complaint.resolution}</p>
          {complaint.resolvedAt && (
            <p className="mt-1 text-[11px] text-slate-400">{fmt(complaint.resolvedAt)}</p>
          )}
        </div>
      )}

      {/* Resolve form */}
      {isOpen && (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="mb-3 text-[13px] font-bold text-slate-700">Принять решение</p>
          <div className="mb-4 flex gap-2">
            {(["resolved", "dismissed"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setResolveStatus(s)}
                className={cn(
                  "rounded-xl px-5 py-2.5 text-[13px] font-bold transition-colors",
                  resolveStatus === s
                    ? s === "resolved" ? "bg-teal-600 text-white" : "bg-slate-700 text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50",
                )}
              >
                {s === "resolved" ? "Принять жалобу" : "Отклонить жалобу"}
              </button>
            ))}
          </div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Описание решения *
          </label>
          <textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            rows={3}
            placeholder="Опишите принятое решение…"
            className="mb-4 w-full rounded-xl border border-slate-200 p-3 text-[13px] outline-none focus:border-slate-400"
          />
          <button
            type="button"
            onClick={() => resolveMut.mutate()}
            disabled={!resolution.trim() || resolveMut.isPending}
            className={cn(
              "rounded-xl px-8 py-3 text-[14px] font-bold text-white disabled:opacity-50",
              resolveStatus === "resolved" ? "bg-teal-600 hover:bg-teal-700" : "bg-slate-800 hover:bg-slate-900",
            )}
          >
            {resolveMut.isPending ? "Сохраняем…" : "Сохранить решение"}
          </button>
        </div>
      )}
    </div>
  );
}
