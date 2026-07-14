import { api } from "./client";
import type { EngagementFields } from "./types";
import { getAnonId } from "@/lib/utils/anon-id";

export interface PassengerRequest extends EngagementFields {
  id: string;
  passengerId: string;
  originCity: string;
  destinationCity: string;
  seatsNeeded: number;
  departureDate: string;
  flexible: boolean;
  comment: string | null;
  status: string;
  createdAt: string;
  /** The viewing driver's own response to this request, if any. */
  myResponse?: { id: string; status: string } | null;
  passenger: {
    id: string;
    name: string;
    avatarUrl: string | null;
    rating: number | null;
    ratingCount: number;
  };
}

// Lean browse card DTO returned by GET /passenger-requests — a strict subset of
// PassengerRequest carrying only what the request card renders. The full request
// (comment, metrics) is fetched via getPassengerRequest() when a card opens.
// Keep in sync with the backend PassengerRequestCardItem schema + RequestCard.
export type PassengerRequestCardItem = Pick<
  PassengerRequest,
  | "id"
  | "passengerId"
  | "originCity"
  | "destinationCity"
  | "seatsNeeded"
  | "departureDate"
  | "flexible"
  | "status"
  | "liked"
  | "myResponse"
  | "passenger"
>;

export interface ListPassengerRequestsParams {
  from_city?: string;
  to_city?: string;
  date?: string;
  seats?: number;
  cursor?: string;
  limit?: number;
}

export interface PassengerRequestsResult {
  /** true = exact city had no results; page shows same-raion (sub-city) matches */
  nearby?: boolean;
  data: PassengerRequest[];
  nextCursor: string | null;
}

/** Browse result — lean card items (GET /passenger-requests). */
export interface PassengerRequestsBrowseResult {
  nearby?: boolean;
  data: PassengerRequestCardItem[];
  nextCursor: string | null;
}

export interface CreatePassengerRequestInput {
  originCity: string;
  destinationCity: string;
  seatsNeeded: number;
  departureDate: string;
  flexible?: boolean;
  comment?: string;
}

export async function listPassengerRequests(
  params: ListPassengerRequestsParams = {},
): Promise<PassengerRequestsBrowseResult> {
  const { data } = await api.get<PassengerRequestsBrowseResult>("/passenger-requests", { params });
  return data;
}

/** Per-day open-request counts for a route — calendar availability hints. */
export async function getRequestsCalendar(from: string, to: string): Promise<Record<string, number>> {
  const { data } = await api.get<{ data: { date: string; count: number }[] }>(
    "/passenger-requests/calendar",
    { params: { from_city: from, to_city: to } },
  );
  return Object.fromEntries(data.data.map((d) => [d.date, d.count]));
}

export async function getPassengerRequest(id: string): Promise<PassengerRequest> {
  const { data } = await api.get<PassengerRequest>(`/passenger-requests/${id}`);
  return data;
}

export async function listMyPassengerRequests(): Promise<PassengerRequestsResult> {
  const { data } = await api.get<PassengerRequestsResult>("/passenger-requests/my");
  return data;
}

export async function createPassengerRequest(
  input: CreatePassengerRequestInput,
): Promise<PassengerRequest> {
  const { data } = await api.post<PassengerRequest>("/passenger-requests", input);
  return data;
}

export async function cancelPassengerRequest(id: string): Promise<void> {
  await api.delete(`/passenger-requests/${id}`);
}

export async function likePassengerRequest(id: string): Promise<{ liked: true }> {
  const { data } = await api.post<{ liked: true }>(`/passenger-requests/${id}/like`);
  return data;
}

/** Record a unique view (deduped server-side by user / anon id). */
export async function recordRequestView(id: string): Promise<void> {
  await api.post(`/passenger-requests/${id}/view`, { anonId: getAnonId() });
}

export async function unlikePassengerRequest(id: string): Promise<{ liked: false }> {
  const { data } = await api.delete<{ liked: false }>(`/passenger-requests/${id}/like`);
  return data;
}

export interface RequestResponse {
  id: string;
  requestId: string;
  driverId: string;
  price: number;
  departureTime: string;
  message: string | null;
  status: string;
  bookingId: string | null;
  expiresAt: string;
  createdAt: string;
  driver: {
    id: string;
    name: string;
    avatarUrl: string | null;
    rating: number | null;
    ratingCount: number;
    verified: boolean;
  };
}

export interface RespondInput {
  price: number;
  departureTime: string;
  message?: string;
}

export async function respondToRequest(requestId: string, input: RespondInput): Promise<RequestResponse> {
  const { data } = await api.post<RequestResponse>(`/passenger-requests/${requestId}/respond`, input);
  return data;
}

export async function listRequestResponses(requestId: string): Promise<RequestResponse[]> {
  const { data } = await api.get<RequestResponse[]>(`/passenger-requests/${requestId}/responses`);
  return data;
}

export async function acceptRequestResponse(requestId: string, responseId: string): Promise<{ bookingId: string }> {
  const { data } = await api.post<{ bookingId: string }>(`/passenger-requests/${requestId}/respond/${responseId}/accept`);
  return data;
}

export async function declineRequestResponse(requestId: string, responseId: string): Promise<void> {
  await api.post(`/passenger-requests/${requestId}/respond/${responseId}/decline`);
}
