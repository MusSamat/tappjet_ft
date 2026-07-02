"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowDownUp, CarFront, Circle, MapPin, SlidersHorizontal, User } from "lucide-react";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import { Segmented } from "@/components/ui/segmented";
import { Chip } from "@/components/ui/chip";
import { useUiRole } from "@/lib/hooks/use-role-colors";

// Mobile feed header — design-spec §2.2: map hero band + overlaid search
// card, «Найти поездку / Найти пассажира» segmented, filter chips row.

type FeedTab = "trips" | "requests";

function todayYMD() {
  return new Date().toISOString().split("T")[0]!;
}

/** Decorative dashed route over the map band (stroke #0D9488, teal→amber dots). */
function MapRoute() {
  return (
    <svg
      viewBox="0 0 340 128"
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden="true"
    >
      <path
        d="M30 100 C 100 96, 150 40, 220 44 S 300 24, 316 28"
        fill="none"
        stroke="#0D9488"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="1 10"
      />
      <circle cx="30" cy="100" r="6" fill="#0D9488" />
      <circle cx="316" cy="28" r="6" fill="#F59E0B" />
    </svg>
  );
}

interface FeedHeaderProps {
  tab: FeedTab;
  onOpenFilters: () => void;
}

export function FeedHeader({ tab, onOpenFilters }: FeedHeaderProps) {
  const t = useTranslations("feed");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const role = useUiRole();

  const from = params.get("from") ?? params.get("from_city") ?? "";
  const to = params.get("to") ?? params.get("to_city") ?? "";
  const date = params.get("date") ?? "";
  const sort = params.get("sort") ?? "";

  // «Сегодня» token: trips search accepts the "today" alias, requests need YMD.
  const todayValue = tab === "trips" ? "today" : todayYMD();
  const todayOn = date === todayValue;
  const cheaperOn = sort === "price_asc";

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    next.delete("cursor");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const switchTab = (next: FeedTab) => {
    if (next === tab) return;
    const qs = new URLSearchParams();
    if (from) qs.set("from", from);
    if (to) qs.set("to", to);
    const query = qs.toString();
    router.push(`/${next}${query ? `?${query}` : ""}`);
  };

  return (
    <div>
      {/* Map hero band + overlaid search card */}
      <div className="relative">
        <div
          className="h-32 w-full"
          style={{ background: "linear-gradient(135deg,#D0FBEF,#E0E7FF)" }}
        >
          <MapRoute />
        </div>
        <div className="relative z-10 -mt-[72px] px-4">
          <div className="rounded-2xl bg-white p-2 shadow-lift dark:bg-ink-900">
            <div className="flex items-center gap-2 pl-2">
              <Circle className="h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden="true" />
              <CityAutocomplete
                borderless
                value={from}
                onChange={(v) => update({ from: v || null })}
                placeholder={t("from_placeholder")}
                className="min-w-0 flex-1"
              />
              <button
                type="button"
                onClick={() => update({ from: to || null, to: from || null })}
                disabled={!from && !to}
                aria-label={t("swap_aria")}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-500 transition-colors disabled:opacity-40 dark:bg-ink-800 dark:text-ink-300"
              >
                <ArrowDownUp className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="my-1 ml-6 border-t border-dashed border-ink-200 dark:border-ink-700" aria-hidden="true" />
            <div className="flex items-center gap-2 pl-2 pr-10">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-accent-500" aria-hidden="true" />
              <CityAutocomplete
                borderless
                value={to}
                onChange={(v) => update({ to: v || null })}
                placeholder={t("to_placeholder")}
                className="min-w-0 flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Segmented: find trip / find passenger — guests only. Passengers are
          pinned to the trips feed (booking) and drivers to the requests feed
          (responding), so the opposite-role browse tab is hidden for them. */}
      {role === "guest" && (
        <div className="px-4 pt-3">
          <Segmented<FeedTab>
            value={tab}
            onChange={switchTab}
            tone={tab === "requests" ? "grape" : "brand"}
            options={[
              { value: "trips", label: t("find_trip"), icon: <CarFront className="h-4 w-4" aria-hidden="true" /> },
              { value: "requests", label: t("find_passenger"), icon: <User className="h-4 w-4" aria-hidden="true" /> },
            ]}
          />
        </div>
      )}

      {/* Chips row */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
        <Chip
          kind="quick"
          selected
          accent="brand"
          icon={<SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />}
          onClick={onOpenFilters}
        >
          {t("filters")}
        </Chip>
        <Chip
          kind="quick"
          selected={todayOn}
          accent="accent"
          onClick={() => update({ date: todayOn ? null : todayValue })}
        >
          {t("today")}
        </Chip>
        {tab === "trips" && (
          <Chip
            kind="quick"
            selected={cheaperOn}
            accent="accent"
            onClick={() => update({ sort: cheaperOn ? null : "price_asc" })}
          >
            {t("cheaper")}
          </Chip>
        )}
      </div>
    </div>
  );
}
