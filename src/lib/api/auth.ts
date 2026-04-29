import { api, getRefreshToken, setAccessToken, setRefreshToken } from "./client";
import type { AnyAuthResult, AuthResult, CheckPhoneResult, SelfUser } from "./types";

export async function checkPhone(phone: string): Promise<CheckPhoneResult> {
  const { data } = await api.post<CheckPhoneResult>("/auth/check-phone", { phone });
  return data;
}

export async function sendOtp(phone: string): Promise<{ expiresInSec: number; debug_code?: string }> {
  const { data } = await api.post<{ expiresInSec: number; debug_code?: string }>("/auth/phone/send-otp", { phone });
  return data;
}

export async function sendTelegramOtp(phone: string): Promise<{ expiresInSec: number }> {
  const { data } = await api.post<{ expiresInSec: number }>("/auth/telegram/otp/send", { phone });
  return data;
}

export async function initTelegramLink(
  phone: string,
): Promise<{ token: string; deepLink: string; expiresInSec: number }> {
  const { data } = await api.post<{ token: string; deepLink: string; expiresInSec: number }>(
    "/auth/telegram/link/init",
    { phone },
  );
  return data;
}

export async function getTelegramLinkStatus(
  token: string,
): Promise<{ status: "waiting" | "sent" | "expired" }> {
  const { data } = await api.get<{ status: "waiting" | "sent" | "expired" }>(
    "/auth/telegram/link/status",
    { params: { token } },
  );
  return data;
}

export async function verifyOtp(phone: string, code: string): Promise<AuthResult> {
  const { data } = await api.post<AuthResult>("/auth/phone/verify", {
    phone,
    code,
    channel: "web",
  });
  return data;
}

export async function loginWithPassword(phone: string, password: string): Promise<AuthResult> {
  const { data } = await api.post<AuthResult>("/auth/phone/login", { phone, password });
  return data;
}

export async function loginWithGoogle(idToken: string): Promise<AnyAuthResult> {
  const { data } = await api.post<AnyAuthResult>("/auth/google", { idToken });
  return data;
}

export async function loginWithApple(identityToken: string): Promise<AnyAuthResult> {
  const { data } = await api.post<AnyAuthResult>("/auth/apple", { identityToken });
  return data;
}

export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export async function loginWithTelegram(payload: TelegramAuthData): Promise<AnyAuthResult> {
  const { data } = await api.post<AnyAuthResult>("/auth/telegram", payload);
  return data;
}

export async function initTelegramBotLogin(): Promise<{ token: string; deepLink: string; expiresInSec: number }> {
  const { data } = await api.post<{ token: string; deepLink: string; expiresInSec: number }>(
    "/auth/telegram/bot-login/init",
  );
  return data;
}

export async function getTelegramBotLoginStatus(
  token: string,
): Promise<{ status: "waiting" | "done" | "expired" | "not_found" }> {
  const { data } = await api.get<{ status: "waiting" | "done" | "expired" }>(
    "/auth/telegram/bot-login/status",
    { params: { token } },
  );
  return data;
}

export async function claimTelegramBotLogin(token: string): Promise<AuthResult> {
  const { data } = await api.post<AuthResult>("/auth/telegram/bot-login/claim", { token });
  return data;
}

// Mini App auto-login — sends the raw initData string (HMAC-verified by backend).
export async function loginWithTelegramMiniApp(initData: string): Promise<AnyAuthResult> {
  const { data } = await api.post<AnyAuthResult>("/auth/telegram", { initData });
  return data;
}

export async function logout(): Promise<void> {
  const rt = getRefreshToken();
  try {
    if (rt) await api.post("/auth/logout", { refreshToken: rt });
  } finally {
    setAccessToken(null);
    setRefreshToken(null);
  }
}

export async function getMe(): Promise<SelfUser> {
  const { data } = await api.get<SelfUser>("/users/me");
  return data;
}

export async function updateProfile(patch: {
  name?: string;
  language?: "ru" | "kg";
  termsAccepted?: true;
}): Promise<SelfUser> {
  const { data } = await api.patch<SelfUser>("/users/me", patch);
  return data;
}

export async function setPassword(newPassword: string, currentPassword?: string): Promise<void> {
  await api.patch("/users/me/password", {
    newPassword,
    ...(currentPassword ? { currentPassword } : {}),
  });
}

export async function resetPassword(newPassword: string): Promise<void> {
  await api.post("/auth/phone/reset-password", { newPassword });
}

export async function confirmPhoneAdd(newPhone: string, code: string): Promise<AuthResult> {
  const { data } = await api.patch<AuthResult>("/users/me/phone/confirm", { newPhone, code });
  return data;
}
