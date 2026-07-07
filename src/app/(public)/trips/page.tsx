import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { searchTrips, type SearchTripsParams } from "@/lib/api/trips";
import { SearchLayout } from "@/components/features/search/search-layout";
import { RouteEntry } from "@/components/features/search/route-entry";

export const revalidate = 0;

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function num(v: string | string[] | undefined): number | undefined {
  const s = str(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

// Chips write YYYY-MM-DD; the API wants a full ISO datetime. Anchor the day at
// local Kyrgyzstan midnight (fixed UTC+6, no DST) so the 24h window matches
// the calendar day the user tapped. "today" is a legacy alias.
function normalizeDate(v: string | undefined): string | undefined {
  if (!v || v === "any") return undefined; // «any» = explicit no-date-filter
  const ymd =
    v === "today"
      ? new Date(Date.now() + 6 * 3_600_000).toISOString().slice(0, 10)
      : /^\d{4}-\d{2}-\d{2}$/.test(v)
        ? v
        : null;
  // Unknown tokens (legacy «tomorrow»/«weekend» links) → drop, don't 400.
  return ymd ? `${ymd}T00:00:00+06:00` : undefined;
}

function paramsFromSearch(sp: Props["searchParams"]): SearchTripsParams {
  const from = str(sp.from) ?? str(sp.from_city);
  const to = str(sp.to) ?? str(sp.to_city);
  return {
    ...(from ? { from_city: from } : {}),
    ...(to ? { to_city: to } : {}),
    // Default to today (Yandex-style) — the results screen always has a day selected.
    date: normalizeDate(str(sp.date) ?? "today"),
    seats: num(sp.seats),
    min_price: num(sp.min_price),
    max_price: num(sp.max_price),
    min_rating: num(sp.min_rating),
    ...(str(sp.only_verified) === "true" ? { only_verified: true } : {}),
    ...(str(sp.women_only) === "true" ? { women_only: true } : {}),
    ...(str(sp.no_smoking) === "true" ? { no_smoking: true } : {}),
    ...(str(sp.pets) === "true" ? { pets: true } : {}),
    luggage: (str(sp.luggage) as SearchTripsParams["luggage"]) ?? undefined,
    sort: (str(sp.sort) as SearchTripsParams["sort"]) ?? undefined,
    limit: 20,
  };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const t = await getTranslations("trips_meta");
  const params = paramsFromSearch(searchParams);
  if (!params.from_city || !params.to_city) {
    return {
      title: t("all_trips"),
      description: t("all_trips_desc"),
    };
  }
  const hasDate = params.date ? "yes" : "no";
  const date = params.date ?? "";
  const title = t("route_title", { from: params.from_city, to: params.to_city, hasDate, date });
  return {
    title,
    description: t("route_desc", { from: params.from_city, to: params.to_city, hasDate, date }),
    alternates: {
      canonical: `/trips?from=${encodeURIComponent(params.from_city)}&to=${encodeURIComponent(params.to_city)}`,
    },
  };
}

export default async function TripsPage({ searchParams }: Props) {
  const params = paramsFromSearch(searchParams);

  // Route-first: don't fetch or show any trips until origin AND destination are
  // both set — mirror the «Межгород» flow (route entry → variants).
  if (!params.from_city || !params.to_city) {
    return <RouteEntry mode="trips" modeSwitchable initialFrom={params.from_city} initialTo={params.to_city} />;
  }

  let initial;
  try {
    initial = await searchTrips(params);
  } catch {
    initial = { data: [], nextCursor: null };
  }

  return <SearchLayout params={params} initial={initial} />;
}
