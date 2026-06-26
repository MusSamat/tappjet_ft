import { api } from "./client";

export interface City {
  id: number;
  nameRu: string;
  nameKg: string;
  nameEn: string;
  regionNameRu: string;
  regionNameKg: string;
  districtNameRu: string | null;
  districtNameKg: string | null;
  lat: number | null;
  lng: number | null;
}

export interface PopularRoute {
  from: string;
  to: string;
  tripCount: number;
  minPrice: number | null;
}

export async function getCities(): Promise<City[]> {
  const { data } = await api.get<{ data: City[] }>("/cities");
  return data.data;
}

export async function searchCities(q: string, limit = 10): Promise<City[]> {
  if (!q.trim()) return [];
  const { data } = await api.get<{ data: City[] }>("/cities", { params: { q: q.trim(), limit } });
  return data.data;
}

export async function getPopularRoutes(): Promise<PopularRoute[]> {
  const { data } = await api.get<{ data: PopularRoute[] }>("/cities/popular-routes");
  return data.data;
}