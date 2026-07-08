"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { extractError } from "@/lib/api/client";
import { consumeDeferredAction, routeForIntent } from "@/lib/auth/deferred-action";
import { useAuth } from "@/store/auth";
import { LogoMark, NotifCard, ProgressBar } from "@/components/ui";
import { SocialButtons } from "@/components/features/auth/social-buttons";
import { AUTH_TELEGRAM_ONLY } from "@/lib/auth/telegram-only";
import { PhoneStep } from "./_steps/phone-step";
import { TelegramStep } from "./_steps/telegram-step";
import { ProfileStep } from "./_steps/profile-step";
import { PasswordStep } from "./_steps/password-step";
import { RoutePickerStep } from "./_steps/route-picker-step";
import type { verifyOtp } from "@/lib/api/auth";

type Step = "phone" | "telegram" | "profile" | "password" | "routes";

const STEP_ORDER: Step[] = ["phone", "telegram", "profile", "password", "routes"];

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const { setSession, updateUser } = useAuth();
  const status = useAuth((s) => s.status);
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const stepIdx = STEP_ORDER.indexOf(step);

  // Already authenticated (e.g. Telegram Mini App silent login) → skip the whole
  // phone/OTP dance. Only fires on the untouched first step, never mid-flow.
  useEffect(() => {
    if (status === "authenticated" && step === "phone") {
      const intent = consumeDeferredAction();
      router.replace(intent ? routeForIntent(intent) : "/");
    }
  }, [status, step, router]);

  const STEP_TITLES: Record<Step, string> = {
    phone: t("step_phone"),
    telegram: t("step_telegram"),
    profile: t("step_profile"),
    password: t("step_password"),
    routes: t("step_routes"),
  };

  const handleError = (e: unknown) => {
    const err = extractError(e);
    const known: Record<string, string> = {
      OTP_WRONG: t("err_otp_wrong"),
      OTP_EXPIRED: t("err_otp_expired"),
      OTP_TOO_MANY_ATTEMPTS: t("err_otp_attempts"),
      RATE_LIMITED: t("err_rate_limited"),
      CONFLICT: t("err_conflict"),
      TELEGRAM_LINK_EXPIRED: t("err_telegram_expired"),
    };
    setServerError(known[err.code] ?? err.message);
  };

  // Telegram-only testing period: registration happens through the same Telegram
  // flow as login (the bot's request_contact gives us the verified number).
  // The legacy phone/OTP multi-step flow below is kept but not reachable.
  if (AUTH_TELEGRAM_ONLY) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] flex-col bg-white dark:bg-ink-950">
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center px-6 py-10">
          <div className="mb-6 text-center">
            <LogoMark className="mx-auto mb-4 h-16 w-16 rounded-3xl shadow-brandcta" />
            <h1 className="text-[22px] font-900 text-ink-900 dark:text-white">{t("title")}</h1>
            <p className="mt-1 text-[15px] font-600 text-ink-400">{t("telegram_only_hint")}</p>
          </div>
          <SocialButtons />
          <p className="mt-5 text-center text-[14px] font-700 text-ink-400">
            {t("have_account")}{" "}
            <Link href="/auth/login" className="font-900 text-brand-700 dark:text-brand-300">
              {t("sign_in")}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (step === "routes") {
    return (
      <div className="flex min-h-[calc(100vh-64px)] flex-col bg-white dark:bg-ink-950">
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center px-6 py-10">
          <RoutePickerStep />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col bg-white dark:bg-ink-950">
      <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center px-6 py-10">
        <div className="mb-5 text-center">
          <LogoMark className="mx-auto mb-4 h-16 w-16 rounded-3xl shadow-brandcta" />
          <h1 className="text-[22px] font-900 text-ink-900 dark:text-white">{t("title")}</h1>
          <p className="mt-1 text-[15px] font-600 text-ink-400">
            {t("have_account")}{" "}
            <Link href="/auth/login" className="font-800 text-brand-700 hover:text-brand-800 dark:text-brand-300">
              {t("sign_in")}
            </Link>
          </p>
        </div>

        <div className="mt-2">
          <ProgressBar
            value={stepIdx + 1}
            max={STEP_ORDER.length - 1}
            label={t("step_label", { step: stepIdx + 1, total: STEP_ORDER.length - 1, title: STEP_TITLES[step] })}
          />
        </div>

        {serverError && (
          <div className="mt-5">
            <NotifCard variant="error" title={t("error_title")}>{serverError}</NotifCard>
          </div>
        )}

        <div className="mt-6">
          {step === "phone" && (
            <PhoneStep
              phone={phone}
              onPhone={setPhone}
              onNext={() => {
                setServerError(null);
                setStep("telegram");
              }}
            />
          )}
          {step === "telegram" && (
            <TelegramStep
              phone={phone}
              onVerified={(result: Awaited<ReturnType<typeof verifyOtp>>) => {
                setSession(result);
                setServerError(null);
                setStep("profile");
              }}
              onBack={() => { setServerError(null); setStep("phone"); }}
              onError={handleError}
            />
          )}
          {step === "profile" && (
            <ProfileStep
              onSaved={(patch) => { updateUser(patch); setServerError(null); setStep("password"); }}
              onError={handleError}
            />
          )}
          {step === "password" && (
            <PasswordStep
              onDone={() => {
                setServerError(null);
                const intent = consumeDeferredAction();
                if (intent) router.replace(routeForIntent(intent));
                else setStep("routes");
              }}
              onSkip={() => {
                const intent = consumeDeferredAction();
                if (intent) router.replace(routeForIntent(intent));
                else setStep("routes");
              }}
              onError={handleError}
            />
          )}
        </div>
      </div>
    </div>
  );
}
