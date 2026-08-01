"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ArrowLeft, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { register, sendTelegramOtp } from "@/lib/api/auth";
import { extractError } from "@/lib/api/client";
import { useFriendlyError } from "@/lib/hooks/use-api-error";
import { consumeDeferredAction, routeForIntent } from "@/lib/auth/deferred-action";
import { useAuth } from "@/store/auth";
import {
  LogoMark,
  Wordmark,
  PhoneInput,
  OtpInput,
  Spinner,
  type OtpInputHandle,
} from "@/components/ui";
import { cn } from "@/lib/utils/cn";

type Step = "phone" | "details";

const FULL_PHONE_RE = /^\+996\d{9}$/;

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const fe = useFriendlyError();
  const router = useRouter();
  const setSession = useAuth((s) => s.setSession);
  const status = useAuth((s) => s.status);

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = useState(0);

  const otpRef = useRef<OtpInputHandle>(null);

  const displayPhone = phone.replace(/^\+996/, "");
  const canSubmit =
    otp.length === 6 && name.trim().length > 0 && surname.trim().length > 0 && password.length >= 8;

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const id = setInterval(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [resendSeconds]);

  // Already authenticated → nothing to register.
  useEffect(() => {
    if (status === "authenticated" && step === "phone") {
      const intent = consumeDeferredAction();
      router.replace(intent ? routeForIntent(intent) : "/");
    }
  }, [status, step, router]);

  const goHome = () => {
    const intent = consumeDeferredAction();
    router.replace(intent ? routeForIntent(intent) : "/");
  };

  // ── Send the Telegram OTP (Dexatel) to the phone ───────────────────────
  const sendOtpMutation = useMutation({
    mutationFn: () => sendTelegramOtp(phone),
    onSuccess: () => {
      setServerError(null);
      setResendSeconds(60);
      setOtp("");
      otpRef.current?.clear();
      setStep("details");
      setTimeout(() => otpRef.current?.focus(), 100);
    },
    onError: (e) => setServerError(fe(extractError(e))),
  });

  // ── Create the account ─────────────────────────────────────────────────
  const registerMutation = useMutation({
    mutationFn: () =>
      register({ phone, code: otp, name: name.trim(), surname: surname.trim(), password }),
    onSuccess: (result) => {
      setSession(result);
      goHome();
    },
    onError: (e) => {
      setServerError(fe(extractError(e)));
      setOtp("");
      otpRef.current?.clear();
    },
  });

  const handleSendCode = () => {
    if (!FULL_PHONE_RE.test(phone)) {
      setServerError(t("err_phone_invalid"));
      return;
    }
    setServerError(null);
    sendOtpMutation.mutate();
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col bg-white dark:bg-ink-950">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 pb-2 pt-6">
        <button
          type="button"
          onClick={() => (step === "details" ? setStep("phone") : router.back())}
          aria-label={t("back_btn")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-ink-700 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-200"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="text-[16px] font-900 text-ink-900 dark:text-white">{t("title")}</span>
      </div>

      <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center px-6 pb-10">
        <div className="mb-7 text-center">
          <LogoMark className="mx-auto mb-4 h-16 w-16 rounded-3xl shadow-brandcta" />
          <h1><Wordmark className="text-[20px]" /></h1>
          <p className="mt-1 text-[15px] font-700 text-ink-400">
            {step === "phone" ? t("phone_hint") : t("details_hint")}
          </p>
        </div>

        {serverError && (
          <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-coral-50 px-4 py-3 dark:bg-coral-500/10">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-coral-500" aria-hidden />
            <p className="text-[14px] font-800 text-coral-600">{serverError}</p>
          </div>
        )}

        {/* ── Step 1: phone ── */}
        {step === "phone" && (
          <>
            <div className="mb-5">
              <PhoneInput
                value={phone}
                onValueChange={(v) => { setPhone(v); setServerError(null); }}
                invalid={false}
                placeholder="700 123 456"
                onKeyDown={(e) => { if (e.key === "Enter" && FULL_PHONE_RE.test(phone)) handleSendCode(); }}
              />
            </div>

            <button
              type="button"
              disabled={!FULL_PHONE_RE.test(phone) || sendOtpMutation.isPending || resendSeconds > 0}
              onClick={handleSendCode}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent-500 text-[16px] font-900 text-accent-ink shadow-cta transition-colors hover:bg-accent-400 disabled:opacity-40"
            >
              {sendOtpMutation.isPending
                ? <><Spinner size={16} />{t("sending")}</>
                : resendSeconds > 0
                  ? t("resend_in", { n: resendSeconds })
                  : t("send_code_btn")}
            </button>

            <p className="mt-5 text-center text-[14px] font-700 text-ink-400">
              {t("have_account")}{" "}
              <Link href="/auth/login" className="font-900 text-brand-700 dark:text-brand-300">
                {t("sign_in")}
              </Link>
            </p>
          </>
        )}

        {/* ── Step 2: code + profile + password ── */}
        {step === "details" && (
          <>
            <p className="mb-2 text-center text-[15px] font-600 text-brand-700 dark:text-brand-300">
              {t("otp_dm_hint")}
            </p>
            <p className="mb-4 text-center text-[16px] font-800 text-ink-900 dark:text-white">
              +996 {displayPhone}
            </p>

            <div className="mb-4 flex justify-center">
              <OtpInput
                ref={otpRef}
                length={6}
                onChange={(code) => { setOtp(code); setServerError(null); }}
                invalid={!!serverError}
              />
            </div>

            {/* Resend */}
            <div className="mb-5 text-center">
              {resendSeconds > 0 ? (
                <p className="text-[13px] text-ink-400">{t("resend_in", { n: resendSeconds })}</p>
              ) : (
                <button
                  type="button"
                  onClick={() => sendOtpMutation.mutate()}
                  disabled={sendOtpMutation.isPending}
                  className="text-[14px] font-700 text-brand-600 hover:text-brand-700 dark:text-brand-300"
                >
                  {sendOtpMutation.isPending ? t("sending") : t("resend_btn")}
                </button>
              )}
            </div>

            {/* Name + surname */}
            <div className="mb-3 grid grid-cols-2 gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setServerError(null); }}
                placeholder={t("name_label")}
                autoComplete="given-name"
                className="h-12 w-full rounded-2xl border-2 border-ink-200 bg-ink-50 px-4 text-[16px] font-800 text-ink-900 outline-none transition-colors focus:border-brand-500 dark:border-ink-700 dark:bg-ink-800 dark:text-white"
              />
              <input
                type="text"
                value={surname}
                onChange={(e) => { setSurname(e.target.value); setServerError(null); }}
                placeholder={t("surname_label")}
                autoComplete="family-name"
                className="h-12 w-full rounded-2xl border-2 border-ink-200 bg-ink-50 px-4 text-[16px] font-800 text-ink-900 outline-none transition-colors focus:border-brand-500 dark:border-ink-700 dark:bg-ink-800 dark:text-white"
              />
            </div>

            {/* Password */}
            <div className="mb-5">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setServerError(null); }}
                  onKeyDown={(e) => { if (e.key === "Enter" && canSubmit) registerMutation.mutate(); }}
                  placeholder={t("password_placeholder")}
                  autoComplete="new-password"
                  className="h-12 w-full rounded-2xl border-2 border-ink-200 bg-ink-50 px-4 pr-10 text-[16px] font-800 text-ink-900 outline-none transition-colors focus:border-brand-500 dark:border-ink-700 dark:bg-ink-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                  tabIndex={-1}
                  aria-label={showPassword ? t("password_hide") : t("password_show")}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className={cn("mt-1.5 text-[12px] font-600", password.length > 0 && password.length < 8 ? "text-coral-500" : "text-ink-400")}>
                {t("password_rule")}
              </p>
            </div>

            {/* Submit */}
            <button
              type="button"
              disabled={!canSubmit || registerMutation.isPending}
              onClick={() => registerMutation.mutate()}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent-500 text-[16px] font-900 text-accent-ink shadow-cta transition-colors hover:bg-accent-400 disabled:opacity-40"
            >
              {registerMutation.isPending ? <><Spinner size={16} />{t("creating")}</> : t("create_btn")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
