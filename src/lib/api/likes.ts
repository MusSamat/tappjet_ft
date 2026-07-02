import { api } from "./client";
import type { TripListItem } from "./trips";
import type { PassengerRequest } from "./passenger-requests";

// Liked listings — GET /users/me/likes?type=trip|passenger_request.
// Cursor-paginated; item shapes match trips-search / passenger-requests-list
// (backend hydrates through the same mappers). See backend
// modules/users/likes.service.ts for the response contract.

export type LikeType = "trip" | "passenger_request";

export interface LikesResult<T> {
  data: T[];
  nextCursor: string | null;
}

export async function listTripLikes(cursor?: string, limit = 20): Promise<LikesResult<TripListItem>> {
  const { data } = await api.get<LikesResult<TripListItem>>("/users/me/likes", {
    params: { type: "trip", cursor, limit },
  });
  return data;
}

export async function listRequestLikes(cursor?: string, limit = 20): Promise<LikesResult<PassengerRequest>> {
  const { data } = await api.get<LikesResult<PassengerRequest>>("/users/me/likes", {
    params: { type: "passenger_request", cursor, limit },
  });
  return data;
}
