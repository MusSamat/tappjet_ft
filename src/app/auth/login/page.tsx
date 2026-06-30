"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import {
  loginWithPassword,
  resetPassword,
  initTelegramLink,
  getTelegramLinkStatus,
  verifyOtp,
} from "@/lib/api/auth";
import { extractError } from "@/lib/api/client";
import { friendlyError } from "@/lib/utils/api-error";
import { consumeDeferredAction, routeForIntent } from "@/lib/auth/deferred-action";
import { useAuth } from "@/store/auth";
import { useTranslations } from "next-intl";
import { PhoneInput, Spinner } from "@/components/ui";
import { OtpStep } from "./_steps/otp-step";
import { ResetStep } from "./_steps/reset-step";
import { cn } from "@/lib/utils/cn";
import { SocialButtons } from "@/components/features/auth/social-buttons";

type Step = "login" | "tg-forgot" | "otp" | "reset";

const FULL_PHONE_RE = /^\+996\d{9}$/;

export default function LoginPage() {
  const tl = useTranslations("auth.login");
  const router = useRouter();
  const setSession = useAuth((s) => s.setSession);

  const [step, setStep] = useState<Step>("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [tgDeepLink, setTgDeepLink] = useState<{ token: string; deepLink: string } | null>(null);

  const passwordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const digitRefs: React.RefObject<HTMLInputElement>[] = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const otp = digits.join("");
  const displayPhone = phone.replace(/^\+996/, "");
  const canSubmitLogin = FULL_PHONE_RE.test(phone) && password.length > 0;
  const canReset = newPassword.length >= 6 && newPassword === confirmPassword;

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setInterval(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendSeconds]);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  // ── Login with password ────────────────────────────────────────────────
  const loginMutation = useMutation({
    mutationFn: () => loginWithPassword(phone, password),
    onSuccess: (result) => {
      setSession(result);
      const intent = consumeDeferredAction();
      router.replace(intent ? routeForIntent(intent) : "/");
    },
    onError: (e) => setServerError(friendlyError(extractError(e))),
  });

  // ── Forgot password: initTelegramLink works for ALL users ─────────────
  const forgotMutation = useMutation({
    mutationFn: () => initTelegramLink(phone),
    onSuccess: ({ token, deepLink }) => {
      setServerError(null);
      setTgDeepLink({ token, deepLink });
      window.open(deepLink, "_blank");
      setStep("tg-forgot");
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const { status } = await getTelegramLinkStatus(token);
          if (status === "sent") {
            clearInterval(pollRef.current!);
            pollRef.current = null;
            setResendSeconds(60);
            setStep("otp");
            setTimeout(() => digitRefs[0]?.current?.focus(), 100);
          } else if (status === "expired") {
            clearInterval(pollRef.current!);
            pollRef.current = null;
            setTgDeepLink(null);
            setStep("login");
            setServerError("Ссылка истекла. Попробуйте снова.");
          }
        } catch {
          // keep polling
        }
      }, 2000);
    },
    onError: (e) => setServerError(friendlyError(extractError(e))),
  });

  const handleForgot = () => {
    if (!FULL_PHONE_RE.test(phone)) {
      setServerError(tl("enter_phone_first"));
      return;
    }
    setServerError(null);
    forgotMutation.mutate();
  };

  // ── Verify OTP ─────────────────────────────────────────────────────────
  const verifyMutation = useMutation({
    mutationFn: () => verifyOtp(phone, otp),
    onSuccess: (result) => {
      setSession(result);
      setStep("reset");
      setTimeout(() => newPasswordRef.current?.focus(), 100);
    },
    onError: (e) => {
      setServerError(friendlyError(extractError(e)));
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => digitRefs[0]?.current?.focus(), 50);
    },
  });

  const handleDigitChange = (idx: number, val: string) => {
    const cleaned = val.replace(/\D/g, "");
    setServerError(null);
    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, 6).split("");
      const next = ["", "", "", "", "", ""];
      pasted.forEach((d, i) => { if (i < 6) next[i] = d; });
      setDigits(next);
      digitRefs[Math.min(pasted.length - 1, 5)]?.current?.focus();
      if (pasted.length === 6) setTimeout(() => verifyMutation.mutate(), 50);
      return;
    }
    const d = cleaned.slice(-1);
    const next = [...digits];
    next[idx] = d;
    setDigits(next);
    if (d && idx < 5) digitRefs[idx + 1]?.current?.focus();
    if (next.every((v) => v !== "") && next.join("").length === 6) {
      setTimeout(() => verifyMutation.mutate(), 50);
    }
  };

  const handleDigitKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Backspace") return;
    if (digits[idx]) {
      const next = [...digits]; next[idx] = ""; setDigits(next);
    } else if (idx > 0) {
      digitRefs[idx - 1]?.current?.focus();
      const next = [...digits]; next[idx - 1] = ""; setDigits(next);
    }
  };

  // ── Reset password ─────────────────────────────────────────────────────
  const resetMutation = useMutation({
    mutationFn: () => resetPassword(newPassword),
    onSuccess: () => {
      const intent = consumeDeferredAction();
      router.replace(intent ? routeForIntent(intent) : "/");
    },
    onError: (e) => setServerError(friendlyError(extractError(e))),
  });

  return (
    <div
      className="flex min-h-[calc(100vh-64px)] items-center justify-center px-5 py-10"
      style={{ background: "linear-gradient(180deg, #ECFDF8 0%, #ffffff 60%)" }}
    >
      <div className="w-full max-w-[420px] rounded-3xl border border-ink-100 bg-white p-8 shadow-soft">

        {/* Logo */}
        <div className="mb-7 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-teal-500 shadow-brandcta">
            <span className="text-[22px] font-black tracking-tight text-white">Tj</span>
          </div>
          <h1 className="text-[22px] font-extrabold text-gray-900">Вход в Tappjet</h1>
          <p className="mt-1 text-[13px] font-medium text-gray-400">Попутчики и такси по Кыргызстану</p>
        </div>

        {/* Error banner */}
        {serverError && (
          <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-coral-50 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-coral-500" aria-hidden />
            <p className="text-[13px] font-semibold text-coral-700">{serverError}</p>
          </div>
        )}

        {/* ── Step: main login ── */}
        {step === "login" && (
          <>
            <SocialButtons />

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-gray-100" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                {tl("or_phone")}
              </span>
              <span className="h-px flex-1 bg-gray-100" />
            </div>

            {/* Phone */}
            <div className="mb-3">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {tl("phone_label")}
              </label>
              <div className="flex gap-2">
                <div className="flex h-12 w-[52px] shrink-0 items-center justify-center rounded-2xl border-2 border-ink-200 text-[20px]">
                  🇰🇬
                </div>
                <PhoneInput
                  value={phone}
                  onValueChange={(v) => { setPhone(v); setServerError(null); }}
                  invalid={false}
                  className="flex-1"
                  placeholder="700 123 456"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && FULL_PHONE_RE.test(phone)) passwordRef.current?.focus();
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {tl("password_label")}
              </label>
              <div className="relative">
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setServerError(null); }}
                  onKeyDown={(e) => { if (e.key === "Enter" && canSubmitLogin) loginMutation.mutate(); }}
                  placeholder={tl("password_placeholder")}
                  className={cn(
                    "h-12 w-full rounded-2xl border-[1.5px] bg-ink-50 px-3 pr-10 text-[14px] font-semibold outline-none transition-colors",
                    serverError
                      ? "border-coral-300 text-coral-700"
                      : "border-gray-200 text-gray-900 focus:border-teal-500",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="button"
              disabled={!canSubmitLogin || loginMutation.isPending}
              onClick={() => loginMutation.mutate()}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 text-[14px] font-bold text-[#4A2C00] transition-colors hover:bg-amber-600 disabled:opacity-40"
            >
              {loginMutation.isPending ? <><Spinner size={16} />{tl("logging_in")}</> : tl("login_btn")}
            </button>

            {/* Forgot + Register */}
            <div className="mt-5 flex flex-col items-center gap-3">
              <button
                type="button"
                disabled={forgotMutation.isPending}
                onClick={handleForgot}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-teal-600 disabled:opacity-50"
              >
                {forgotMutation.isPending && <Spinner size={13} />}
                {forgotMutation.isPending ? "Отправляем ссылку..." : tl("forgot_password")}
              </button>
              <p className="text-[12px] text-gray-400">
                {tl("no_account")}{" "}
                <Link href="/auth/register" className="font-bold text-teal-600 hover:text-teal-700">
                  {tl("register_link")}
                </Link>
              </p>
            </div>
          </>
        )}

        {/* ── Step: waiting for Telegram bot to send OTP ── */}
        {step === "tg-forgot" && tgDeepLink && (
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f4fc]">
              <svg viewBox="0 0 24 24" fill="#0088cc" className="h-8 w-8" aria-hidden>
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </div>

            <h2 className="text-[20px] font-extrabold text-gray-900">Подтвердите в Telegram</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
              Откройте бот{" "}
              <span className="font-bold text-teal-600">@tappjet_bot</span>{" "}
              и нажмите «Запустить» — получите код подтверждения
            </p>

            {/* Progress pulse */}
            <div className="my-5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full animate-pulse rounded-full bg-[#0088cc]"
                style={{ width: "55%" }}
              />
            </div>

            <a
              href={tgDeepLink.deepLink}
              target="_blank"
              rel="noreferrer"
              className="flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-[#0088cc] text-[14px] font-bold text-white transition-opacity hover:opacity-90"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden>
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              Открыть Telegram
            </a>

            <button
              type="button"
              className="mt-3 w-full text-[13px] font-semibold text-gray-400 hover:text-gray-600"
              onClick={() => {
                if (pollRef.current) clearInterval(pollRef.current);
                setTgDeepLink(null);
                setStep("login");
                setServerError(null);
              }}
            >
              ← Назад
            </button>
          </div>
        )}

        {/* ── Step: OTP input ── */}
        {step === "otp" && (
          <OtpStep
            tl={tl}
            displayPhone={displayPhone}
            digits={digits}
            otp={otp}
            serverError={serverError}
            verifyMutation={verifyMutation}
            sendMutation={forgotMutation}
            resendSeconds={resendSeconds}
            digitRefs={digitRefs}
            onDigitChange={handleDigitChange}
            onDigitKeyDown={handleDigitKeyDown}
            onBack={() => { setStep("login"); setDigits(["", "", "", "", "", ""]); setServerError(null); }}
            onResend={() => {
              if (resendSeconds > 0) return;
              setDigits(["", "", "", "", "", ""]);
              setServerError(null);
              forgotMutation.mutate();
            }}
          />
        )}

        {/* ── Step: new password ── */}
        {step === "reset" && (
          <ResetStep
            tl={tl}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            serverError={serverError}
            setServerError={setServerError}
            showNewPassword={showNewPassword}
            setShowNewPassword={setShowNewPassword}
            newPasswordRef={newPasswordRef}
            canReset={canReset}
            resetMutation={resetMutation}
            onSkip={() => {
              const intent = consumeDeferredAction();
              router.replace(intent ? routeForIntent(intent) : "/");
            }}
          />
        )}

      </div>
    </div>
  );
}
