import { api } from "./client";

export interface PassengerRequest {
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
  passenger: {
    id: string;
    name: string;
    avatarUrl: string | null;
    rating: number | null;
    ratingCount: number;
  };
}

export interface ListPassengerRequestsParams {
  from_city?: string;
  to_city?: string;
  date?: string;
  seats?: number;
  cursor?: string;
  limit?: number;
}

export interface PassengerRequestsResult {
  data: PassengerRequest[];
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
): Promise<PassengerRequestsResult> {
  const { data } = await api.get<PassengerRequestsResult>("/passenger-requests", { params });
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
