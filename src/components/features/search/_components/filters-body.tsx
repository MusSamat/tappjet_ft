"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeftRight, ShieldCheck, UserCheck, CigaretteOff, PawPrint } from "lucide-react";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils/cn";

function todayYMD() { return new Date().toISOString().split("T")[0]!; }
function isCustomDate(v: string) { return /^\d{4}-\d{2}-\d{2}$/.test(v); }

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-ink-400">
      {children}
    </p>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-1 text-[12px] font-semibold transition-colors",
        active
          ? "border-brand-600 bg-brand-50 text-brand-700"
          : "border-ink-200 text-ink-600 hover:border-brand-300 hover:text-brand-700",
      )}
    >
      {children}
    </button>
  );
}

export function FiltersBody() {
  const t = useTranslations("search_filters");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const SORT_OPTIONS = [
    { value: "time",        label: t("sort_time") },
    { value: "price_asc",   label: t("sort_price_asc") },
    { value: "rating_desc", label: t("sort_rating_desc") },
  ] as const;

  const DATE_CHIPS = [
    { value: "today",    label: t("date_today") },
    { value: "tomorrow", label: t("date_tomorrow") },
    { value: "weekend",  label: t("date_weekend") },
  ] as const;

  const RATING_OPTIONS = [
    { value: "0",   label: t("rating_any") },
    { value: "4.0", label: "4.0+" },
    { value: "4.5", label: "4.5+" },
    { value: "4.8", label: "4.8+" },
  ] as const;

  const LUGGAGE_OPTIONS = [
    { value: "",      label: t("luggage_any") },
    { value: "yes",   label: t("luggage_big") },
    { value: "small", label: t("luggage_small") },
    { value: "no",    label: t("luggage_none") },
  ] as const;

  const fromCity     = params.get("from") ?? params.get("from_city") ?? "";
  const toCity       = params.get("to")   ?? params.get("to_city")   ?? "";
  const sort         = params.get("sort")          ?? "time";
  const onlyVerified = params.get("only_verified") === "true";
  const womenOnly    = params.get("women_only")    === "true";
  const noSmoking    = params.get("no_smoking")    === "true";
  const petsAllowed  = params.get("pets")          === "true";
  const luggage      = params.get("luggage")       ?? "";
  const minPrice     = params.get("min_price")     ?? "";
  const maxPrice     = params.get("max_price")     ?? "";
  const minRating    = params.get("min_rating")    ?? "0";
  const dateParam    = params.get("date")          ?? "";

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params);
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      }
      next.delete("cursor");
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Route */}
      <div>
        <Label>{t("route_label")}</Label>
        <div className="flex flex-col gap-1">
          <CityAutocomplete compact value={fromCity} onChange={(v) => update({ from: v || null })} placeholder={t("from_placeholder")} />
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-ink-100" />
            <button type="button" onClick={() => update({ from: toCity || null, to: fromCity || null })} disabled={!fromCity && !toCity} className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-400 transition-colors hover:border-brand-400 hover:text-brand-600 disabled:opacity-30" aria-label={t("swap_aria")}>
              <ArrowLeftRight className="h-2.5 w-2.5" />
            </button>
            <div className="h-px flex-1 bg-ink-100" />
          </div>
          <CityAutocomplete compact value={toCity} onChange={(v) => update({ to: v || null })} placeholder={t("to_placeholder")} />
        </div>
      </div>

      {/* Date */}
      <div>
        <Label>{t("date_label")}</Label>
        <div className="flex flex-wrap gap-1.5">
          <Chip active={!dateParam} onClick={() => update({ date: null })}>{t("date_any")}</Chip>
          {DATE_CHIPS.map((d) => (
            <Chip key={d.value} active={dateParam === d.value} onClick={() => update({ date: d.value })}>{d.label}</Chip>
          ))}
        </div>
        <div className="mt-2">
          <DatePicker compact value={isCustomDate(dateParam) ? dateParam : ""} onChange={(v) => update({ date: v || null })} min={todayYMD()} placeholder={t("date_pick")} />
        </div>
      </div>

      {/* Sort */}
      <div>
        <Label>{t("sort_label")}</Label>
        <div className="flex flex-wrap gap-1.5">
          {SORT_OPTIONS.map((o) => (
            <Chip key={o.value} active={sort === o.value} onClick={() => update({ sort: o.value === "time" ? null : o.value })}>{o.label}</Chip>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <Label>{t("rating_label")}</Label>
        <div className="flex flex-wrap gap-1.5">
          {RATING_OPTIONS.map((r) => (
            <Chip key={r.value} active={minRating === r.value || (r.value === "0" && !params.get("min_rating"))} onClick={() => update({ min_rating: r.value === "0" ? null : r.value })}>{r.label}</Chip>
          ))}
        </div>
      </div>

      {/* Luggage */}
      <div>
        <Label>{t("luggage_label")}</Label>
        <div className="flex flex-wrap gap-1.5">
          {LUGGAGE_OPTIONS.map((o) => (
            <Chip key={o.value || "any"} active={luggage === o.value} onClick={() => update({ luggage: o.value || null })}>{o.label}</Chip>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <Label>{t("price_label")}</Label>
        <div className="flex items-center gap-2">
          <input type="number" inputMode="numeric" min={50} placeholder={t("price_from")} defaultValue={minPrice} onBlur={(e) => update({ min_price: e.target.value || null })} className="h-9 w-full rounded-lg border border-ink-200 bg-white px-2.5 text-[12px] font-semibold outline-none focus:border-brand-500" />
          <span className="text-[12px] text-ink-400">—</span>
          <input type="number" inputMode="numeric" min={50} placeholder={t("price_to")} defaultValue={maxPrice} onBlur={(e) => update({ max_price: e.target.value || null })} className="h-9 w-full rounded-lg border border-ink-200 bg-white px-2.5 text-[12px] font-semibold outline-none focus:border-brand-500" />
        </div>
      </div>

      {/* Preferences */}
      <div>
        <Label>{t("prefs_label")}</Label>
        <div className="flex flex-col gap-2">
          {([
            { key: "women_only", active: womenOnly,   icon: UserCheck,    label: t("pref_women_only") },
            { key: "no_smoking", active: noSmoking,   icon: CigaretteOff, label: t("pref_no_smoking") },
            { key: "pets",       active: petsAllowed, icon: PawPrint,     label: t("pref_pets") },
          ] as const).map(({ key, active, icon: Icon, label }) => (
            <button key={key} type="button" role="switch" aria-checked={active} onClick={() => update({ [key]: active ? null : "true" })} className={cn("flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors", active ? "border-brand-500 bg-brand-50" : "border-ink-200 bg-white hover:border-ink-300")}>
              <Icon className={cn("h-4 w-4 flex-shrink-0", active ? "text-brand-600" : "text-ink-400")} />
              <span className={cn("flex-1 text-[12px] font-bold", active ? "text-brand-700" : "text-ink-700")}>{label}</span>
              <div className={cn("relative h-5 w-9 flex-shrink-0 rounded-full transition-colors", active ? "bg-brand-500" : "bg-ink-200")}>
                <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform", active ? "translate-x-4" : "translate-x-0.5")} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Verified */}
      <button type="button" role="switch" aria-checked={onlyVerified} onClick={() => update({ only_verified: onlyVerified ? null : "true" })} className={cn("flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors", onlyVerified ? "border-brand-500 bg-brand-50" : "border-ink-200 bg-white hover:border-ink-300")}>
        <ShieldCheck className={cn("h-4 w-4 flex-shrink-0", onlyVerified ? "text-brand-600" : "text-ink-400")} />
        <div className="min-w-0 flex-1">
          <p className={cn("text-[12px] font-bold", onlyVerified ? "text-brand-700" : "text-ink-700")}>{t("only_verified")}</p>
        </div>
        <div className={cn("relative h-5 w-9 flex-shrink-0 rounded-full transition-colors", onlyVerified ? "bg-brand-500" : "bg-ink-200")}>
          <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform", onlyVerified ? "translate-x-4" : "translate-x-0.5")} />
        </div>
      </button>
    </div>
  );
}
