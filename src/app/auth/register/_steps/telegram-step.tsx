"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
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

type Phase = "waiting" | "sent";

export function TelegramStep({ phone, token, deepLink, onVerified, onBack, onError }: Props) {
  const t = useTranslations("auth.register");
  const otpRef = useRef<OtpInputHandle>(null);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [code, setCode] = useState("");

  const statusQuery = useQuery({
    queryKey: ["telegram-link-status", token],
    queryFn: () => getTelegramLinkStatus(token),
    refetchInterval: (q) => {
      const s = q.state.data?.status;
      return s === "waiting" ? 2000 : false;
    },
    enabled: phase === "waiting",
  });

  useEffect(() => {
    if (statusQuery.data?.status === "sent") setPhase("sent");
    if (statusQuery.data?.status === "expired") onError(new Error("TELEGRAM_LINK_EXPIRED"));
  }, [statusQuery.data?.status, onError]);

  const verifyMutation = useMutation({
    mutationFn: (c: string) => verifyOtp(phone, c),
    onSuccess: onVerified,
    onError: (e) => { otpRef.current?.clear(); onError(e); },
  });

  if (phase === "waiting") {
    return (
      <div className="flex flex-col gap-5 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-100">
          <span className="text-[40px] leading-none">✈️</span>
        </div>

        <div>
          <p className="text-[17px] font-extrabold text-ink-900">{t("telegram_title")}</p>
          <p className="mt-1.5 text-[13px] font-semibold leading-relaxed text-ink-500">{t("telegram_hint")}</p>
        </div>

        {/* progress pulse */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
          <div className="h-full w-3/5 animate-pulse rounded-full bg-[#0088cc]" />
        </div>

        <a href={deepLink} target="_blank" rel="noopener noreferrer">
          <button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0088cc] text-[15px] font-extrabold text-white transition-opacity hover:opacity-90"
          >
            <Send className="h-5 w-5" aria-hidden="true" />
            {t("telegram_open_btn")}
          </button>
        </a>

        <div className="flex items-center justify-center gap-2 text-[13px] font-semibold text-ink-400">
          <Spinner size={14} />
          <span>{t("telegram_waiting")}</span>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="text-center text-[13px] font-bold text-ink-400 hover:text-ink-600"
        >
          {t("change")}
        </button>
      </div>
    );
  }

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
      <p className="text-[14px] font-semibold leading-relaxed text-ink-600">
        {t("telegram_otp_prompt")}{" "}
        <span className="font-extrabold text-ink-900">{phone}</span>.{" "}
        <button type="button" onClick={onBack} className="font-extrabold text-brand-700 hover:text-brand-800">
          {t("change")}
        </button>
      </p>

      <OtpInput
        ref={otpRef}
        length={6}
        autoFocus
        invalid={verifyMutation.isError}
        disabled={verifyMutation.isPending}
        onChange={setCode}
        onComplete={(c) => verifyMutation.mutate(c)}
      />

      <div className="flex items-center justify-end">
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
