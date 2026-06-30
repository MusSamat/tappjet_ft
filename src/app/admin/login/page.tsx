"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/store/admin-auth";
import { adminLogin } from "@/lib/api/admin";
import { cn } from "@/lib/utils/cn";
import type { AxiosError } from "axios";

interface ApiErr { error?: { code?: string; message?: string } }

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [showTotp, setShowTotp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setSession } = useAdminAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await adminLogin(email, password, totp || undefined);
      setSession({
        accessToken: result.accessToken,
        admin: result.admin,
        accessTokenExpiresIn: result.accessTokenExpiresIn,
        refreshToken: result.refreshToken,
      });
      router.replace("/admin/dashboard");
    } catch (err: unknown) {
      const code = (err as AxiosError<ApiErr>)?.response?.data?.error?.code;
      if (code === "TOTP_REQUIRED") {
        setShowTotp(true);
        setError("Введите код из приложения аутентификатора");
      } else if (code === "INVALID_CREDENTIALS") {
        setError("Неверный email или пароль");
      } else {
        setError("Ошибка входа. Попробуйте снова.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[400px] rounded-2xl bg-white p-8 shadow-xl">
      <div className="mb-6 text-center">
        <div className="mb-1 flex items-center justify-center gap-2">
          <span className="text-[22px] font-extrabold text-slate-900">Tappjet</span>
          <span className="rounded bg-accent-500 px-1.5 py-0.5 text-[10px] font-bold text-accent-700">
            ADMIN
          </span>
        </div>
        <p className="text-[13px] text-slate-500">Панель администратора</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] outline-none focus:border-slate-500"
            placeholder="admin@tappjet.kg"
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Пароль
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] outline-none focus:border-slate-500"
          />
        </div>

        {showTotp && (
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Код 2FA
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={totp}
              onChange={(e) => setTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] tracking-widest outline-none focus:border-slate-500"
              placeholder="000000"
              maxLength={6}
            />
          </div>
        )}

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full rounded-xl bg-slate-900 py-3 text-[14px] font-bold text-white transition-opacity hover:bg-slate-800",
            loading && "opacity-50",
          )}
        >
          {loading ? "Входим…" : "Войти"}
        </button>
      </form>
    </div>
  );
}
