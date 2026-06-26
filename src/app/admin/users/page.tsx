"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { listAdminUsers, type AdminUserItem } from "@/lib/api/admin";
import { cn } from "@/lib/utils/cn";
import { Search, ChevronRight, ChevronLeft, Star, ShieldOff, Car } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | "driver" | "passenger">("");
  const [blockedFilter, setBlockedFilter] = useState<"" | "true" | "false">("");
  const debouncedQ = useDebounce(q, 300);

  // Cursor stack for prev/next paging; reset whenever a filter changes.
  const [cursors, setCursors] = useState<string[]>([]);
  const cursor = cursors[cursors.length - 1];
  useEffect(() => {
    setCursors([]);
  }, [debouncedQ, roleFilter, blockedFilter]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", debouncedQ, roleFilter, blockedFilter, cursor],
    queryFn: () =>
      listAdminUsers({
        q: debouncedQ || undefined,
        role: roleFilter || undefined,
        blocked: (blockedFilter || undefined) as "true" | "false" | undefined,
        cursor,
        limit: 20,
      }),
    staleTime: 30_000,
  });

  const items: AdminUserItem[] = data?.data ?? [];
  const hasNext = !!data?.nextCursor;
  const hasPrev = cursors.length > 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-[24px] font-extrabold text-slate-900">Пользователи</h1>
        <p className="text-[13px] text-slate-500">Поиск и управление аккаунтами</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Имя или телефон…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-[13px] outline-none focus:border-slate-400"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as "" | "driver" | "passenger")}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] outline-none focus:border-slate-400"
        >
          <option value="">Все роли</option>
          <option value="driver">Водители</option>
          <option value="passenger">Пассажиры</option>
        </select>
        <select
          value={blockedFilter}
          onChange={(e) => setBlockedFilter(e.target.value as "" | "true" | "false")}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] outline-none focus:border-slate-400"
        >
          <option value="">Все статусы</option>
          <option value="false">Активные</option>
          <option value="true">Заблокированные</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center">
          <p className="font-bold text-slate-600">Пользователи не найдены</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Пользователь
                </th>
                <th className="hidden px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:table-cell">
                  Роли
                </th>
                <th className="hidden px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 md:table-cell">
                  Рейтинг
                </th>
                <th className="hidden px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 lg:table-cell">
                  Поездки
                </th>
                <th className="hidden px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 lg:table-cell">
                  Зарег.
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Статус
                </th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((u) => (
                <tr key={u.id} className="group hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-[12px] font-bold text-slate-600">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-[11px] text-slate-500">{u.phone}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r) => (
                        <span
                          key={r}
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-bold",
                            r === "driver"
                              ? "bg-sky-100 text-sky-700"
                              : "bg-teal-100 text-teal-700",
                          )}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    {u.rating != null ? (
                      <div className="flex items-center gap-1 text-[13px]">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="font-bold">{u.rating.toFixed(1)}</span>
                        <span className="text-slate-400">({u.ratingCount})</span>
                      </div>
                    ) : (
                      <span className="text-[13px] text-slate-400">—</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {u.totalTrips != null ? (
                      <div className="flex items-center gap-1 text-[13px]">
                        <Car className="h-3 w-3 text-slate-400" />
                        <span className="font-bold text-slate-700">{u.totalTrips}</span>
                      </div>
                    ) : (
                      <span className="text-[13px] text-slate-400">—</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-[13px] text-slate-500 lg:table-cell">
                    {fmt(u.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {u.isBlocked ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700">
                        <ShieldOff className="h-3 w-3" />
                        Блок
                      </span>
                    ) : (
                      <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700">
                        Активен
                      </span>
                    )}
                    {u.complaintsCount > 0 && (
                      <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                        {u.complaintsCount} жал.
                      </span>
                    )}
                  </td>
                  <td className="pr-4">
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(hasPrev || hasNext) && (
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            disabled={!hasPrev}
            onClick={() => setCursors((p) => p.slice(0, -1))}
            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Назад
          </button>
          <button
            type="button"
            disabled={!hasNext}
            onClick={() => {
              if (data?.nextCursor) setCursors((p) => [...p, data.nextCursor!]);
            }}
            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            Вперёд <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
