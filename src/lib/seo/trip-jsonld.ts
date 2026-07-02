import type { TripDetail } from "@/lib/api/trips";

/**
 * schema.org `Trip` for a ride-detail page: origin/destination itinerary,
 * departure time, a KGS-priced Offer, and the driver as `provider` carrying an
 * AggregateRating when the driver has real ratings. Rendered as a
 * <script type="application/ld+json"> — values come only from our API (no user
 * HTML), and JSON.stringify escapes them.
 */
export function buildTripJsonLd(trip: TripDetail, url: string): Record<string, unknown> {
  const driver = trip.driver;
  const provider: Record<string, unknown> = {
    "@type": "Person",
    name: driver?.name ?? "Tappjet",
  };
  if (driver?.rating != null && (driver.ratingCount ?? 0) > 0) {
    provider.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: driver.rating,
      ratingCount: driver.ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "Trip",
    name: `${trip.originCity} → ${trip.destinationCity}`,
    url,
    ...(trip.departureAt ? { departureTime: trip.departureAt } : {}),
    itinerary: [
      { "@type": "City", name: trip.originCity },
      { "@type": "City", name: trip.destinationCity },
    ],
    offers: {
      "@type": "Offer",
      price: trip.pricePerSeat ?? 0,
      priceCurrency: "KGS",
      availability:
        (trip.seatsAvailable ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
    },
    provider,
  };
}
