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

export const DRIVER_TAGS = [
  { value: "on_time", label: "Пунктуальный" },
  { value: "safe_driving", label: "Безопасное вождение" },
  { value: "pleasant_chat", label: "Приятная беседа" },
  { value: "clean_car", label: "Чистый автомобиль" },
  { value: "comfortable_ride", label: "Комфортная поездка" },
  { value: "late", label: "Опоздал" },
  { value: "dirty_car", label: "Грязная машина" },
  { value: "dangerous_driving", label: "Опасное вождение" },
  { value: "rudeness", label: "Грубость" },
] as const;

export const PASSENGER_TAGS = [
  { value: "arrived_on_time", label: "Пришёл вовремя" },
  { value: "polite", label: "Вежливый" },
  { value: "no_heavy_luggage", label: "Без лишнего багажа" },
  { value: "pleasant_chat", label: "Приятная компания" },
  { value: "late", label: "Опоздал" },
  { value: "too_much_luggage", label: "Много багажа" },
  { value: "rudeness", label: "Грубость" },
] as const;

export function getPendingRatings(): Promise<Paginated<PendingRating>> {
  return api.get<Paginated<PendingRating>>("/ratings/pending").then((r) => r.data);
}

export function submitRating(input: SubmitRatingInput): Promise<void> {
  return api.post("/ratings", input).then(() => undefined);
}
