"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { checkPhone, sendTelegramOtp, verifyOtp, loginWithPassword, resetPassword } from "@/lib/api/auth";
import { extractError } from "@/lib/api/client";
import { friendlyError } from "@/lib/utils/api-error";
import { consumeDeferredAction, routeForIntent } from "@/lib/auth/deferred-action";
import { useAuth } from "@/store/auth";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { PhoneStep } from "./_steps/phone-step";
import { PasswordStep } from "./_steps/password-step";
import { OtpStep } from "./_steps/otp-step";
import { ResetStep } from "./_steps/reset-step";

type Step = "phone" | "password" | "otp" | "reset";

export default function LoginPage() {
  const tl = useTranslations("auth.login");
  const router = useRouter();
  const setSession = useAuth((s) => s.setSession);

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [forgotMode, setForgotMode] = useState(false);
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

  const checkPhoneMutation = useMutation({
    mutationFn: () => checkPhone(phone),
    onSuccess: (result) => {
      setServerError(null);
      if (!result.exists) {
        router.push("/auth/register");
        return;
      }
      if (result.hasPassword) {
        setStep("password");
        setTimeout(() => passwordRef.current?.focus(), 100);
      } else {
        // No password set — go straight to Telegram OTP
        setForgotMode(false);
        sendMutation.mutate();
      }
    },
    onError: (e) => setServerError(friendlyError(extractError(e))),
  });

  const sendMutation = useMutation({
    mutationFn: () => sendTelegramOtp(phone),
    onSuccess: (r) => {
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

  const passwordMutation = useMutation({
    mutationFn: () => loginWithPassword(phone, password),
    onSuccess: (result) => {
      setSession(result);
      const intent = consumeDeferredAction();
      router.replace(intent ? routeForIntent(intent) : "/");
    },
    onError: (e) => setServerError(friendlyError(extractError(e))),
  });

  const verifyMutation = useMutation({
    mutationFn: () => verifyOtp(phone, otp),
    onSuccess: (result) => {
      setSession(result);
      if (forgotMode) {
        setStep("reset");
        setTimeout(() => newPasswordRef.current?.focus(), 100);
      } else {
        const intent = consumeDeferredAction();
        router.replace(intent ? routeForIntent(intent) : "/");
      }
    },
    onError: (e) => {
      setServerError(friendlyError(extractError(e)));
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => digitRefs[0]?.current?.focus(), 50);
      const retryAfter = parseRetryAfter(e);
      if (retryAfter) setResendSeconds(retryAfter);
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => resetPassword(newPassword),
    onSuccess: () => {
      const intent = consumeDeferredAction();
      router.replace(intent ? routeForIntent(intent) : "/");
    },
    onError: (e) => setServerError(friendlyError(extractError(e))),
  });

  const handleDigitChange = (idx: number, val: string) => {
    const cleaned = val.replace(/\D/g, "");
    setServerError(null);
    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, 6).split("");
      const next = ["", "", "", "", "", ""];
      pasted.forEach((d, i) => { if (i < 6) next[i] = d; });
      setDigits(next);
      const lastFilled = Math.min(pasted.length - 1, 5);
      digitRefs[lastFilled]?.current?.focus();
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
    if (e.key === "Backspace") {
      if (digits[idx]) {
        const next = [...digits]; next[idx] = ""; setDigits(next);
      } else if (idx > 0) {
        digitRefs[idx - 1]?.current?.focus();
        const next = [...digits]; next[idx - 1] = ""; setDigits(next);
      }
    }
  };

  const handleResend = () => {
    if (resendSeconds > 0) return;
    setDigits(["", "", "", "", "", ""]);
    setServerError(null);
    sendMutation.mutate();
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-5 py-8 md:min-h-[calc(100vh-64px)]"
      style={{ background: "linear-gradient(180deg, #F9FAFB, white)" }}
    >
      <div className="w-full max-w-[440px] rounded-[20px] border-[0.5px] border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[16px] bg-gradient-to-br from-teal-600 to-teal-500">
            <span className="text-[22px] font-black text-white">Tj</span>
          </div>
          <h1 className="text-[24px] font-bold leading-tight tracking-tight text-gray-900">
            {tl("app_title")}
          </h1>
          <p className="mt-1 text-[12px] font-semibold text-gray-400">{tl("app_subtitle")}</p>
        </div>

        {serverError && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-50 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" aria-hidden="true" />
            <p className="text-[13px] font-semibold text-red-700">{serverError}</p>
          </div>
        )}

        {step === "phone" && (
          <PhoneStep
            tl={tl}
            phone={phone}
            setPhone={setPhone}
            setServerError={setServerError}
            isPending={checkPhoneMutation.isPending}
            onContinue={() => {
              setServerError(null);
              setForgotMode(false);
              setPassword("");
              checkPhoneMutation.mutate();
            }}
          />
        )}

        {step === "password" && (
          <PasswordStep
            tl={tl}
            displayPhone={displayPhone}
            password={password}
            setPassword={setPassword}
            serverError={serverError}
            setServerError={setServerError}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            passwordRef={passwordRef}
            passwordMutation={passwordMutation}
            sendMutation={sendMutation}
            forgotMode={forgotMode}
            onBack={() => { setStep("phone"); setPassword(""); setServerError(null); }}
            onLoginBySms={() => { setForgotMode(false); setServerError(null); sendMutation.mutate(); }}
            onForgotPassword={() => { setForgotMode(true); setServerError(null); sendMutation.mutate(); }}
          />
        )}

        {step === "otp" && (
          <OtpStep
            tl={tl}
            displayPhone={displayPhone}
            forgotMode={forgotMode}
            digits={digits}
            otp={otp}
            serverError={serverError}
            verifyMutation={verifyMutation}
            sendMutation={sendMutation}
            resendSeconds={resendSeconds}
            digitRefs={digitRefs}
            onDigitChange={handleDigitChange}
            onDigitKeyDown={handleDigitKeyDown}
            onBack={() => { setStep("password"); setDigits(["", "", "", "", "", ""]); setServerError(null); }}
            onResend={handleResend}
          />
        )}

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
