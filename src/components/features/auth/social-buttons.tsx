"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { initTelegramBotLogin, getTelegramBotLoginStatus, claimTelegramBotLogin } from "@/lib/api/auth";
import { isFullAuthResult } from "@/lib/api/types";
import { extractError } from "@/lib/api/client";
import { consumeDeferredAction, routeForIntent } from "@/lib/auth/deferred-action";
import { openTelegramDeepLink } from "@/lib/utils/open-telegram";
import { useAuth } from "@/store/auth";
import { Send } from "lucide-react";
import { NotifCard, Spinner } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import "./social-buttons-types";

const baseBtn =
  "flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-ink-200 bg-white text-body-lg font-800 text-ink-700 transition-colors hover:bg-ink-50 focus-visible:border-brand-500 focus-visible:outline-none disabled:opacity-50 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200 dark:hover:bg-ink-800";

const tgBtn = "border-[#0088cc] bg-[#0088cc] font-900 text-white hover:bg-[#0088cc]/90";

interface Props {
  onDone?: () => void;
}

export function SocialButtons({ onDone }: Props) {
  const t = useTranslations("auth.social");
  const router = useRouter();
  const { setSession } = useAuth();
  const [loading, setLoading] = useState<"telegram" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tgBotLink, setTgBotLink] = useState<{ token: string; deepLink: string } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleResult = useCallback(
    (result: { kind: string; accessToken?: string; refreshToken?: string; user?: unknown }) => {
      if (!isFullAuthResult(result as Parameters<typeof isFullAuthResult>[0])) {
        setError(t("err_phone_verification"));
        return;
      }
      setSession(result as Parameters<typeof setSession>[0]);
      onDone?.();
      const intent = consumeDeferredAction();
      router.replace(intent ? routeForIntent(intent) : "/");
    },
    [router, setSession, onDone, t],
  );

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleTelegram = async () => {
    setLoading("telegram");
    setError(null);
    try {
      const { token, deepLink } = await initTelegramBotLogin();
      setTgBotLink({ token, deepLink });
      // Past an await → no gesture context; window.open is popup-blocked on mobile.
      openTelegramDeepLink(deepLink);
      pollRef.current = setInterval(async () => {
        try {
          const { status } = await getTelegramBotLoginStatus(token);
          if (status === "done") {
            clearInterval(pollRef.current!);
            pollRef.current = null;
            const result = await claimTelegramBotLogin(token);
            setTgBotLink(null);
            setLoading(null);
            handleResult(result);
          } else if (status === "not_found") {
            clearInterval(pollRef.current!);
            pollRef.current = null;
            setTgBotLink(null);
            setLoading(null);
            setError(t("err_not_linked"));
          } else if (status === "expired") {
            clearInterval(pollRef.current!);
            pollRef.current = null;
            setTgBotLink(null);
            setLoading(null);
            setError(t("err_timeout"));
          }
        } catch {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setTgBotLink(null);
          setLoading(null);
          setError(t("err_login"));
        }
      }, 2000);
    } catch (e) {
      setError(extractError(e).message);
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <NotifCard variant="error" title={t("error_title")}>
          {error}
        </NotifCard>
      )}

      {/* Telegram */}
      {tgBotLink ? (
        <div className="flex flex-col gap-2">
          <a
            href={tgBotLink.deepLink}
            target="_blank"
            rel="noreferrer"
            className={cn(baseBtn, tgBtn)}
          >
            <Spinner size={18} />
            <span>{t("waiting")}</span>
          </a>
          <button
            type="button"
            className="text-center text-[12px] font-700 text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            onClick={() => {
              openTelegramDeepLink(tgBotLink.deepLink);
            }}
          >
            {t("open_again")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={cn(baseBtn, tgBtn)}
          onClick={handleTelegram}
          disabled={loading !== null}
          aria-label={t("login_telegram")}
        >
          {loading === "telegram" ? <Spinner size={18} /> : <Send className="h-5 w-5 shrink-0" aria-hidden="true" />}
          <span>{t("login_telegram")}</span>
        </button>
      )}

      {/* Google — временно скрыто, добавим позже */}
      {/* {GOOGLE_CLIENT_ID ? (...) : (...)} */}

    </div>
  );
}
