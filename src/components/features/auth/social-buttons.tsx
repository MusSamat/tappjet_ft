"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { initTelegramBotLogin, getTelegramBotLoginStatus, claimTelegramBotLogin } from "@/lib/api/auth";
import { isFullAuthResult } from "@/lib/api/types";
import { consumeDeferredAction, routeForIntent } from "@/lib/auth/deferred-action";
import { toTelegramAppLink } from "@/lib/utils/open-telegram";
import { useAuth } from "@/store/auth";
import { Send } from "lucide-react";
import { NotifCard, Spinner } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import "./social-buttons-types";

const baseBtn =
  "flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-ink-200 bg-white text-body-lg font-800 text-ink-700 transition-colors hover:bg-ink-50 focus-visible:border-brand-500 focus-visible:outline-none disabled:opacity-50 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200 dark:hover:bg-ink-800";

const tgBtn = "border-[#0088cc] bg-[#0088cc] font-900 text-white hover:bg-[#0088cc]/90";

// The login is completed BY THIS TAB (poll → claim), so the session lands in the
// browser the user started in — never Telegram's in-app browser. The token is
// persisted so a tab discard (mobile, while Telegram has focus) is recoverable:
// on return we re-poll and finish. The Telegram button is a native <a> — a tap
// opens Telegram inside the user gesture WITHOUT navigating this tab away (the
// old location.href did navigate away and killed the poll → login never landed).
const LS_KEY = "tappjet_tg_login";

interface Props {
  onDone?: () => void;
}

export function SocialButtons({ onDone }: Props) {
  const t = useTranslations("auth.social");
  const router = useRouter();
  const setSession = useAuth((s) => s.setSession);
  const [ready, setReady] = useState(false); // token prefetched, <a> armed
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const claimingRef = useRef(false);
  const tokenRef = useRef<string | null>(null); // prefetched login token for armLogin

  const stopPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const finish = useCallback(
    (result: Awaited<ReturnType<typeof claimTelegramBotLogin>>) => {
      if (!isFullAuthResult(result as Parameters<typeof isFullAuthResult>[0])) {
        setError(t("err_phone_verification"));
        return;
      }
      localStorage.removeItem(LS_KEY);
      setSession(result as Parameters<typeof setSession>[0]);
      onDone?.();
      const intent = consumeDeferredAction();
      router.replace(intent ? routeForIntent(intent) : "/");
    },
    [router, setSession, onDone, t],
  );

  const checkOnce = useCallback(
    async (token: string) => {
      if (claimingRef.current) return;
      try {
        const { status } = await getTelegramBotLoginStatus(token);
        if (status === "done") {
          claimingRef.current = true;
          stopPoll();
          finish(await claimTelegramBotLogin(token));
        } else if (status === "expired" || status === "not_found") {
          stopPoll();
          localStorage.removeItem(LS_KEY);
          setWaiting(false);
          setError(t(status === "expired" ? "err_timeout" : "err_not_linked"));
        }
      } catch {
        /* transient network hiccup — keep polling */
      }
    },
    [finish, stopPoll, t],
  );

  const startPolling = useCallback(
    (token: string) => {
      stopPoll();
      setWaiting(true);
      pollRef.current = setInterval(() => void checkOnce(token), 2500);
    },
    [checkOnce, stopPoll],
  );

  // Prefetch a login token so the button is a real in-gesture <a href>. Resume a
  // pending login after a tab discard, and re-poll the moment the tab regains
  // focus (mobile suspends background timers while the user is in Telegram).
  useEffect(() => {
    const pending = localStorage.getItem(LS_KEY);
    if (pending) {
      startPolling(pending);
      void checkOnce(pending);
    } else {
      initTelegramBotLogin()
        .then(({ token, deepLink: link }) => {
          tokenRef.current = token;
          setDeepLink(link);
          setReady(true);
        })
        .catch(() => setReady(false));
    }

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const tok = localStorage.getItem(LS_KEY);
      if (tok) void checkOnce(tok);
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      stopPoll();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The <a> tap opens Telegram; arm polling + persist the token so this tab
  // (or a restored copy of it) finishes the login on return.
  const armLogin = () => {
    const token = tokenRef.current;
    if (!token) return;
    localStorage.setItem(LS_KEY, token);
    startPolling(token);
  };

  // Prefer the tg:// app scheme — opens Telegram directly even where the t.me
  // domain is DNS-blocked; https is the fallback for users without the app.
  const appLink = deepLink ? toTelegramAppLink(deepLink) : null;

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <NotifCard variant="error" title={t("error_title")}>
          {error}
        </NotifCard>
      )}

      {waiting ? (
        <div className="flex flex-col items-center gap-2">
          <div className={cn(baseBtn, tgBtn, "cursor-default")}>
            <Spinner size={18} />
            <span>{t("waiting")}</span>
          </div>
          {deepLink && (
            <a
              href={appLink ?? deepLink}
              target="_blank"
              rel="noreferrer"
              className="text-center text-[14px] font-700 text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              {t("open_again")}
            </a>
          )}
          {appLink && deepLink && (
            <a
              href={deepLink}
              target="_blank"
              rel="noreferrer"
              className="text-center text-[12px] font-600 text-ink-400 underline hover:text-ink-600 dark:hover:text-ink-200"
            >
              {t("open_via_browser")}
            </a>
          )}
          <p className="text-center text-[13px] font-600 text-ink-500 dark:text-ink-400">
            {t("return_hint")}
          </p>
        </div>
      ) : deepLink ? (
        <a
          href={appLink ?? deepLink}
          target="_blank"
          rel="noreferrer"
          onClick={armLogin}
          className={cn(baseBtn, tgBtn)}
          aria-label={t("login_telegram")}
        >
          <Send className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{t("login_telegram")}</span>
        </a>
      ) : (
        <button type="button" className={cn(baseBtn, tgBtn)} disabled aria-label={t("login_telegram")}>
          {ready ? (
            <Send className="h-5 w-5 shrink-0" aria-hidden="true" />
          ) : (
            <Spinner size={18} />
          )}
          <span>{t("login_telegram")}</span>
        </button>
      )}

      {/* Google — временно скрыто, добавим позже */}
    </div>
  );
}
