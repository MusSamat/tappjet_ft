import type { Metadata } from "next";
import { searchTrips, type SearchTripsParams } from "@/lib/api/trips";
import { SearchLayout } from "@/components/features/search/search-layout";

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

function paramsFromSearch(sp: Props["searchParams"]): SearchTripsParams {
  const from = str(sp.from) ?? str(sp.from_city);
  const to = str(sp.to) ?? str(sp.to_city);
  return {
    ...(from ? { from_city: from } : {}),
    ...(to ? { to_city: to } : {}),
    date: str(sp.date),
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
  const params = paramsFromSearch(searchParams);
  if (!params.from_city || !params.to_city) {
    return {
      title: "Все поездки",
      description: "Найди попутчика по Кыргызстану: Бишкек — Ош, Каракол, Нарын, Иссык-Куль.",
    };
  }
  const title = `${params.from_city} → ${params.to_city}${params.date ? ` · ${params.date}` : ""} | Поездки`;
  return {
    title,
    description: `Поездки ${params.from_city} → ${params.to_city}${params.date ? ` на ${params.date}` : ""}. Цены от 500 сом, верифицированные водители.`,
    alternates: {
      canonical: `/trips?from=${encodeURIComponent(params.from_city)}&to=${encodeURIComponent(params.to_city)}`,
    },
  };
}

export default async function TripsPage({ searchParams }: Props) {
  const params = paramsFromSearch(searchParams);

  let initial;
  try {
    initial = await searchTrips(params);
  } catch {
    initial = { data: [], nextCursor: null };
  }

  return <SearchLayout params={params} initial={initial} />;
}
