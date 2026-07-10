"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowDownUp, ArrowRight, Circle, Clock, MapPin, Search } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import { IntentToggle } from "./intent-toggle";
import { useAuth } from "@/store/auth";
import { PopularRoutes } from "./popular-routes";
import { getRecentRoutes, addRecentRoute, type RecentRoute } from "@/lib/recent-routes";

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
  const pathname = usePathname();
  const user = useAuth((s) => s.user);
  const activeMode = useAuth((s) => s.activeMode);
  const setActiveMode = useAuth((s) => s.setActiveMode);
  // Driver role is granted only after admin verification — safe intent gate.
  const isDriver = user?.roles?.includes("driver") ?? false;

  const [m, setM] = useState<Mode>(
    mode ?? (isDriver && activeMode === "driver" ? "requests" : "trips"),
  );
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const canGo = from.trim().length > 0 && to.trim().length > 0;

  // Recent searches (last 3) — loaded client-side to avoid a hydration mismatch.
  const [recent, setRecent] = useState<RecentRoute[]>([]);
  useEffect(() => setRecent(getRecentRoutes()), []);

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

  const go = (fromRaw: string, toRaw: string) => {
    const f = fromRaw.trim();
    const tt = toRaw.trim();
    if (!f || !tt) return;
    try {
      localStorage.setItem(LAST_ROUTE_KEY, JSON.stringify({ from: f, to: tt }));
    } catch {
      /* ignore quota / private mode */
    }
    addRecentRoute(f, tt);
    const qs = new URLSearchParams({ from: f, to: tt });
    // Unified home `/`: stay on `/`, switch the role to match the chosen intent
    // so the home renders the right feed. Legacy routes navigate to /trips|/requests.
    if (pathname === "/") {
      setActiveMode(m === "requests" ? "driver" : "passenger");
      router.push(`/?${qs.toString()}`);
    } else {
      router.push(`/${m}?${qs.toString()}`);
    }
  };
  const submit = () => go(from, to);

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8 sm:py-12">
      {/* Gate screens (/trips, /requests without a route) get a way back;
          the home hero doesn't need one. */}
      {mode && <BackButton />}
      <h1 className="font-disp text-[26px] font-900 leading-tight text-ink-900 dark:text-white">
        {t("route_title")}
      </h1>
      <p className="mt-1.5 text-[15px] font-700 text-ink-500 dark:text-ink-400">{t("route_hint")}</p>

      {/* Intent toggle — the same two-line switch as in the create form */}
      {modeSwitchable && (
        <IntentToggle
          className="mt-5"
          value={m === "trips" ? "passenger" : "driver"}
          onChange={(v) => setM(v === "passenger" ? "trips" : "requests")}
        />
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
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent-500 text-[16px] font-900 text-accent-ink shadow-cta transition-colors hover:bg-accent-400 disabled:opacity-40"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        {m === "requests" ? t("find_passenger") : t("find_trip")}
      </button>

      {/* Recent searches (last 3) — one tap re-runs the search. */}
      {recent.length > 0 && (
        <div className="mt-7">
          <p className="mb-2 text-[13px] font-800 text-ink-500 dark:text-ink-400">{t("recent_searches")}</p>
          <div className="flex flex-col gap-2">
            {recent.map((r, i) => (
              <button
                key={`${r.from}-${r.to}-${i}`}
                type="button"
                onClick={() => go(r.from, r.to)}
                className="flex items-center gap-2.5 rounded-2xl border border-ink-200 bg-white p-3 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/40 dark:border-ink-700 dark:bg-ink-900 dark:hover:border-brand-500/40"
              >
                <Clock className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-[14px] font-800 text-ink-900 dark:text-white">
                  {r.from} <span className="text-ink-400">→</span> {r.to}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Favorites / popular routes — the fallback when there's no recent search. */}
      {(showPopular ?? m === "trips") && (
        <div className="mt-8">
          <PopularRoutes />
        </div>
      )}
    </div>
  );
}
