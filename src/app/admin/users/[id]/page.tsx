"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminUser, blockUser, unblockUser } from "@/lib/api/admin";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import {
  ArrowLeft, Star, ShieldOff, ShieldCheck, Phone, Car, Calendar, X,
} from "lucide-react";

function fmt(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
  });
}

const BLOCK_REASONS = [
  "Нарушение правил платформы",
  "Мошенничество",
  "Агрессивное поведение",
  "Фальшивые документы",
  "Другое",
];

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["admin", "user", id],
    queryFn: () => getAdminUser(id),
    staleTime: 30_000,
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin", "user", id] });
    void qc.invalidateQueries({ queryKey: ["admin", "users"] });
  };

  const [blockOpen, setBlockOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const blockMut = useMutation({
    mutationFn: () => blockUser(id, blockReason === "Другое" ? customReason : blockReason),
    onSuccess: () => { invalidate(); setBlockOpen(false); },
  });

  const unblockMut = useMutation({
    mutationFn: () => unblockUser(id),
    onSuccess: () => invalidate(),
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  const effectiveReason = blockReason === "Другое" ? customReason : blockReason;

  return (
    <div className="p-6">
      <Button
        type="button"
        variant="textGhost"
        size="sm"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад
      </Button>

      {/* Profile card */}
      <div className="mb-4 rounded-2xl bg-white p-5 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-200 text-[22px] font-bold text-ink-600">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[20px] font-extrabold text-ink-900">{user.name}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {user.roles.map((r) => (
                  <span key={r} className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-bold",
                    r === "driver" ? "bg-sky-100 text-sky-700" : "bg-brand-100 text-brand-700",
                  )}>
                    {r}
                  </span>
                ))}
                {user.isBlocked && (
                  <span className="rounded bg-danger-100 px-1.5 py-0.5 text-[10px] font-bold text-danger-700">
                    ЗАБЛОКИРОВАН
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Block / Unblock */}
          {user.isBlocked ? (
            <Button
              type="button"
              variant="brand"
              onClick={() => unblockMut.mutate()}
              disabled={unblockMut.isPending}
            >
              <ShieldCheck className="h-4 w-4" />
              {unblockMut.isPending ? "Снимаем блок…" : "Разблокировать"}
            </Button>
          ) : (
            <Button
              type="button"
              variant="danger"
              onClick={() => setBlockOpen(true)}
            >
              <ShieldOff className="h-4 w-4" />
              Заблокировать
            </Button>
          )}
        </div>

        {/* Details grid */}
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-ink-400" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">Телефон</p>
              <p className="text-[13px] font-bold text-ink-900">{user.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-accent-400" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">Рейтинг</p>
              <p className="text-[13px] font-bold text-ink-900">
                {user.rating != null ? `${user.rating.toFixed(2)} (${user.ratingCount} отз.)` : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-ink-400" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">Зарегистрирован</p>
              <p className="text-[13px] font-bold text-ink-900">{fmt(user.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">Телефон верифицирован</p>
            <p className="text-[13px] font-bold text-ink-900">{fmt(user.phoneVerifiedAt)}</p>
          </div>
          {user.telegramId && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">Telegram ID</p>
              <p className="text-[13px] font-bold text-ink-900">{user.telegramId}</p>
            </div>
          )}
          {user.language && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">Язык</p>
              <p className="text-[13px] font-bold text-ink-900">{user.language}</p>
            </div>
          )}
          {user.isBlocked && user.blockedReason && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">Причина блокировки</p>
              <p className="text-[13px] font-bold text-danger-700">{user.blockedReason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Driver profile */}
      {user.driverProfile && (
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-ink-400">
            Профиль водителя
          </p>
          <div className="flex items-center gap-3">
            <Car className="h-5 w-5 text-ink-400" />
            <div>
              <p className="font-bold text-ink-900">
                {user.driverProfile.carPlate || "Номер не указан"}
              </p>
              <span className={cn(
                "text-[12px] font-bold",
                user.driverProfile.verificationStatus === "verified" ? "text-brand-600" :
                user.driverProfile.verificationStatus === "rejected" ? "text-danger-600" :
                user.driverProfile.verificationStatus === "pending" ? "text-accent-600" :
                "text-ink-500",
              )}>
                Верификация: {user.driverProfile.verificationStatus}
              </span>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">Всего поездок</p>
              <p className="text-[14px] font-bold text-ink-900">{user.driverProfile.totalTrips}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400">Отмены (30 дн.)</p>
              <p className="text-[14px] font-bold text-ink-900">{user.driverProfile.cancellations30d}</p>
            </div>
          </div>
        </div>
      )}

      {/* Block modal */}
      {blockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[440px] rounded-2xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[18px] font-disp font-extrabold text-ink-900">Заблокировать пользователя</h2>
              <button type="button" onClick={() => setBlockOpen(false)} className="rounded-full p-1 hover:bg-ink-100">
                <X className="h-5 w-5 text-ink-400" />
              </button>
            </div>
            <p className="mb-4 text-[13px] text-ink-500">
              <span className="font-bold text-ink-700">{user.name}</span> потеряет доступ к платформе и получит уведомление.
            </p>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-ink-500">
              Причина блокировки *
            </p>
            <div className="mb-3 space-y-1.5">
              {BLOCK_REASONS.map((r) => (
                <label key={r} className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink-100 px-4 py-2.5 hover:bg-ink-50">
                  <input
                    type="radio"
                    name="block_reason"
                    value={r}
                    checked={blockReason === r}
                    onChange={() => setBlockReason(r)}
                    className="h-4 w-4"
                  />
                  <span className="text-[13px] font-semibold text-ink-700">{r}</span>
                </label>
              ))}
            </div>
            {blockReason === "Другое" && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={2}
                placeholder="Укажите причину…"
                className="mb-3 w-full rounded-xl border border-ink-200 p-3 text-[13px] outline-none focus:border-ink-400"
              />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setBlockOpen(false)}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                type="button"
                variant="danger"
                size="lg"
                onClick={() => blockMut.mutate()}
                disabled={!effectiveReason.trim() || blockMut.isPending}
                className="flex-1"
              >
                {blockMut.isPending ? "Блокируем…" : "Заблокировать"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
