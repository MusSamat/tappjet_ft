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
