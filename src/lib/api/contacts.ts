import { api } from "./client";

export interface RevealedContact {
  phone: string;
  name: string;
}

/** Reveal the driver's phone for a trip («Позвонить»). Audited server-side. */
export async function revealTripContact(tripId: string): Promise<RevealedContact> {
  const { data } = await api.post<RevealedContact>(`/trips/${tripId}/contact`);
  return data;
}

/** Reveal the passenger's phone for a ride request. Audited server-side. */
export async function revealRequestContact(requestId: string): Promise<RevealedContact> {
  const { data } = await api.post<RevealedContact>(`/passenger-requests/${requestId}/contact`);
  return data;
}
