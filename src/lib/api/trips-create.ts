import { api } from "./client";
import type { components } from "./schema.gen";
import { uuid } from "@/lib/utils/uuid";

type TripDetail = components["schemas"]["TripDetail"];

export type LuggageOption = "yes" | "small" | "no";

export interface CreateTripInput {
  originCity: string;
  destinationCity: string;
  pickupCities?: string[];
  dropoffCities?: string[];
  originAddress: string;
  originLat?: number;
  originLng?: number;
  departureAt: string;
  /** «Выезжаем 06:00–11:00» — optional window end, ISO datetime after departureAt. */
  departureWindowEnd?: string;
  departureFlexible?: boolean;
  seatsTotal: number;
  pricePerSeat: number;
  priceNegotiable?: boolean;
  luggage?: LuggageOption;
  preferences?: Record<string, boolean>;
  comment?: string;
}

export async function createTrip(input: CreateTripInput): Promise<TripDetail> {
  const { data } = await api.post<TripDetail>("/trips", input, {
    headers: { "Idempotency-Key": uuid() },
  });
  return data;
}
