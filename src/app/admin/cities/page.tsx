"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAdminCities, createCity, updateCity, type CityItem } from "@/lib/api/admin";
import { useAdminAuth } from "@/store/admin-auth";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { Plus, Pencil, Check, X } from "lucide-react";

function EditRow({
  city,
  onSave,
  onCancel,
  saving,
}: {
  city: Partial<CityItem>;
  onSave: (data: { name: string; nameKg: string; region: string; isActive: boolean }) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState(city.name ?? "");
  const [nameKg, setNameKy] = useState(city.nameKg ?? "");
  const [region, setRegion] = useState(city.region ?? "");
  const [isActive, setIsActive] = useState(city.isActive ?? true);

  return (
    <tr className="bg-accent-50">
      <td className="px-4 py-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название (рус)"
          className="w-full rounded-lg border border-accent-200 px-3 py-1.5 text-[13px] outline-none focus:border-accent-400"
        />
      </td>
      <td className="px-4 py-2">
        <input
          value={nameKg}
          onChange={(e) => setNameKy(e.target.value)}
          placeholder="Название (кырг)"
          className="w-full rounded-lg border border-accent-200 px-3 py-1.5 text-[13px] outline-none focus:border-accent-400"
        />
      </td>
      <td className="px-4 py-2">
        <input
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="Регион"
          className="w-full rounded-lg border border-accent-200 px-3 py-1.5 text-[13px] outline-none focus:border-accent-400"
        />
      </td>
      <td className="px-4 py-2 text-center">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4"
        />
      </td>
      <td className="px-4 py-2">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onSave({ name, nameKg, region, isActive })}
            disabled={!name.trim() || !nameKg.trim() || saving}
            className="rounded-lg bg-brand-600 p-1.5 text-white hover:bg-brand-700 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-ink-200 p-1.5 text-ink-600 hover:bg-ink-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminCitiesPage() {
  const { admin } = useAdminAuth();
  const isSuperAdmin = admin?.role === "superadmin";
  const qc = useQueryClient();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "cities"],
    queryFn: listAdminCities,
    staleTime: 60_000,
  });

  const cities: CityItem[] = data?.data ?? [];

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin", "cities"] });

  const createMut = useMutation({
    mutationFn: createCity,
    onSuccess: () => { invalidate(); setAdding(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, input }: { id: number; input: Parameters<typeof updateCity>[1] }) =>
      updateCity(id, input),
    onSuccess: () => { invalidate(); setEditingId(null); },
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-disp font-extrabold text-ink-900">Города</h1>
          <p className="text-[13px] text-ink-500">
            {isSuperAdmin ? "Управление списком городов" : "Только просмотр (нет прав суперадмина)"}
          </p>
        </div>
        {isSuperAdmin && !adding && (
          <Button
            type="button"
            variant="invert"
            onClick={() => setAdding(true)}
          >
            <Plus className="h-4 w-4" />
            Добавить
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-white" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-100">
                {["Название (рус)", "Название (кырг)", "Регион", "Активен", isSuperAdmin ? "Действия" : ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-ink-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {adding && (
                <EditRow
                  city={{}}
                  onSave={(d) => createMut.mutate(d)}
                  onCancel={() => setAdding(false)}
                  saving={createMut.isPending}
                />
              )}
              {cities.map((c) =>
                editingId === c.id ? (
                  <EditRow
                    key={c.id}
                    city={c}
                    onSave={(d) => updateMut.mutate({ id: c.id, input: d })}
                    onCancel={() => setEditingId(null)}
                    saving={updateMut.isPending}
                  />
                ) : (
                  <tr key={c.id} className="hover:bg-ink-50">
                    <td className="px-4 py-3 font-bold text-ink-900">{c.name}</td>
                    <td className="px-4 py-3 text-[13px] text-ink-600">{c.nameKg}</td>
                    <td className="px-4 py-3 text-[13px] text-ink-500">{c.region ?? "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "inline-block h-2 w-2 rounded-full",
                        c.isActive ? "bg-brand-500" : "bg-ink-300",
                      )} />
                    </td>
                    <td className="px-4 py-3">
                      {isSuperAdmin && (
                        <button
                          type="button"
                          onClick={() => setEditingId(c.id)}
                          className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
