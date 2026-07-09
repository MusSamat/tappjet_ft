import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { searchTrips } from "@/lib/api/trips";
import { buildTripSearchParams } from "@/lib/trip-search-params";
import { SearchLayout } from "@/components/features/search/search-layout";
import { RouteEntry } from "@/components/features/search/route-entry";

export const revalidate = 0;

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

// Shared builder (same logic as SearchLayout's client-side filtering) fed by the
// Next server-searchParams record.
function paramsFromSearch(sp: Props["searchParams"]) {
  return buildTripSearchParams((k) => str(sp[k]) ?? null);
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

  return <SearchLayout initial={initial} />;
}
