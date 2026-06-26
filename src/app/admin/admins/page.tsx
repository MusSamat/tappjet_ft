"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAdmins, createAdmin, type AdminMember } from "@/lib/api/admin";
import { useAdminAuth } from "@/store/admin-auth";
import { cn } from "@/lib/utils/cn";
import { Plus, X, UserCog, Calendar } from "lucide-react";
import type { AxiosError } from "axios";

interface ApiErr {
  error?: { code?: string; message?: string };
}

function fmt(iso?: string | null): string {
  if (!iso) return "Никогда";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminAdminsPage() {
  const qc = useQueryClient();
  // TZ §6.3/§17.1 — creating administrators is superadmin-only. Gate the UI so a
  // regular admin doesn't see an action the backend would 403 anyway.
  const isSuperadmin = useAdminAuth((s) => s.admin?.role) === "superadmin";
  const [modalOpen, setModalOpen] = useState(false);
  const [formError, setFormError] = useState("");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "superadmin">("admin");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "admins"],
    queryFn: listAdmins,
    staleTime: 60_000,
  });

  const admins: AdminMember[] = data?.data ?? [];

  const createMut = useMutation({
    mutationFn: () => createAdmin({ email, name, password, role }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "admins"] });
      setModalOpen(false);
      setEmail("");
      setName("");
      setPassword("");
      setRole("admin");
      setFormError("");
    },
    onError: (err: AxiosError<ApiErr>) => {
      const msg = err.response?.data?.error?.message ?? "Ошибка создания";
      setFormError(msg);
    },
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-extrabold text-slate-900">Администраторы</h1>
          <p className="text-[13px] text-slate-500">Управление командой (только суперадмин)</p>
        </div>
        {isSuperadmin && (
          <button
            type="button"
            onClick={() => {
              setModalOpen(true);
              setFormError("");
            }}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Добавить
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : admins.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center">
          <UserCog className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="font-bold text-slate-600">Нет администраторов</p>
        </div>
      ) : (
        <div className="space-y-2">
          {admins.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-[14px] font-bold text-slate-700">
                  {a.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900">{a.name}</p>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-bold",
                        a.role === "superadmin"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-600",
                      )}
                    >
                      {a.role}
                    </span>
                    {!a.isActive && (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                        неактивен
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-500">{a.email}</p>
                </div>
              </div>
              <div className="hidden items-center gap-1.5 text-[12px] text-slate-400 sm:flex">
                <Calendar className="h-3.5 w-3.5" />
                Последний вход: {fmt(a.lastLoginAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create admin modal — superadmin only */}
      {modalOpen && isSuperadmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[440px] rounded-2xl bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[18px] font-extrabold text-slate-900">Новый администратор</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full p-1 hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[13px] outline-none focus:border-slate-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Имя *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[13px] outline-none focus:border-slate-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Пароль *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[13px] outline-none focus:border-slate-400"
                  placeholder="Минимум 8 символов"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Роль
                </label>
                <div className="flex gap-2">
                  {(["admin", "superadmin"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={cn(
                        "flex-1 rounded-xl py-2.5 text-[13px] font-bold transition-colors",
                        role === r
                          ? r === "superadmin"
                            ? "bg-amber-500 text-amber-900"
                            : "bg-slate-900 text-white"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {formError && (
              <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700">
                {formError}
              </p>
            )}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-[14px] font-bold text-slate-700 hover:bg-slate-50"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => createMut.mutate()}
                disabled={!email.trim() || !name.trim() || !password.trim() || createMut.isPending}
                className="flex-1 rounded-xl bg-slate-900 py-3 text-[14px] font-bold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {createMut.isPending ? "Создаём…" : "Создать"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
