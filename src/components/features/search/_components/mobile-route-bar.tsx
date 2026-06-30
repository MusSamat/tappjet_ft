"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import { ArrowLeftRight } from "lucide-react";

export function MobileRouteBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const from = params.get("from") ?? params.get("from_city") ?? "";
  const to = params.get("to") ?? params.get("to_city") ?? "";

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    next.delete("cursor");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2 py-2">
      <CityAutocomplete
        compact
        value={from}
        onChange={(v) => update({ from: v || null })}
        placeholder="Откуда"
        className="flex-1"
      />
      <button
        type="button"
        onClick={() => update({ from: to || null, to: from || null })}
        disabled={!from && !to}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-500 transition-colors hover:border-brand-400 hover:text-brand-600 disabled:opacity-30"
        aria-label="Поменять местами"
      >
        <ArrowLeftRight className="h-3 w-3" aria-hidden="true" />
      </button>
      <CityAutocomplete
        compact
        value={to}
        onChange={(v) => update({ to: v || null })}
        placeholder="Куда"
        className="flex-1"
      />
    </div>
  );
}
