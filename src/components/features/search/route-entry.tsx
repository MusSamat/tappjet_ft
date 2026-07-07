"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowDownUp, CarFront, Circle, MapPin, Search, User } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/store/auth";
import { PopularRoutes } from "./popular-routes";

// Last searched route survives navigation — prefills this form on return.
const LAST_ROUTE_KEY = "tappjet_last_route";

// Route-first entry (Yandex «Межгород» pattern) — the user sets origin +
// destination BEFORE any list is fetched; submitting navigates to /trips or
// /requests with ?from&to, at which point the page renders the variants.
//
// Two usages:
//   • feed gate  — fixed `mode` («/trips» or «/requests» without a route)
//   • home hero  — `modeSwitchable`: drivers get an intent toggle
//     («Ищу поездку» ↔ «Ищу пассажиров»), everyone else searches trips.
type Mode = "trips" | "requests";

interface Props {
  mode?: Mode;
  /** Show the intent toggle (home hero). Only rendered for verified drivers. */
  modeSwitchable?: boolean;
  initialFrom?: string;
  initialTo?: string;
  /** Popular-routes shortcuts under the form (default: trips mode only). */
  showPopular?: boolean;
}

export function RouteEntry({ mode, modeSwitchable = false, initialFrom = "", initialTo = "", showPopular }: Props) {
  const t = useTranslations("feed");
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const activeMode = useAuth((s) => s.activeMode);
  // Driver role is granted only after admin verification — safe intent gate.
  const isDriver = user?.roles?.includes("driver") ?? false;

  const [m, setM] = useState<Mode>(
    mode ?? (isDriver && activeMode === "driver" ? "requests" : "trips"),
  );
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const canGo = from.trim().length > 0 && to.trim().length > 0;

  // Prefill from the last search when opened without an explicit route.
  useEffect(() => {
    if (initialFrom || initialTo) return;
    try {
      const raw = localStorage.getItem(LAST_ROUTE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { from?: string; to?: string };
      if (saved.from) setFrom(saved.from);
      if (saved.to) setTo(saved.to);
    } catch {
      /* ignore corrupt storage */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = () => {
    if (!canGo) return;
    try {
      localStorage.setItem(LAST_ROUTE_KEY, JSON.stringify({ from: from.trim(), to: to.trim() }));
    } catch {
      /* ignore quota / private mode */
    }
    const qs = new URLSearchParams({ from: from.trim(), to: to.trim() });
    router.push(`/${m}?${qs.toString()}`);
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8 sm:py-12">
      {/* Gate screens (/trips, /requests without a route) get a way back;
          the home hero doesn't need one. */}
      {mode && <BackButton />}
      <h1 className="font-disp text-[26px] font-900 leading-tight text-ink-900 dark:text-white">
        {t("route_title")}
      </h1>
      <p className="mt-1.5 text-[13px] font-700 text-ink-500 dark:text-ink-400">{t("route_hint")}</p>

      {/* Intent toggle — only when switchable and the viewer is a verified
          driver. Compact two-line cards: bold identity + small action. */}
      {modeSwitchable && isDriver && (
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setM("trips")}
            aria-pressed={m === "trips"}
            className={cn(
              "flex items-center gap-2.5 rounded-2xl border-2 px-3 py-2.5 text-left transition-colors",
              m === "trips"
                ? "border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-brand-500/15"
                : "border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-900",
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                m === "trips"
                  ? "bg-brand-600 text-white"
                  : "bg-ink-100 text-ink-400 dark:bg-ink-800 dark:text-ink-400",
              )}
            >
              <User className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className={cn("block truncate text-[13px] font-900 leading-tight", m === "trips" ? "text-brand-700 dark:text-brand-300" : "text-ink-700 dark:text-ink-300")}>
                {t("mode_trips_title")}
              </span>
              <span className="block truncate text-[11px] font-600 text-ink-500 dark:text-ink-400">
                {t("mode_trips_sub")}
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setM("requests")}
            aria-pressed={m === "requests"}
            className={cn(
              "flex items-center gap-2.5 rounded-2xl border-2 px-3 py-2.5 text-left transition-colors",
              m === "requests"
                ? "border-grape-500 bg-grape-50 dark:border-grape-500 dark:bg-grape-500/15"
                : "border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-900",
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                m === "requests"
                  ? "bg-grape-500 text-white"
                  : "bg-ink-100 text-ink-400 dark:bg-ink-800 dark:text-ink-400",
              )}
            >
              <CarFront className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className={cn("block truncate text-[13px] font-900 leading-tight", m === "requests" ? "text-grape-600 dark:text-grape-300" : "text-ink-700 dark:text-ink-300")}>
                {t("mode_requests_title")}
              </span>
              <span className="block truncate text-[11px] font-600 text-ink-500 dark:text-ink-400">
                {t("mode_requests_sub")}
              </span>
            </span>
          </button>
        </div>
      )}

      {/* Route card — origin (teal) → destination (amber) with a swap control */}
      <div className="mt-5 rounded-3xl bg-white p-3 shadow-card ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
        <div className="flex items-center gap-2 pl-2">
          <Circle className="h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden="true" />
          <CityAutocomplete
            borderless
            value={from}
            onChange={setFrom}
            placeholder={t("from_placeholder")}
            className="min-w-0 flex-1"
          />
          <button
            type="button"
            onClick={() => { setFrom(to); setTo(from); }}
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
            onChange={setTo}
            placeholder={t("to_placeholder")}
            className="min-w-0 flex-1"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={!canGo}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent-500 text-[15px] font-900 text-accent-ink shadow-cta transition-colors hover:bg-accent-400 disabled:opacity-40"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        {m === "requests" ? t("find_passenger") : t("find_trip")}
      </button>

      {(showPopular ?? m === "trips") && (
        <div className="mt-8">
          <PopularRoutes />
        </div>
      )}
    </div>
  );
}
