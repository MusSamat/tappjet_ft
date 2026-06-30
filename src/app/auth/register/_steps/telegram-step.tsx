"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getTelegramLinkStatus, verifyOtp } from "@/lib/api/auth";
import { otpSchema } from "@/lib/validation/auth";
import { Button, OtpInput, Spinner, type OtpInputHandle } from "@/components/ui";
import type { AuthResult } from "@/lib/api/types";

interface Props {
  phone: string;
  token: string;
  deepLink: string;
  onVerified: (result: AuthResult) => void;
  onBack: () => void;
  onError: (e: unknown) => void;
}

export function TelegramStep({ phone, token, deepLink, onVerified, onBack, onError }: Props) {
  const t = useTranslations("auth.register");
  const otpRef = useRef<OtpInputHandle>(null);
  const [code, setCode] = useState("");
  const [resendIn, setResendIn] = useState(60);

  // Background poll only to catch an expired link — the OTP card shows immediately,
  // because opening the deep-link already triggered the bot to send the code.
  const statusQuery = useQuery({
    queryKey: ["telegram-link-status", token],
    queryFn: () => getTelegramLinkStatus(token),
    refetchInterval: (q) => (q.state.data?.status === "waiting" ? 2000 : false),
  });

  useEffect(() => {
    if (statusQuery.data?.status === "expired") onError(new Error("TELEGRAM_LINK_EXPIRED"));
  }, [statusQuery.data?.status, onError]);

  useEffect(() => {
    const id = setInterval(() => {
      setResendIn((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handleResend = () => {
    // Re-open the deep-link → bot re-sends the code.
    if (deepLink) window.open(deepLink, "_blank", "noopener,noreferrer");
    statusQuery.refetch();
    setResendIn(60);
  };

  const verifyMutation = useMutation({
    mutationFn: (c: string) => verifyOtp(phone, c),
    onSuccess: onVerified,
    onError: (e) => { otpRef.current?.clear(); onError(e); },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = otpSchema.safeParse(code);
        if (!parsed.success) return;
        verifyMutation.mutate(code);
      }}
      className="flex flex-col gap-5 text-center"
      noValidate
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
        <span className="text-[34px] leading-none">✈️</span>
      </div>

      <div>
        <p className="text-[20px] font-900 text-ink-900">{t("telegram_title")}</p>
        <p className="mt-1.5 text-[13px] font-700 leading-relaxed text-ink-500">
          {t("telegram_hint")} <span className="font-900 text-brand-700">@tappjet_bot</span>
        </p>
      </div>

      <OtpInput
        ref={otpRef}
        length={6}
        autoFocus
        invalid={verifyMutation.isError}
        disabled={verifyMutation.isPending}
        onChange={setCode}
        onComplete={(c) => verifyMutation.mutate(c)}
      />

      <Button
        type="submit"
        variant="submit"
        size="lg"
        disabled={verifyMutation.isPending || !otpSchema.safeParse(code).success}
      >
        {verifyMutation.isPending ? <Spinner size={16} /> : t("confirm")}
      </Button>

      {resendIn > 0 ? (
        <p className="text-[12px] font-700 text-ink-400">
          Отправить заново через{" "}
          <span className="font-900 text-ink-600">
            {Math.floor(resendIn / 60)}:{String(resendIn % 60).padStart(2, "0")}
          </span>
        </p>
      ) : (
        <button type="button" onClick={handleResend} className="text-[12px] font-900 text-brand-700">
          Отправить заново
        </button>
      )}

      <button
        type="button"
        onClick={onBack}
        className="text-[13px] font-700 text-ink-400 hover:text-ink-600"
      >
        {t("change")}
      </button>
    </form>
  );
}
