import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n.config";
import { getTrip, type TripDetail } from "@/lib/api/trips";
import { extractError } from "@/lib/api/client";
import { formatDepartureLabel, formatPrice } from "@/lib/utils/date";
import { TripDetailView, type DetailTripData } from "@/components/features/trip/trip-detail";

export const revalidate = 60;

interface Props {
  params: { id: string };
  searchParams: { book?: string };
}

async function fetchTrip(id: string): Promise<TripDetail | null> {
  try {
    return await getTrip(id);
  } catch (e) {
    const err = extractError(e);
    if (err.code === "NOT_FOUND") return null;
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const trip = await fetchTrip(params.id);
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("trips_meta");
  if (!trip) return { title: t("not_found"), robots: { index: false } };
  const title = `${trip.originCity} → ${trip.destinationCity} · ${trip.departureAt ? formatDepartureLabel(trip.departureAt, locale) : ""}`;
  const desc = t("detail_desc", {
    from: trip.originCity,
    to: trip.destinationCity,
    seats: trip.seatsAvailable ?? 0,
    price: formatPrice(trip.pricePerSeat ?? 0),
    hasDriver: trip.driver?.name ? "yes" : "no",
    driver: trip.driver?.name ?? "",
  });
  return {
    title,
    description: desc,
    alternates: { canonical: `/trips/${params.id}` },
    openGraph: { title, description: desc, type: "website" },
  };
}

export default async function TripDetailsPage({ params, searchParams }: Props) {
  const trip = await fetchTrip(params.id);
  if (!trip) notFound();

  return (
    <TripDetailView
      trip={trip as DetailTripData}
      variant="page"
      autoOpenBook={searchParams.book === "1"}
    />
  );
}
