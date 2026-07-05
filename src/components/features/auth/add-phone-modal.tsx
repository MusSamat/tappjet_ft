"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Phone, Shield } from "lucide-react";
import {
  initTelegramLink,
  getTelegramLinkStatus,
  sendOtp,
  sendPhoneOtpTelegram,
  confirmPhoneAdd,
  confirmPhoneFromTelegram,
} from "@/lib/api/auth";
import { detectRuntime } from "@/lib/detect-runtime";
import { useAuth } from "@/store/auth";
import { extractError } from "@/lib/api/client";
import { openTelegramDeepLink } from "@/lib/utils/open-telegram";
import { useFriendlyError } from "@/lib/hooks/use-api-error";
import { Button, PhoneInput, Spinner } from "@/components/ui";
import { Modal, ModalContent, ModalHeader, ModalTitle } from "@/components/ui/modal";

type Step = "phone" | "tg-waiting" | "otp";

interface Props {
  open: boolean;
  onClose: () => void;
  onDone?: () => void;
}

export function AddPhoneModal({ open, onClose, onDone }: Props) {
  const t = useTranslations("auth.add_phone");
  const fe = useFriendlyError();
  const user = useAuth((s) => s.user);
  const setSession = useAuth((s) => s.setSession);

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!open) stopPoll();
    return stopPoll;
  }, [open, stopPoll]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep("phone");
      setPhone("");
      setDeepLink(null);
      setOtp("");
      setError(null);
      setLoading(false);
    }
  }, [open]);

  // Opens the bot deep-link and polls until the code is delivered. Used only as
  // a fallback when the bot cannot DM the user directly.
  const startDeepLinkFlow = async () => {
    const { token, deepLink: link } = await initTelegramLink(phone);
    setDeepLink(link);
    // Past an await → no gesture context; window.open is popup-blocked on mobile.
    openTelegramDeepLink(link);
    setStep("tg-waiting");
    pollRef.current = setInterval(async () => {
      try {
        const { status } = await getTelegramLinkStatus(token);
        if (status === "sent") {
          stopPoll();
          setStep("otp");
        } else if (status === "expired") {
          stopPoll();
          setError(t("err_timeout"));
          setStep("phone");
        }
      } catch {
        stopPoll();
        setError(t("err_connection"));
        setStep("phone");
      }
    }, 2000);
  };

  const handlePhoneSubmit = async () => {
    if (phone.length < 12) return;
    setLoading(true);
    setError(null);
    try {
      if (user?.telegramLinked) {
        // Preferred path: DM the code straight to the user's Telegram chat so
        // they never leave the Mini App. Fall back to the deep-link only when
        // the bot genuinely cannot reach them.
        try {
          await sendPhoneOtpTelegram(phone);
          setStep("otp");
        } catch (e) {
          const reason = extractError(e).details?.reason;
          if (reason === "telegram_dm_unavailable" || reason === "no_telegram_linked") {
            await startDeepLinkFlow();
          } else {
            throw e;
          }
        }
      } else {
        await sendOtp(phone);
        setStep("otp");
      }
    } catch (e) {
      setError(fe(extractError(e)));
    } finally {
      setLoading(false);
    }
  };

  // Primary TMA path: Telegram shares the account's own verified number as a
  // signed payload — one tap, no code. Manual entry stays for other numbers.
  const isTma = detectRuntime() === "telegram";
  const canRequestContact =
    isTma &&
    typeof window !== "undefined" &&
    typeof window.Telegram?.WebApp?.requestContact === "function";

  const handleShareContact = () => {
    setError(null);
    setLoading(true);
    window.Telegram!.WebApp!.requestContact!((ok, event) => {
      void (async () => {
        try {
          if (!ok || !event?.response) {
            setError(t("share_declined"));
            return;
          }
          const result = await confirmPhoneFromTelegram(event.response);
          setSession(result);
          onDone?.();
          onClose();
        } catch (e) {
          setError(fe(extractError(e)));
        } finally {
          setLoading(false);
        }
      })();
    });
  };

  const handleOtpSubmit = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    setError(null);
    try {
      const result = await confirmPhoneAdd(phone, otp);
      setSession(result);
      onDone?.();
      onClose();
    } catch (e) {
      setError(fe(extractError(e)));
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const title =
    step === "phone" ? t("title_phone") :
    step === "tg-waiting" ? t("title_tg_waiting") :
    t("title_otp");

  return (
    <Modal open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              {step === "otp" ? (
                <Shield className="h-5 w-5" aria-hidden />
              ) : (
                <Phone className="h-5 w-5" aria-hidden />
              )}
            </div>
            <ModalTitle className="font-disp">{title}</ModalTitle>
          </div>
        </ModalHeader>

        {error && (
          <div className="mb-4 rounded-xl bg-danger-50 px-3 py-2 text-[13px] font-700 text-danger-600 dark:bg-danger-500/10 dark:text-danger-400">
            {error}
          </div>
        )}

        {step === "phone" && isTma ? (
          // Inside Telegram: ONLY «Поделиться номером». No manual entry, no OTP —
          // Telegram gives the account's verified number in one tap.
          <div className="space-y-4">
            <p className="text-[13px] font-700 text-ink-500 dark:text-ink-400">
              {t("share_tg_body")}
            </p>
            {canRequestContact ? (
              <Button
                variant="cta"
                size="lg"
                className="w-full"
                disabled={loading}
                onClick={handleShareContact}
              >
                {loading ? <Spinner size={16} /> : t("share_tg_btn")}
              </Button>
            ) : (
              <p className="rounded-xl bg-accent-50 px-3 py-2.5 text-[12px] font-700 text-accent-700 dark:bg-accent-500/10 dark:text-accent-300">
                {t("update_telegram")}
              </p>
            )}
          </div>
        ) : step === "phone" ? (
          // Web browser: manual number + OTP flow.
          <div className="space-y-4">
            <p className="text-[13px] font-700 text-ink-500 dark:text-ink-400">
              {user?.telegramLinked ? t("hint_linked") : t("hint_default")}
            </p>
            <PhoneInput value={phone} onValueChange={setPhone} autoFocus />
            <Button
              variant="cta"
              size="lg"
              className="w-full"
              disabled={phone.length < 12 || loading}
              onClick={handlePhoneSubmit}
            >
              {loading ? <Spinner size={16} /> : t("get_code")}
            </Button>
          </div>
        ) : null}

        {step === "tg-waiting" && deepLink && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-xl bg-[#0088cc]/10 px-4 py-3">
              <Spinner size={16} className="shrink-0 text-[#0088cc]" />
              <p className="text-[13px] font-700 text-ink-800 dark:text-ink-200">
                {t("waiting")}
              </p>
            </div>
            <a
              href={deepLink}
              target="_blank"
              rel="noreferrer"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0088cc] text-[15px] font-800 text-white hover:bg-[#0088cc]/90"
            >
              {t("open_telegram")}
            </a>
            <button
              type="button"
              onClick={() => { stopPoll(); setStep("phone"); }}
              className="text-center text-[13px] font-700 text-ink-500 hover:text-ink-700 dark:text-ink-400 dark:hover:text-ink-200"
            >
              {t("change_number")}
            </button>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-4">
            <p className="text-[13px] font-700 text-ink-500 dark:text-ink-400">
              {t("otp_sent_to")}{" "}
              <span className="font-800 text-ink-900 dark:text-white">{phone}</span>
            </p>
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              autoFocus
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && handleOtpSubmit()}
              placeholder="— — — — — —"
              className="w-full rounded-2xl border-2 border-ink-200 bg-ink-50 px-4 py-3 text-center text-[22px] font-900 tracking-[0.3em] text-ink-900 outline-none focus:border-brand-500 dark:border-ink-700 dark:bg-ink-800 dark:text-white"
            />
            <Button
              variant="cta"
              size="lg"
              className="w-full"
              disabled={otp.length < 6 || loading}
              onClick={handleOtpSubmit}
            >
              {loading ? <Spinner size={16} /> : t("confirm")}
            </Button>
            <button
              type="button"
              onClick={() => { setStep("phone"); setOtp(""); setError(null); }}
              className="w-full text-center text-[13px] font-700 text-ink-500 hover:text-ink-700 dark:text-ink-400 dark:hover:text-ink-200"
            >
              {t("change_number")}
            </button>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}
