import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Clock, Luggage, ShieldCheck, Car as CarIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getTrip, type TripDetail } from "@/lib/api/trips";
import { extractError } from "@/lib/api/client";
import { formatDepartureLabel, formatDurationMin, formatPrice } from "@/lib/utils/date";
import { Container, DriverAvatar, RatingStars, RouteStops, SeatsBadge, VerifiedBadge } from "@/components/ui";
import { TripMap } from "@/components/features/trip/trip-map";
import { TripActionsPanel } from "@/components/features/trip/trip-actions-panel";
import { TripEngagement } from "@/components/features/trip/trip-engagement";
import { findCity } from "@/lib/kg-cities";

export const revalidate = 60;

interface Props {
  params: { id: string };
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
  if (!trip) return { title: "Поездка не найдена", robots: { index: false } };
  const title = `${trip.originCity} → ${trip.destinationCity} · ${trip.departureAt ? formatDepartureLabel(trip.departureAt) : ""}`;
  const desc = `Поездка ${trip.originCity} → ${trip.destinationCity}. ${trip.seatsAvailable ?? 0} мест, от ${formatPrice(trip.pricePerSeat ?? 0)}. ${trip.driver?.name ? `Водитель: ${trip.driver.name}` : ""}`;
  return {
    title,
    description: desc,
    alternates: { canonical: `/trips/${params.id}` },
    openGraph: { title, description: desc, type: "website" },
  };
}

export default async function TripDetailsPage({ params }: Props) {
  const trip = await fetchTrip(params.id);
  if (!trip) notFound();

  const tTrips = await getTranslations("trips");
  const _tSearch = await getTranslations("search");

  const driver = trip.driver ?? {};
  const rating = driver.rating ?? null;
  const ratingCount = driver.ratingCount ?? 0;
  const seatsAvailable = trip.seatsAvailable ?? 0;
  const seatsTotal = trip.seatsTotal ?? 0;

  const preferences = Object.entries(trip.preferences ?? {})
    .filter(([, v]) => v === true)
    .map(([k]) => k);

  const preferencesLabels: Record<string, string> = {
    silence: tTrips("pref_silence"),
    music: tTrips("pref_music"),
    no_smoking: tTrips("pref_no_smoking"),
    pets: tTrips("pref_pets"),
  };

  const originCity = findCity(trip.originCity);
  const destCity = findCity(trip.destinationCity);

  return (
    <Container className="py-6 lg:py-10">
      <nav aria-label="breadcrumb" className="mb-4 text-caption text-ink-500">
        <Link href="/trips" className="hover:text-brand-700">
          {tTrips("breadcrumb")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-700">
          {trip.originCity} → {trip.destinationCity}
        </span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-3 rounded-3xl border border-ink-100 bg-white shadow-card p-5">
            <div className="flex items-center gap-2 text-caption font-semibold text-ink-700">
              <Clock className="h-4 w-4 text-ink-500" aria-hidden="true" />
              {trip.departureAt && formatDepartureLabel(trip.departureAt)}
              {typeof trip.estimatedDurationMin === "number" && (
                <span className="text-ink-500"> · ~{formatDurationMin(trip.estimatedDurationMin)}</span>
              )}
              <div className="ml-auto">
                {trip.id && <TripEngagement tripId={trip.id} initialLiked={!!trip.liked} />}
              </div>
            </div>
            <h1 className="flex items-center gap-2 text-display text-ink-900">
              <span className="truncate">{trip.originCity}</span>
              <ArrowRight className="h-7 w-7 text-ink-500" aria-hidden="true" />
              <span className="truncate">{trip.destinationCity}</span>
            </h1>
            <RouteStops pickup={trip.pickupCities} dropoff={trip.dropoffCities} />
            <p className="text-body-lg text-ink-700">{trip.originAddress}</p>

            <div className="flex flex-wrap items-center gap-3">
              <SeatsBadge available={seatsAvailable} total={seatsTotal} />
              {driver.verified && <VerifiedBadge />}
              {typeof trip.luggage === "string" && (
                <span className="inline-flex items-center gap-1 text-caption text-ink-500">
                  <Luggage className="h-3.5 w-3.5" aria-hidden="true" />
                  {trip.luggage === "yes" ? tTrips("luggage_ok") : trip.luggage === "small" ? tTrips("luggage_small") : tTrips("luggage_none")}
                </span>
              )}
            </div>
          </header>

          {originCity && (
            <TripMap
              origin={{
                lat: originCity.lat,
                lng: originCity.lng,
                label: trip.originAddress ?? originCity.nameRu,
              }}
              destination={
                destCity
                  ? { lat: destCity.lat, lng: destCity.lng, label: destCity.nameRu }
                  : null
              }
              className="h-72 w-full overflow-hidden rounded-3xl border border-ink-100"
            />
          )}

          <section className="rounded-3xl border border-ink-100 bg-white shadow-card p-5">
            <h2 className="mb-4 text-h2 text-ink-900">{tTrips("driver_section")}</h2>
            <Link
              href={driver.id ? `/drivers/${driver.id}` : "#"}
              className="flex items-center gap-3 rounded-xl p-2 -m-2 hover:bg-ink-50"
            >
              <DriverAvatar name={driver.name ?? "?"} src={driver.avatarUrl ?? null} size="lg" />
              <div className="flex min-w-0 flex-col">
                <span className="text-h2 text-ink-900">{driver.name}</span>
                {rating !== null && ratingCount >= 3 ? (
                  <RatingStars value={rating} size={14} showValue />
                ) : (
                  <span className="text-caption text-ink-500">{tTrips("new_driver")}</span>
                )}
              </div>
            </Link>

            {driver.car && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-ink-50 p-3">
                <CarIcon className="h-5 w-5 text-ink-700" aria-hidden="true" />
                <div className="text-body-lg text-ink-900">
                  {driver.car.make} {driver.car.model}
                  {driver.car.color && <span className="text-ink-500"> · {driver.car.color}</span>}
                  {driver.car.plate && <span className="text-ink-500"> · {driver.car.plate}</span>}
                </div>
              </div>
            )}
          </section>

          {(trip.comment || preferences.length > 0) && (
            <section className="rounded-3xl border border-ink-100 bg-white shadow-card p-5">
              <h2 className="mb-3 text-h2 text-ink-900">{tTrips("details_section")}</h2>
              {trip.comment && <p className="text-body-lg text-ink-700">{trip.comment}</p>}
              {preferences.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {preferences.map((p) => (
                    <li
                      key={p}
                      className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-caption font-semibold text-brand-900"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      {preferencesLabels[p] ?? p}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <TripActionsPanel trip={trip} />
        </aside>
      </div>
    </Container>
  );
}
