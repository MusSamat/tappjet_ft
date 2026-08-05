import { api } from "./client";

export interface Car {
  id: string;
  make: string;
  model: string;
  color: string | null;
  plate: string;
  seatsCount: number;
  createdAt: string;
}

export interface CarCreateInput {
  make: string;
  model: string;
  color?: string;
  plate: string;
  seatsCount: number;
}

export async function listMyCars(): Promise<Car[]> {
  const { data } = await api.get<{ data: Car[] }>("/cars");
  return data.data;
}

export async function addCar(input: CarCreateInput): Promise<Car> {
  const { data } = await api.post<Car>("/cars", input);
  return data;
}

export async function deleteCar(id: string): Promise<void> {
  await api.delete(`/cars/${id}`);
}

// ─── Car catalog (brands → models) — cached reference data ────────────────────
export interface CarBrand {
  id: number;
  name: string;
}
export interface CarModel {
  id: number;
  name: string;
  bodyType: string | null;
}

export async function listCarBrands(): Promise<CarBrand[]> {
  const { data } = await api.get<{ data: CarBrand[] }>("/cars/catalog/brands");
  return data.data;
}

export async function listCarModels(brandId: number): Promise<CarModel[]> {
  const { data } = await api.get<{ data: CarModel[] }>(`/cars/catalog/brands/${brandId}/models`);
  return data.data;
}

export interface CarColor {
  id: number;
  nameRu: string;
  nameKy: string;
  hex: string;
}

export async function listCarColors(): Promise<CarColor[]> {
  const { data } = await api.get<{ data: CarColor[] }>("/cars/catalog/colors");
  return data.data;
}
