"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { sendOtp, verifyOtp } from "@/lib/api/auth";
import { otpSchema } from "@/lib/validation/auth";
import { useCountdown } from "@/lib/hooks/use-countdown";
import { Button, OtpInput, type OtpInputHandle, Spinner } from "@/components/ui";

interface Props {
  phone: string;
  initialDebugCode?: string;
  onBack: () => void;
  onVerified: (result: Awaited<ReturnType<typeof verifyOtp>>) => void;
  onError: (e: unknown) => void;
}

export function OtpStep({ phone, initialDebugCode, onBack, onVerified, onError }: Props) {
  const t = useTranslations("auth.register");
  const otpRef = useRef<OtpInputHandle>(null);
  const [code, setCode] = useState("");
  const [debugCode, setDebugCode] = useState<string | undefined>(initialDebugCode);
  const { remaining, reset } = useCountdown(60);

  const verifyMutation = useMutation({
    mutationFn: (c: string) => verifyOtp(phone, c),
    onSuccess: onVerified,
    onError: (e) => { otpRef.current?.clear(); onError(e); },
  });

  const resendMutation = useMutation({
    mutationFn: () => sendOtp(phone),
    onSuccess: (r) => { reset(60); if (r.debug_code) setDebugCode(r.debug_code); },
    onError,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = otpSchema.safeParse(code);
        if (!parsed.success) return;
        verifyMutation.mutate(code);
      }}
      className="flex flex-col gap-5"
      noValidate
    >
      <p className="text-body-lg text-gray-700">
        {t("otp_sent_to")} <span className="font-bold text-gray-900">{phone}</span>.{" "}
        <button type="button" onClick={onBack} className="font-bold text-teal-700 hover:text-teal-800">
          {t("change")}
        </button>
      </p>

      {debugCode && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-center">
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600">DEV — код</span>
          <p className="mt-0.5 font-mono text-[22px] font-black tracking-[0.2em] text-amber-700">{debugCode}</p>
        </div>
      )}

      <OtpInput
        ref={otpRef}
        length={6}
        autoFocus
        invalid={verifyMutation.isError}
        disabled={verifyMutation.isPending}
        onChange={setCode}
        onComplete={(c) => verifyMutation.mutate(c)}
      />

      <div className="flex items-center justify-between">
        {remaining > 0 ? (
          <span className="text-caption text-gray-500">{t("resend_after", { n: remaining })}</span>
        ) : (
          <button
            type="button"
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending}
            className="text-caption font-bold text-teal-700 hover:text-teal-800 disabled:opacity-50"
          >
            {resendMutation.isPending ? t("sending") : t("resend_btn")}
          </button>
        )}
        {verifyMutation.isPending && <Spinner size={16} />}
      </div>

      <Button
        type="submit"
        variant="submit"
        size="lg"
        disabled={verifyMutation.isPending || !otpSchema.safeParse(code).success}
      >
        {t("confirm")}
      </Button>
    </form>
  );
}
