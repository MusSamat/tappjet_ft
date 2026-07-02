import React from "react";
import type { useTranslations } from "next-intl";
import { OtpInput, type OtpInputHandle } from "@/components/ui";

interface Props {
  tl: ReturnType<typeof useTranslations<string>>;
  displayPhone: string;
  otp: string;
  otpRef: React.RefObject<OtpInputHandle>;
  serverError: string | null;
  verifyMutation: { isPending: boolean; mutate: () => void };
  sendMutation: { isPending: boolean };
  resendSeconds: number;
  onChange: (code: string) => void;
  onComplete: () => void;
  onBack: () => void;
  onResend: () => void;
}

export function OtpStep({
  tl, displayPhone, otp, otpRef, serverError, verifyMutation,
  sendMutation, resendSeconds, onChange, onComplete, onBack, onResend,
}: Props) {
  return (
    <>
      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-500/15">
        <span className="text-[32px] leading-none">✈️</span>
      </div>
      <div className="mb-2 text-center">
        <p className="text-[17px] font-700 text-ink-600 dark:text-ink-300">{tl("otp_reset_sent")}</p>
        <p className="mt-1 text-[13px] font-600 text-brand-700 dark:text-brand-300">{tl("otp_telegram_hint")}</p>
        <p className="mt-1 text-[17px] font-700 text-ink-900 dark:text-white">+996 {displayPhone}</p>
      </div>

      <p className="mb-4 text-center text-[12px] font-600 text-accent-700">{tl("otp_reset_hint")}</p>

      <div className="mb-5 flex justify-center">
        <OtpInput
          ref={otpRef}
          length={6}
          onChange={onChange}
          onComplete={onComplete}
          invalid={!!serverError}
        />
      </div>

      <button
        type="button"
        disabled={otp.length < 6 || verifyMutation.isPending || resendSeconds > 0}
        onClick={() => verifyMutation.mutate()}
        className="flex h-12 w-full items-center justify-center rounded-2xl bg-accent-500 text-[15px] font-900 text-accent-ink shadow-cta transition-colors hover:bg-accent-400 disabled:opacity-40"
      >
        {verifyMutation.isPending
          ? tl("verifying")
          : resendSeconds > 0
            ? tl("wait_seconds", { n: resendSeconds })
            : tl("confirm_btn")}
      </button>

      <div className="mt-4 flex flex-col items-center gap-2">
        <button type="button" onClick={onBack} className="text-[13px] font-700 text-ink-600 hover:text-ink-900 dark:text-ink-300">
          {tl("back_btn")}
        </button>
        {resendSeconds > 0 ? (
          <p className="text-[12px] text-ink-400">{tl("resend_in", { n: resendSeconds })}</p>
        ) : (
          <button
            type="button"
            onClick={onResend}
            disabled={sendMutation.isPending}
            className="text-[12px] font-700 text-brand-600 hover:text-brand-700 dark:text-brand-300"
          >
            {sendMutation.isPending ? tl("sending") : tl("resend_btn")}
          </button>
        )}
      </div>
    </>
  );
}
