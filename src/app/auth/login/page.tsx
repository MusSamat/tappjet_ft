"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, AlertTriangle } from "lucide-react";
import {
  loginWithPassword,
  resetPassword,
  initTelegramLink,
  sendTelegramOtp,
  verifyOtp,
} from "@/lib/api/auth";
import { extractError } from "@/lib/api/client";
import { friendlyError } from "@/lib/utils/api-error";
import { consumeDeferredAction, routeForIntent } from "@/lib/auth/deferred-action";
import { useAuth } from "@/store/auth";
import { useTranslations } from "next-intl";
import { PhoneInput, Spinner, type OtpInputHandle } from "@/components/ui";
import { OtpStep } from "./_steps/otp-step";
import { ResetStep } from "./_steps/reset-step";
import { cn } from "@/lib/utils/cn";
import { SocialButtons } from "@/components/features/auth/social-buttons";

type Step = "login" | "otp" | "reset";

const FULL_PHONE_RE = /^\+996\d{9}$/;

/** Teal-gradient tile with white paper-plane + amber dot (spec §2.10 logo tile). */
function AuthLogo() {
  return (
    <span
      className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl shadow-brandcta"
      style={{ background: "linear-gradient(135deg,#14B8A6,#0D9488)" }}
    >
      <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden="true">
        <path d="M11 27 L37 15 L27 37 L23.5 28.5 Z" fill="#fff" />
        <path d="M23.5 28.5 L37 15 L26 27.5 Z" fill="#fff" opacity="0.62" />
        <circle cx="37.5" cy="13.5" r="4" fill="#FBB924" stroke="#fff" strokeWidth="1.5" />
      </svg>
    </span>
  );
}

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
  const [otp, setOtp] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = useState(0);

  const passwordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<OtpInputHandle>(null);

  const displayPhone = phone.replace(/^\+996/, "");
  const canSubmitLogin = FULL_PHONE_RE.test(phone) && password.length > 0;
  const canReset = newPassword.length >= 8 && newPassword === confirmPassword;

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setInterval(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendSeconds]);

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
    onSuccess: ({ deepLink }) => {
      setServerError(null);
      // Opening the deep-link triggers the bot's /start → auto-sends the OTP.
      window.open(deepLink, "_blank", "noopener,noreferrer");
      setResendSeconds(60);
      setOtp("");
      setStep("otp");
      setTimeout(() => otpRef.current?.focus(), 100);
    },
    onError: (e) => setServerError(friendlyError(extractError(e))),
  });

  // Auto-send: DM the code straight to the user's Telegram (no "open bot").
  // Falls back to the deep-link flow if the bot can't DM (not linked / not started).
  const tgAutoMutation = useMutation({
    mutationFn: () => sendTelegramOtp(phone),
    onSuccess: () => {
      setServerError(null);
      setResendSeconds(60);
      setOtp("");
      setStep("otp");
      setTimeout(() => otpRef.current?.focus(), 100);
    },
    onError: () => { forgotMutation.mutate(); },
  });

  const handleForgot = () => {
    if (!FULL_PHONE_RE.test(phone)) {
      setServerError(tl("enter_phone_first"));
      return;
    }
    setServerError(null);
    tgAutoMutation.mutate();
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
      setOtp("");
      otpRef.current?.clear();
    },
  });

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
    <div className="flex min-h-[calc(100vh-64px)] flex-col bg-white dark:bg-ink-950">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 pb-2 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label={tl("back_btn")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-ink-700 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-200"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="text-[15px] font-900 text-ink-900 dark:text-white">{tl("login_btn")}</span>
      </div>

      <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center px-6 pb-10">
        <div className="mb-7 text-center">
          <AuthLogo />
          <h1 className="text-[18px] font-900 text-ink-900 dark:text-white">Tappjet</h1>
          <p className="mt-1 text-[13px] font-700 text-ink-400">{tl("password_label")}</p>
        </div>

        {/* Error banner */}
        {serverError && (
          <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-coral-50 px-4 py-3 dark:bg-coral-500/10">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-coral-500" aria-hidden />
            <p className="text-[13px] font-800 text-coral-600">{serverError}</p>
          </div>
        )}

        {/* ── Step: main login ── */}
        {step === "login" && (
          <>
            <SocialButtons />

            <div className="my-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
              <span className="text-[11px] font-800 text-ink-400">{tl("or_phone")}</span>
              <span className="h-px flex-1 bg-ink-200 dark:bg-ink-700" />
            </div>

            {/* Phone */}
            <div className="mb-3">
              <PhoneInput
                value={phone}
                onValueChange={(v) => { setPhone(v); setServerError(null); }}
                invalid={false}
                placeholder="700 123 456"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && FULL_PHONE_RE.test(phone)) passwordRef.current?.focus();
                }}
              />
            </div>

            {/* Password */}
            <div className="mb-5">
              <div className="relative">
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setServerError(null); }}
                  onKeyDown={(e) => { if (e.key === "Enter" && canSubmitLogin) loginMutation.mutate(); }}
                  placeholder={tl("password_placeholder")}
                  className={cn(
                    "h-12 w-full rounded-2xl border-2 bg-ink-50 px-4 pr-10 text-[15px] font-800 outline-none transition-colors dark:bg-ink-800 dark:text-white",
                    serverError
                      ? "border-coral-300 text-coral-700"
                      : "border-ink-200 text-ink-900 focus:border-brand-500 dark:border-ink-700",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                  tabIndex={-1}
                  aria-label={showPassword ? tl("password_hide") : tl("password_show")}
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
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent-500 text-[15px] font-900 text-accent-ink shadow-cta transition-colors hover:bg-accent-400 disabled:opacity-40"
            >
              {loginMutation.isPending ? <><Spinner size={16} />{tl("logging_in")}</> : tl("login_btn")}
            </button>

            {/* Forgot + Register */}
            <div className="mt-5 flex flex-col items-center gap-3">
              <button
                type="button"
                disabled={tgAutoMutation.isPending || forgotMutation.isPending}
                onClick={handleForgot}
                className="flex items-center gap-1.5 text-[13px] font-700 text-ink-500 hover:text-brand-600 disabled:opacity-50"
              >
                {(tgAutoMutation.isPending || forgotMutation.isPending) && <Spinner size={13} />}
                {tgAutoMutation.isPending || forgotMutation.isPending ? tl("sending") : tl("forgot_password")}
              </button>
              <p className="text-[12px] font-700 text-ink-400">
                {tl("no_account")}{" "}
                <Link href="/auth/register" className="font-900 text-brand-700 dark:text-brand-300">
                  {tl("register_link")}
                </Link>
              </p>
            </div>
          </>
        )}

        {/* ── Step: OTP input ── */}
        {step === "otp" && (
          <OtpStep
            tl={tl}
            displayPhone={displayPhone}
            otp={otp}
            otpRef={otpRef}
            serverError={serverError}
            verifyMutation={verifyMutation}
            sendMutation={forgotMutation}
            resendSeconds={resendSeconds}
            onChange={(code) => { setOtp(code); setServerError(null); }}
            onComplete={() => verifyMutation.mutate()}
            onBack={() => { setStep("login"); setOtp(""); otpRef.current?.clear(); setServerError(null); }}
            onResend={() => {
              if (resendSeconds > 0) return;
              setOtp("");
              otpRef.current?.clear();
              setServerError(null);
              tgAutoMutation.mutate();
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
