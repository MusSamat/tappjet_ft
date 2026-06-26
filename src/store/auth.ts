import { create } from "zustand";
import { setAccessToken, markSessionHint, clearSessionHint } from "@/lib/api/client";
import type { AuthResult, SelfUser } from "@/lib/api/types";

type Status = "idle" | "loading" | "authenticated" | "anonymous";
type ActiveMode = "driver" | "passenger";

const MODE_KEY = "tappjet_mode";

function resolveMode(user: SelfUser | null, stored: string | null): ActiveMode {
  const hasDriver = user?.roles?.includes("driver") ?? false;
  if (stored === "driver" && hasDriver) return "driver";
  if (stored === "passenger") return "passenger";
  return hasDriver ? "driver" : "passenger";
}

function readStoredMode(): string | null {
  try {
    return typeof window !== "undefined" ? localStorage.getItem(MODE_KEY) : null;
  } catch {
    return null;
  }
}

function persistMode(mode: ActiveMode) {
  try {
    if (typeof window !== "undefined") localStorage.setItem(MODE_KEY, mode);
  } catch {}
}

interface AuthState {
  user: SelfUser | null;
  status: Status;
  activeMode: ActiveMode;
  setStatus: (s: Status) => void;
  setActiveMode: (mode: ActiveMode) => void;
  hydrate: (user: SelfUser) => void;
  setSession: (result: AuthResult) => void;
  clearSession: () => void;
  updateUser: (patch: Partial<SelfUser>) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  activeMode: "passenger",
  setStatus: (status) => set({ status }),
  setActiveMode: (mode) => {
    persistMode(mode);
    set({ activeMode: mode });
  },
  hydrate: (user) => {
    const stored = readStoredMode();
    const activeMode = resolveMode(user, stored);
    set({ user, status: "authenticated", activeMode });
  },
  setSession: (result) => {
    setAccessToken(result.accessToken ?? null);
    if (result.accessToken) markSessionHint();
    else clearSessionHint();
    const user = result.user as unknown as SelfUser;
    const stored = readStoredMode();
    const activeMode = resolveMode(user, stored);
    set({ user, status: "authenticated", activeMode });
  },
  clearSession: () => {
    setAccessToken(null);
    clearSessionHint();
    set({ user: null, status: "anonymous", activeMode: "passenger" });
  },
  updateUser: (patch) => set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
}));
