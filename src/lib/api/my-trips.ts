import { api } from "./client";
import type { TripListItem } from "./trips";

export type MyTripsTab = "active" | "in_transit" | "past" | "cancelled";

export async function listMyTrips(
  tab: MyTripsTab = "active",
  cursor?: string,
  limit = 20,
): Promise<{ data: TripListItem[]; nextCursor: string | null }> {
  const { data } = await api.get<{ data: TripListItem[]; nextCursor: string | null }>(
    "/trips/my",
    { params: { tab, cursor, limit } },
  );
  return data;
}
