"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getVerification,
  approveVerification,
  type VerificationDetail,
} from "@/lib/api/admin";
import { cn } from "@/lib/utils/cn";
import { ArrowLeft, CheckCircle2, XCircle, FileQuestion } from "lucide-react";
import { PhotoCard } from "./_components/photo-card";
import { RejectModal } from "./_components/reject-modal";
import { RequestDocsModal } from "./_components/request-docs-modal";

function fmt(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

const STATUS_LABEL: Record<string, string> = {
  pending: "На проверке",
  verified: "Одобрен",
  rejected: "Отклонён",
  docs_requested: "Нужны документы",
};

export default function VerificationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: item, isLoading } = useQuery<VerificationDetail>({
    queryKey: ["admin", "verification", id],
    queryFn: () => getVerification(id),
    staleTime: 30_000,
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin", "verifications"] });
    void qc.invalidateQueries({ queryKey: ["admin", "verification", id] });
    void qc.invalidateQueries({ queryKey: ["admin", "kpi"] });
  };

  const approveMut = useMutation({
    mutationFn: () => approveVerification(id),
    onSuccess: () => { invalidate(); router.push("/admin/verifications"); },
  });

  const [rejectOpen, setRejectOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    );
  }

  if (!item) return null;

  const isPending =
    item.verificationStatus === "pending" || item.verificationStatus === "docs_requested";

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

      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-extrabold text-slate-900">
            Верификация: {item.user.name}
          </h1>
          <p className="text-[13px] text-slate-500">Подано {fmt(item.submittedAt)}</p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1.5 text-[12px] font-bold",
            item.verificationStatus === "verified"
              ? "bg-teal-50 text-teal-800"
              : item.verificationStatus === "rejected"
                ? "bg-red-50 text-red-700"
                : item.verificationStatus === "docs_requested"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-amber-50 text-amber-800",
          )}
        >
          {STATUS_LABEL[item.verificationStatus] ?? item.verificationStatus}
        </span>
      </div>

      {/* Driver info */}
      <div className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Водитель
        </p>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-[20px] font-bold text-slate-600">
            {item.user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-[16px] font-extrabold text-slate-900">{item.user.name}</p>
            <p className="text-[13px] text-slate-500">{item.user.phone}</p>
          </div>
        </div>
        {item.rejectionReason && (
          <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-[13px] text-slate-700">
            <span className="font-bold text-slate-500">Заметка: </span>
            {item.rejectionReason}
          </div>
        )}
        {item.requestedDocs.length > 0 && (
          <div className="mt-3 rounded-xl bg-blue-50 px-4 py-3">
            <p className="text-[12px] font-bold text-blue-800">Запрошены документы:</p>
            <p className="text-[12px] text-blue-700">{item.requestedDocs.join(", ")}</p>
          </div>
        )}
      </div>

      {/* Car info */}
      <div className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Автомобиль
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: "Марка", value: item.car.make },
            { label: "Модель", value: item.car.model },
            { label: "Год", value: item.car.year },
            { label: "Цвет", value: item.car.color },
            { label: "Номер", value: item.car.plate },
            { label: "Мест", value: item.car.seats },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {label}
              </p>
              <p className="text-[14px] font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Photos */}
      <div className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Документы и фото
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <PhotoCard label="Водительское уд." src={item.photos.license} />
          <PhotoCard label="Тех. паспорт" src={item.photos.carPassport} />
          <PhotoCard label="Фото авто" src={item.photos.carPhoto} />
          <PhotoCard label="Сэлфи" src={item.photos.selfie} />
        </div>
      </div>

      {/* Actions */}
      {isPending && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => approveMut.mutate()}
            disabled={approveMut.isPending}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-[14px] font-bold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            <CheckCircle2 className="h-5 w-5" />
            {approveMut.isPending ? "Одобряем…" : "Одобрить"}
          </button>
          <button
            type="button"
            onClick={() => setDocsOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-[14px] font-bold text-white hover:bg-blue-700"
          >
            <FileQuestion className="h-5 w-5" />
            Запросить документы
          </button>
          <button
            type="button"
            onClick={() => setRejectOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-[14px] font-bold text-white hover:bg-red-700"
          >
            <XCircle className="h-5 w-5" />
            Отклонить
          </button>
        </div>
      )}

      <RejectModal
        id={id}
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onSuccess={() => { invalidate(); router.push("/admin/verifications"); }}
      />

      <RequestDocsModal
        id={id}
        open={docsOpen}
        onClose={() => setDocsOpen(false)}
        onSuccess={() => { invalidate(); router.push("/admin/verifications"); }}
      />
    </div>
  );
}
