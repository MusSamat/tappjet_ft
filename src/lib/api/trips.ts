import { api } from "./client";
import type { components } from "./schema.gen";

// Extend schema-gen types with runtime fields not yet in the generated spec
type GeneratedTripListItem = components["schemas"]["TripListItem"];
export type TripListItem = Omit<GeneratedTripListItem, "driver"> & {
  driver?: (Omit<NonNullable<GeneratedTripListItem["driver"]>, "car"> & {
    car?: ({
      make?: string;
      model?: string;
      color?: string;
      plate?: string;
      photoUrl?: string | null;
    }) | null;
    tripsCount?: number;
  }) | null;
  // Not yet in the generated spec — pickup (origin side) / dropoff (dest side) points.
  pickupCities?: string[];
  dropoffCities?: string[];
};
export type TripDetail = components["schemas"]["TripDetail"] & {
  pickupCities?: string[];
  dropoffCities?: string[];
};

export interface SearchTripsParams {
  from_city?: string;
  to_city?: string;
  date?: string;
  seats?: number;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  only_verified?: boolean;
  women_only?: boolean;
  no_smoking?: boolean;
  pets?: boolean;
  luggage?: "yes" | "small" | "no";
  sort?: "time" | "price_asc" | "rating_desc";
  cursor?: string;
  limit?: number;
}

export interface TripSearchResult {
  data: TripListItem[];
  nextCursor: string | null;
}

export async function searchTrips(params: SearchTripsParams): Promise<TripSearchResult> {
  const { data } = await api.get<TripSearchResult>("/trips", { params });
  return data;
}

export async function getTrip(id: string): Promise<TripDetail> {
  const { data } = await api.get<TripDetail>(`/trips/${id}`);
  return data;
}

export async function cancelTrip(id: string, reason?: string): Promise<void> {
  await api.delete(`/trips/${id}`, reason ? { data: { reason } } : undefined);
}

export async function completeTrip(id: string): Promise<{ status: 'completed' }> {
  const { data } = await api.patch<{ status: 'completed' }>(`/trips/${id}/complete`);
  return data;
}

export async function getPriceSuggestion(
  from: string,
  to: string,
): Promise<{ suggested: number; min: number; max: number }> {
  const { data } = await api.get<{ suggested: number; min: number; max: number }>(
    "/routes/price-suggestion",
    { params: { from, to } },
  );
  return data;
}
