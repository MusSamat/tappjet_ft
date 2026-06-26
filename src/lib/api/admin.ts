import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { getAdminToken, useAdminAuth } from "@/store/admin-auth";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const adminApi = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
  // Send/receive the admin HttpOnly refresh cookie.
  withCredentials: true,
});

adminApi.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type RetriableConfig = AxiosRequestConfig & { _retry?: boolean };

let adminRefreshPromise: Promise<string> | null = null;

export async function doAdminRefresh(): Promise<{
  accessToken: string;
  accessTokenExpiresIn: number;
}> {
  // The admin refresh token lives in an HttpOnly cookie.
  const { data } = await axios.post<{ accessToken: string; accessTokenExpiresIn: number }>(
    `${baseURL}/auth/admin/refresh`,
    { channel: "web" },
    { withCredentials: true },
  );
  return data;
}

adminApi.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const code = (error.response?.data as { error?: { code?: string } })?.error?.code;
    const isRefreshCall = original?.url?.includes("/auth/admin/refresh");

    if (
      status === 401 &&
      code === "TOKEN_EXPIRED" &&
      original &&
      !original._retry &&
      !isRefreshCall
    ) {
      original._retry = true;
      try {
        if (!adminRefreshPromise) {
          adminRefreshPromise = doAdminRefresh()
            .then((r) => {
              useAdminAuth.getState().setAccessToken(r.accessToken, r.accessTokenExpiresIn);
              return r.accessToken;
            })
            .finally(() => {
              adminRefreshPromise = null;
            });
        }
        const token = await adminRefreshPromise;
        original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
        return adminApi(original);
      } catch {
        useAdminAuth.getState().clearSession();
        if (typeof window !== "undefined") window.location.assign("/admin/login");
      }
    }

    if (status === 401 && typeof window !== "undefined") {
      useAdminAuth.getState().clearSession();
      window.location.assign("/admin/login");
    }
    return Promise.reject(error);
  },
);

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdminLoginResult {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
  admin: { id: string; email: string; name: string; role: "admin" | "superadmin" };
}

export interface KpiCards {
  users: { total: number; last_7d: number; last_30d: number };
  activeDrivers7d: number;
  publishedTripsNow: number;
  completedTrips: { last_7d: number; last_30d: number };
  acceptanceRate7d: number | null;
  pendingVerifications: number;
  openComplaints: number;
  avgDriverRating: number | null;
}

// ── Verifications ─────────────────────────────────────────────────────────────

export interface VerificationQueueItem {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  carPlate: string;
  carMake: string;
  carModel: string;
  submittedAt: string;
  verificationStatus: string;
  slaBreach: boolean;
}

export interface VerificationDetail {
  id: string;
  userId: string;
  user: { id: string; name: string; phone: string; language: string };
  car: { make: string; model: string; year: number; color: string; plate: string; seats: number };
  photos: { license: string; carPassport: string; carPhoto: string; selfie: string };
  verificationStatus: string;
  rejectionReason: string | null;
  requestedDocs: string[];
  submittedAt: string;
  verifiedAt: string | null;
  verifiedBy: string | null;
}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface AdminUserItem {
  id: string;
  name: string;
  phone: string;
  roles: string[];
  rating: number | null;
  ratingCount: number;
  totalTrips: number | null;
  isBlocked: boolean;
  createdAt: string;
  complaintsCount: number;
}

export interface AdminUserDetail extends AdminUserItem {
  language: string;
  phoneVerifiedAt: string | null;
  telegramId: string | null;
  blockedReason: string | null;
  deletedAt: string | null;
  driverProfile: {
    verificationStatus: string;
    carPlate: string;
    totalTrips: number;
    cancellations30d: number;
  } | null;
}

// ── Complaints ────────────────────────────────────────────────────────────────

export interface ComplaintItem {
  id: string;
  category: string;
  priority: string;
  status: string;
  reporterId: string;
  reporterName: string;
  targetUserId: string | null;
  targetTripId: string | null;
  description: string;
  attachments: string[];
  createdAt: string;
  resolvedAt: string | null;
  resolution: string | null;
  handledBy: string | null;
  slaBreach: boolean;
}

export interface CityItem {
  id: number;
  name: string;
  nameKg: string;
  isActive: boolean;
  region?: string | null;
}

export interface AdminMember {
  id: string;
  email: string;
  name: string;
  role: "admin" | "superadmin";
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  targetId: string | null;
  targetType: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  admin: { id: string; email: string; name: string; role: string };
}

export interface CursorPage<T> {
  data: T[];
  nextCursor: string | null;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function adminLogin(
  email: string,
  password: string,
  totp?: string,
): Promise<AdminLoginResult> {
  const { data } = await adminApi.post<AdminLoginResult>("/auth/admin/login", {
    email,
    password,
    totp,
    channel: "web",
  });
  return data;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export async function getAdminKpi(): Promise<KpiCards> {
  const { data } = await adminApi.get<KpiCards>("/admin/analytics/kpi");
  return data;
}

export async function getAdminChart(
  name: string,
  days = 30,
): Promise<{ name: string; data: unknown }> {
  const { data } = await adminApi.get<{ name: string; data: unknown }>(
    `/admin/analytics/charts/${name}`,
    { params: { days } },
  );
  return data;
}

// ─── Verifications ────────────────────────────────────────────────────────────

export async function listVerifications(params?: {
  status?: string;
  cursor?: string;
  limit?: number;
}): Promise<CursorPage<VerificationQueueItem>> {
  const { data } = await adminApi.get<CursorPage<VerificationQueueItem>>("/admin/verifications", {
    params,
  });
  return data;
}

export async function getVerification(id: string): Promise<VerificationDetail> {
  const { data } = await adminApi.get<VerificationDetail>(`/admin/verifications/${id}`);
  return data;
}

export async function approveVerification(id: string): Promise<VerificationDetail> {
  const { data } = await adminApi.patch<VerificationDetail>(`/admin/verifications/${id}/approve`);
  return data;
}

export async function rejectVerification(id: string, reason: string): Promise<VerificationDetail> {
  const { data } = await adminApi.patch<VerificationDetail>(`/admin/verifications/${id}/reject`, {
    reason,
  });
  return data;
}

export async function requestVerificationDocs(
  id: string,
  docs: string[],
  note?: string,
): Promise<VerificationDetail> {
  const { data } = await adminApi.patch<VerificationDetail>(
    `/admin/verifications/${id}/request-docs`,
    { docs, note },
  );
  return data;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function listAdminUsers(params?: {
  q?: string;
  role?: string;
  blocked?: "true" | "false";
  sort?: "created_desc" | "created_asc" | "rating_desc" | "rating_asc";
  cursor?: string;
  limit?: number;
}): Promise<CursorPage<AdminUserItem>> {
  const { data } = await adminApi.get<CursorPage<AdminUserItem>>("/admin/users", {
    params: { sort: "created_desc", ...params },
  });
  return data;
}

export async function getAdminUser(id: string): Promise<AdminUserDetail> {
  const { data } = await adminApi.get<AdminUserDetail>(`/admin/users/${id}`);
  return data;
}

export async function blockUser(id: string, reason: string): Promise<AdminUserDetail> {
  const { data } = await adminApi.patch<AdminUserDetail>(`/admin/users/${id}/block`, {
    reason,
  });
  return data;
}

export async function unblockUser(id: string): Promise<AdminUserDetail> {
  const { data } = await adminApi.patch<AdminUserDetail>(`/admin/users/${id}/unblock`);
  return data;
}

// ─── Complaints ───────────────────────────────────────────────────────────────

export async function listAdminComplaints(params?: {
  status?: string;
  cursor?: string;
  limit?: number;
}): Promise<CursorPage<ComplaintItem>> {
  const { data } = await adminApi.get<CursorPage<ComplaintItem>>("/admin/complaints", {
    params,
  });
  return data;
}

export async function getAdminComplaint(id: string): Promise<ComplaintItem> {
  const { data } = await adminApi.get<ComplaintItem>(`/admin/complaints/${id}`);
  return data;
}

export async function resolveComplaint(
  id: string,
  status: "resolved" | "dismissed",
  resolution: string,
): Promise<ComplaintItem> {
  const { data } = await adminApi.patch<ComplaintItem>(`/admin/complaints/${id}/resolve`, {
    status,
    resolution,
  });
  return data;
}

// ─── Cities ───────────────────────────────────────────────────────────────────

export async function listAdminCities(): Promise<{ data: CityItem[] }> {
  const { data } = await adminApi.get<{ data: CityItem[] }>("/admin/cities");
  return data;
}

export async function createCity(input: {
  name: string;
  nameKg: string;
  region?: string;
  isActive?: boolean;
}): Promise<CityItem> {
  const { data } = await adminApi.post<CityItem>("/admin/cities", input);
  return data;
}

export async function updateCity(
  id: number,
  input: Partial<{ name: string; nameKg: string; region: string; isActive: boolean }>,
): Promise<CityItem> {
  const { data } = await adminApi.patch<CityItem>(`/admin/cities/${id}`, input);
  return data;
}

// ─── Admins (superadmin only) ─────────────────────────────────────────────────

export async function listAdmins(): Promise<{ data: AdminMember[] }> {
  const { data } = await adminApi.get<{ data: AdminMember[] }>("/admin/admins");
  return data;
}

export async function createAdmin(input: {
  email: string;
  name: string;
  password: string;
  role: "admin" | "superadmin";
}): Promise<AdminMember> {
  const { data } = await adminApi.post<AdminMember>("/admin/admins", input);
  return data;
}

// ─── Trips ───────────────────────────────────────────────────────────────────

export interface AdminTripItem {
  id: string;
  originCity: string;
  destinationCity: string;
  departureAt: string;
  status: string;
  pricePerSeat: number;
  seatsTotal: number;
  seatsAvailable: number;
  bookingsCount: number;
  cancelledReason: string | null;
  driver: { id: string; name: string; phone: string };
  createdAt: string;
}

export interface AdminTripDetail extends AdminTripItem {
  originAddress: string;
  comment: string | null;
  driverProfile: {
    verificationStatus: string;
    carPlate: string;
    carMake: string;
    carModel: string;
    carYear: number;
    carColor: string;
  } | null;
  bookings: Array<{
    id: string;
    passengerId: string;
    passengerName: string;
    passengerPhone: string;
    status: string;
    seatsCount: number;
    createdAt: string;
  }>;
}

export async function listAdminTrips(params?: {
  status?: string;
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
}): Promise<CursorPage<AdminTripItem>> {
  const { data } = await adminApi.get<CursorPage<AdminTripItem>>("/admin/trips", { params });
  return data;
}

export async function getAdminTrip(id: string): Promise<AdminTripDetail> {
  const { data } = await adminApi.get<AdminTripDetail>(`/admin/trips/${id}`);
  return data;
}

// ─── Trips (force-cancel) ─────────────────────────────────────────────────────

export async function adminForceCancel(
  tripId: string,
  reason: string,
): Promise<{ id: string; status: string }> {
  const { data } = await adminApi.patch<{ id: string; status: string }>(
    `/admin/trips/${tripId}/cancel`,
    { reason },
  );
  return data;
}

// ─── Audit log ────────────────────────────────────────────────────────────────

export async function listAuditLog(params?: {
  adminId?: string;
  action?: string;
  cursor?: string;
  limit?: number;
}): Promise<CursorPage<AuditLogItem>> {
  const { data } = await adminApi.get<CursorPage<AuditLogItem>>("/admin/audit-log", {
    params,
  });
  return data;
}
