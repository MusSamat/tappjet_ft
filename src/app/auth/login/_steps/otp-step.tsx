import React from "react";
import { cn } from "@/lib/utils/cn";
import type { useTranslations } from "next-intl";

interface Props {
  tl: ReturnType<typeof useTranslations<string>>;
  displayPhone: string;
  digits: string[];
  otp: string;
  serverError: string | null;
  verifyMutation: { isPending: boolean; mutate: () => void };
  sendMutation: { isPending: boolean };
  resendSeconds: number;
  digitRefs: React.RefObject<HTMLInputElement>[];
  onDigitChange: (idx: number, val: string) => void;
  onDigitKeyDown: (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onResend: () => void;
}

export function OtpStep({
  tl, displayPhone, digits, otp, serverError, verifyMutation,
  sendMutation, resendSeconds, digitRefs, onDigitChange, onDigitKeyDown,
  onBack, onResend,
}: Props) {
  return (
    <>
      <div className="mb-2 text-center">
        <p className="text-[14px] text-gray-600">{tl("otp_reset_sent")}</p>
        <p className="mt-1 text-[13px] font-semibold text-teal-700">{tl("otp_telegram_hint")}</p>
        <p className="mt-1 text-[17px] font-bold text-gray-900">+996 {displayPhone}</p>
      </div>

      <p className="mb-4 text-center text-[12px] font-semibold text-amber-700">
        {tl("otp_reset_hint")}
      </p>

      <div className="mb-5 flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {tl("otp_label")}
        </span>
        <div className="flex justify-center gap-3">
          {digits.map((d, idx) => (
            <input
              key={idx}
              ref={digitRefs[idx]}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={d}
              onChange={(e) => onDigitChange(idx, e.target.value)}
              onKeyDown={(e) => onDigitKeyDown(idx, e)}
              onFocus={(e) => e.target.select()}
              className={cn(
                "h-14 w-12 rounded-xl border-[1.5px] bg-gray-50 text-center text-[24px] font-extrabold outline-none transition-colors",
                serverError
                  ? "border-red-400 text-red-700"
                  : d
                    ? "border-teal-500 text-gray-900"
                    : "border-gray-200 text-gray-900 focus:border-teal-500",
              )}
              aria-label={tl("otp_digit", { n: idx + 1 })}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={digits.some((d) => !d) || otp.length < 6 || verifyMutation.isPending || resendSeconds > 0}
        onClick={() => verifyMutation.mutate()}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-amber-500 text-[14px] font-bold text-[#4A2C00] transition-colors hover:bg-amber-600 disabled:opacity-40"
      >
        {verifyMutation.isPending
          ? tl("verifying")
          : resendSeconds > 0
            ? tl("wait_seconds", { n: resendSeconds })
            : tl("confirm_btn")}
      </button>

      <div className="mt-4 flex flex-col items-center gap-2">
        <button type="button" onClick={onBack} className="text-[13px] font-bold text-gray-600 hover:text-gray-900">
          {tl("back_btn")}
        </button>
        {resendSeconds > 0 ? (
          <p className="text-[12px] text-gray-400">{tl("resend_in", { n: resendSeconds })}</p>
        ) : (
          <button
            type="button"
            onClick={onResend}
            disabled={sendMutation.isPending}
            className="text-[12px] font-bold text-teal-600 hover:text-teal-700"
          >
            {sendMutation.isPending ? tl("sending") : tl("resend_btn")}
          </button>
        )}
      </div>
    </>
  );
}
