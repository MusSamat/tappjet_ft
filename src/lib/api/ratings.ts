import { api } from "./client";
import type { Paginated } from "./types";

export interface PendingRating {
  tripId: string;
  counterpartId: string;
  counterpartName: string;
  direction: "driver" | "passenger";
  departureAt: string;
  expiresAt: string;
}

export interface SubmitRatingInput {
  tripId: string;
  rateeId: string;
  score: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
  comment?: string;
}

// `labelKey` resolves against the `ratings.tags.*` message namespace.
export const DRIVER_TAGS = [
  { value: "on_time", labelKey: "on_time" },
  { value: "safe_driving", labelKey: "safe_driving" },
  { value: "pleasant_chat", labelKey: "pleasant_chat" },
  { value: "clean_car", labelKey: "clean_car" },
  { value: "comfortable_ride", labelKey: "comfortable_ride" },
  { value: "late", labelKey: "late" },
  { value: "dirty_car", labelKey: "dirty_car" },
  { value: "dangerous_driving", labelKey: "dangerous_driving" },
  { value: "rudeness", labelKey: "rudeness" },
] as const;

export const PASSENGER_TAGS = [
  { value: "arrived_on_time", labelKey: "arrived_on_time" },
  { value: "polite", labelKey: "polite" },
  { value: "no_heavy_luggage", labelKey: "no_heavy_luggage" },
  { value: "pleasant_chat", labelKey: "pleasant_company" },
  { value: "late", labelKey: "late" },
  { value: "too_much_luggage", labelKey: "too_much_luggage" },
  { value: "rudeness", labelKey: "rudeness" },
] as const;

export function getPendingRatings(): Promise<Paginated<PendingRating>> {
  return api.get<Paginated<PendingRating>>("/ratings/pending").then((r) => r.data);
}

export function submitRating(input: SubmitRatingInput): Promise<void> {
  return api.post("/ratings", input).then(() => undefined);
}
