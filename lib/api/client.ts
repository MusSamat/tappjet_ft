import axios, { type AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";
import type { ApiError, TokenPair } from "./types";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

const REFRESH_KEY = "tappjet_refresh";

let accessToken: string | null = null;
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

let _onTokenRefreshed: (() => void) | null = null;
export function onTokenRefreshed(cb: () => void) { _onTokenRefreshed = cb; }
export const getAccessToken = () => accessToken;

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(REFRESH_KEY);
};

export const setRefreshToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  if (token) sessionStorage.setItem(REFRESH_KEY, token);
  else sessionStorage.removeItem(REFRESH_KEY);
};

export const setTokens = (pair: Pick<TokenPair, "accessToken" | "refreshToken">) => {
  if (pair.accessToken) setAccessToken(pair.accessToken);
  if (pair.refreshToken) setRefreshToken(pair.refreshToken);
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

type RetriableConfig = AxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string> | null = null;

export async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    const rt = getRefreshToken();
    if (!rt) throw new Error("NO_REFRESH_TOKEN");
    refreshPromise = axios
      .post<TokenPair>(`${baseURL}/auth/refresh`, { refreshToken: rt, channel: "web" })
      .then((r) => {
        setTokens({ accessToken: r.data.accessToken, refreshToken: r.data.refreshToken });
        if (!r.data.accessToken) throw new Error("NO_ACCESS_IN_REFRESH");
        _onTokenRefreshed?.();
        return r.data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError<ApiError>) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const code = error.response?.data?.error?.code;
    const isRefreshCall = original?.url?.includes("/auth/refresh");

    if (status === 401 && code === "TOKEN_EXPIRED" && original && !original._retry && !isRefreshCall) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
        return api(original);
      } catch {
        setAccessToken(null);
        setRefreshToken(null);
        if (typeof window !== "undefined") window.location.assign("/auth/login");
      }
    }
    return Promise.reject(error);
  },
);

export function extractError(e: unknown): ApiError["error"] {
  if (axios.isAxiosError<ApiError>(e) && e.response?.data?.error) return e.response.data.error;
  return { code: "INTERNAL_ERROR", message: "Что-то пошло не так" };
}
