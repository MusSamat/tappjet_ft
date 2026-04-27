"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { sendTelegramOtp, verifyOtp, loginWithPassword, resetPassword } from "@/lib/api/auth";
import { extractError } from "@/lib/api/client";
import { friendlyError } from "@/lib/utils/api-error";
import { consumeDeferredAction, routeForIntent } from "@/lib/auth/deferred-action";
import { useAuth } from "@/store/auth";
import { useTranslations } from "next-intl";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { PhoneInput } from "@/components/ui";
import { OtpStep } from "./_steps/otp-step";
import { ResetStep } from "./_steps/reset-step";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { SocialButtons } from "@/components/features/auth/social-buttons";

type Step = "login" | "otp" | "reset";

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

  const passwordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
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

  const parseRetryAfter = (e: unknown): number | null => {
    if (!axios.isAxiosError(e) || e.response?.status !== 429) return null;
    const raw = e.response.headers?.["retry-after"];
    const secs = raw ? parseInt(String(raw), 10) : NaN;
    return Number.isFinite(secs) && secs > 0 ? secs : 60;
  };

  // ── Войти по паролю ──────────────────────────────────────────────────
  const loginMutation = useMutation({
    mutationFn: () => loginWithPassword(phone, password),
    onSuccess: (result) => {
      setSession(result);
      const intent = consumeDeferredAction();
      router.replace(intent ? routeForIntent(intent) : "/");
    },
    onError: (e) => setServerError(friendlyError(extractError(e))),
  });

  // ── Забыл пароль: отправить OTP в Telegram ───────────────────────────
  const sendOtpMutation = useMutation({
    mutationFn: () => sendTelegramOtp(phone),
    onSuccess: (r) => {
      setServerError(null);
      setStep("otp");
      setResendSeconds(Math.min(r.expiresInSec > 0 ? r.expiresInSec : 60, 60));
      setTimeout(() => digitRefs[0]?.current?.focus(), 100);
    },
    onError: (e) => {
      setServerError(friendlyError(extractError(e)));
      const retryAfter = parseRetryAfter(e);
      if (retryAfter) setResendSeconds(retryAfter);
    },
  });

  const handleForgot = () => {
    if (!FULL_PHONE_RE.test(phone)) {
      setServerError(tl("enter_phone_first"));
      return;
    }
    setServerError(null);
    sendOtpMutation.mutate();
  };

  // ── Подтвердить OTP ──────────────────────────────────────────────────
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
      const retryAfter = parseRetryAfter(e);
      if (retryAfter) setResendSeconds(retryAfter);
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

  // ── Сохранить новый пароль ───────────────────────────────────────────
  const resetMutation = useMutation({
    mutationFn: () => resetPassword(newPassword),
    onSuccess: () => {
      const intent = consumeDeferredAction();
      router.replace(intent ? routeForIntent(intent) : "/");
    },
    onError: (e) => setServerError(friendlyError(extractError(e))),
  });

  // ────────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex min-h-screen items-center justify-center px-5 py-8 md:min-h-[calc(100vh-64px)]"
      style={{ background: "linear-gradient(180deg, #F9FAFB, white)" }}
    >
      <div className="w-full max-w-[440px] rounded-[20px] border-[0.5px] border-gray-200 bg-white p-8 shadow-lg">

        {/* Логотип */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[16px] bg-gradient-to-br from-teal-600 to-teal-500">
            <span className="text-[22px] font-black text-white">Tj</span>
          </div>
          <h1 className="text-[24px] font-bold leading-tight tracking-tight text-gray-900">
            {tl("app_title")}
          </h1>
          <p className="mt-1 text-[12px] font-semibold text-gray-400">{tl("app_subtitle")}</p>
        </div>

        {/* Ошибка */}
        {serverError && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-50 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" aria-hidden="true" />
            <p className="text-[13px] font-semibold text-red-700">{serverError}</p>
          </div>
        )}

        {/* ── Шаг 1: логин ── */}
        {step === "login" && (
          <>
            {/* Социальные кнопки */}
            <div className="mb-5">
              <SocialButtons />
            </div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-gray-200" />
              <span className="text-[12px] font-semibold text-gray-400">{tl("or_phone")}</span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Телефон */}
            <div className="mb-4 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {tl("phone_label")}
              </span>
              <div className="flex gap-2">
                <div className="flex h-11 w-[52px] flex-shrink-0 items-center justify-center rounded-xl border-[1.5px] border-gray-200 text-[20px]">
                  🇰🇬
                </div>
                <PhoneInput
                  id="phone"
                  value={phone}
                  onValueChange={(full) => { setPhone(full); setServerError(null); }}
                  invalid={false}
                  className="flex-1"
                  placeholder="700 123 456"
                  onKeyDown={(e) => { if (e.key === "Enter" && FULL_PHONE_RE.test(phone)) passwordRef.current?.focus(); }}
                />
              </div>
            </div>

            {/* Пароль */}
            <div className="mb-5 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {tl("password_label")}
              </span>
              <div className="relative">
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setServerError(null); }}
                  onKeyDown={(e) => { if (e.key === "Enter" && canSubmitLogin) loginMutation.mutate(); }}
                  placeholder={tl("password_placeholder")}
                  className={cn(
                    "h-11 w-full rounded-xl border-[1.5px] bg-gray-50 px-3 pr-10 text-[14px] font-semibold outline-none transition-colors",
                    serverError
                      ? "border-red-400 text-red-700"
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

            {/* Кнопка войти */}
            <button
              type="button"
              disabled={!canSubmitLogin || loginMutation.isPending}
              onClick={() => loginMutation.mutate()}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-amber-500 text-[14px] font-bold text-[#4A2C00] transition-colors hover:bg-amber-600 disabled:opacity-40"
            >
              {loginMutation.isPending ? tl("logging_in") : tl("login_btn")}
            </button>

            {/* Забыл пароль + регистрация */}
            <div className="mt-4 flex flex-col items-center gap-3">
              <button
                type="button"
                disabled={sendOtpMutation.isPending}
                onClick={handleForgot}
                className="text-[13px] font-semibold text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                {sendOtpMutation.isPending ? tl("sending") : tl("forgot_password")}
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

        {/* ── Шаг 2: OTP ── */}
        {step === "otp" && (
          <OtpStep
            tl={tl}
            displayPhone={displayPhone}
            digits={digits}
            otp={otp}
            serverError={serverError}
            verifyMutation={verifyMutation}
            sendMutation={sendOtpMutation}
            resendSeconds={resendSeconds}
            digitRefs={digitRefs}
            onDigitChange={handleDigitChange}
            onDigitKeyDown={handleDigitKeyDown}
            onBack={() => { setStep("login"); setDigits(["", "", "", "", "", ""]); setServerError(null); }}
            onResend={() => {
              if (resendSeconds > 0) return;
              setDigits(["", "", "", "", "", ""]);
              setServerError(null);
              sendOtpMutation.mutate();
            }}
          />
        )}

        {/* ── Шаг 3: новый пароль ── */}
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
