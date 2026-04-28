import { api } from "./client";

export interface DriverStats {
  totalTrips: number;
  rating: number | null;
  ratingCount: number;
  cancellations30d: number;
}

export async function getDriverStats(): Promise<DriverStats> {
  const { data } = await api.get<DriverStats>("/drivers/me/stats");
  return data;
}
