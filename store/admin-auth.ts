import { create } from "zustand";

const ADMIN_RT_KEY = "tappjet_admin_refresh";
const ADMIN_INFO_KEY = "tappjet_admin_info";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "superadmin";
}

interface AdminAuthState {
  token: string | null;       // access token — memory only
  admin: AdminUser | null;
  expiresAt: number | null;   // ms when access token expires
  setSession: (params: {
    accessToken: string;
    admin: AdminUser;
    accessTokenExpiresIn: number;
    refreshToken: string;
  }) => void;
  hydrateAdmin: (accessToken: string, admin: AdminUser, expiresAt: number) => void;
  setAccessToken: (token: string, expiresIn: number) => void;
  clearSession: () => void;
}

export const useAdminAuth = create<AdminAuthState>((set) => ({
  token: null,
  admin: null,
  expiresAt: null,

  setSession: ({ accessToken, admin, accessTokenExpiresIn, refreshToken }) => {
    try {
      sessionStorage.setItem(ADMIN_RT_KEY, refreshToken);
      localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(admin));
    } catch {}
    set({ token: accessToken, admin, expiresAt: Date.now() + accessTokenExpiresIn * 1000 });
  },

  // Restores memory state without touching storage — used by AdminAuthBootstrap on page load.
  hydrateAdmin: (accessToken, admin, expiresAt) =>
    set({ token: accessToken, admin, expiresAt }),

  setAccessToken: (token, expiresIn) =>
    set((s) => ({ token, expiresAt: Date.now() + expiresIn * 1000, admin: s.admin })),

  clearSession: () => {
    try {
      sessionStorage.removeItem(ADMIN_RT_KEY);
      localStorage.removeItem(ADMIN_INFO_KEY);
    } catch {}
    set({ token: null, admin: null, expiresAt: null });
  },
}));

export const getAdminToken = (): string | null => useAdminAuth.getState().token;

export function getAdminRefreshToken(): string | null {
  try {
    return typeof window !== "undefined" ? sessionStorage.getItem(ADMIN_RT_KEY) : null;
  } catch {
    return null;
  }
}

export function getStoredAdminInfo(): AdminUser | null {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(ADMIN_INFO_KEY) : null;
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}
