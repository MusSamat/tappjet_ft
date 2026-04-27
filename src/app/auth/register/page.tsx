"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { extractError } from "@/lib/api/client";
import { consumeDeferredAction, routeForIntent } from "@/lib/auth/deferred-action";
import { useAuth } from "@/store/auth";
import { NotifCard, ProgressBar } from "@/components/ui";
import { PhoneStep } from "./_steps/phone-step";
import { OtpStep } from "./_steps/otp-step";
import { ProfileStep } from "./_steps/profile-step";
import { PasswordStep } from "./_steps/password-step";
import { RoutePickerStep } from "./_steps/route-picker-step";
import type { verifyOtp } from "@/lib/api/auth";

type Step = "phone" | "otp" | "profile" | "password" | "routes";

const STEP_ORDER: Step[] = ["phone", "otp", "profile", "password", "routes"];

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const { setSession, updateUser } = useAuth();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const stepIdx = STEP_ORDER.indexOf(step);

  const STEP_TITLES: Record<Step, string> = {
    phone: t("step_phone"),
    otp: t("step_otp"),
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
    };
    setServerError(known[err.code] ?? err.message);
  };

  if (step === "routes") {
    return (
      <div className="container flex justify-center py-10">
        <div className="w-full max-w-md">
          <RoutePickerStep />
        </div>
      </div>
    );
  }

  return (
    <div className="container flex justify-center py-10">
      <div className="w-full max-w-md">
        <h1 className="text-display text-gray-900">{t("title")}</h1>
        <p className="mt-2 text-body-lg text-gray-700">
          {t("have_account")}{" "}
          <Link href="/auth/login" className="font-bold text-teal-700 hover:text-teal-800">
            {t("sign_in")}
          </Link>
        </p>

        <div className="mt-6">
          <ProgressBar
            value={stepIdx + 1}
            max={STEP_ORDER.length - 1}
            label={t("step_label", { step: stepIdx + 1, total: STEP_ORDER.length - 1, title: STEP_TITLES[step] })}
          />
        </div>

        {serverError && (
          <div className="mt-6">
            <NotifCard variant="error" title={t("error_title")}>{serverError}</NotifCard>
          </div>
        )}

        <div className="mt-6">
          {step === "phone" && (
            <PhoneStep
              phone={phone}
              onPhone={setPhone}
              onNext={() => { setServerError(null); setStep("otp"); }}
              onError={handleError}
            />
          )}
          {step === "otp" && (
            <OtpStep
              phone={phone}
              onBack={() => setStep("phone")}
              onVerified={(result: Awaited<ReturnType<typeof verifyOtp>>) => {
                setSession(result);
                setServerError(null);
                setStep("profile");
              }}
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
