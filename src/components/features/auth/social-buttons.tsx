"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { initTelegramBotLogin, getTelegramBotLoginStatus, claimTelegramBotLogin } from "@/lib/api/auth";
import { isFullAuthResult } from "@/lib/api/types";
import { extractError } from "@/lib/api/client";
import { consumeDeferredAction, routeForIntent } from "@/lib/auth/deferred-action";
import { useAuth } from "@/store/auth";
import { NotifCard, Spinner } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import "./social-buttons-types";

const baseBtn =
  "flex h-11 w-full items-center justify-center gap-3 rounded-xl border-[1.5px] border-gray-300 bg-white text-body text-gray-900 transition-colors hover:bg-gray-50 focus-visible:border-teal-500 focus-visible:outline-none disabled:opacity-50";

interface Props {
  onDone?: () => void;
}

export function SocialButtons({ onDone }: Props) {
  const router = useRouter();
  const { setSession } = useAuth();
  const [loading, setLoading] = useState<"telegram" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tgBotLink, setTgBotLink] = useState<{ token: string; deepLink: string } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleResult = useCallback(
    (result: { kind: string; accessToken?: string; refreshToken?: string; user?: unknown }) => {
      if (!isFullAuthResult(result as Parameters<typeof isFullAuthResult>[0])) {
        setError("Аккаунт требует верификации телефона. Войдите через телефон.");
        return;
      }
      setSession(result as Parameters<typeof setSession>[0]);
      onDone?.();
      const intent = consumeDeferredAction();
      router.replace(intent ? routeForIntent(intent) : "/");
    },
    [router, setSession, onDone],
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
      window.open(deepLink, "_blank");
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
            setError("Telegram не привязан к аккаунту. Войдите по номеру телефона или зарегистрируйтесь.");
          } else if (status === "expired") {
            clearInterval(pollRef.current!);
            pollRef.current = null;
            setTgBotLink(null);
            setLoading(null);
            setError("Время вышло. Попробуйте снова.");
          }
        } catch {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setTgBotLink(null);
          setLoading(null);
          setError("Ошибка входа. Попробуйте снова.");
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
        <NotifCard variant="error" title="Ошибка входа">
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
            className={cn(baseBtn, "bg-[#0088cc] text-white hover:bg-[#0088cc]/90 border-[#0088cc]")}
          >
            <Spinner size={18} />
            <span>Ожидание подтверждения...</span>
          </a>
          <button
            type="button"
            className="text-center text-[12px] font-semibold text-teal-600 hover:text-teal-700"
            onClick={() => {
              window.open(tgBotLink.deepLink, "_blank");
            }}
          >
            Открыть Telegram снова
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={cn(baseBtn, "bg-[#0088cc] text-white hover:bg-[#0088cc]/90 border-[#0088cc]")}
          onClick={handleTelegram}
          disabled={loading !== null}
          aria-label="Войти через Telegram"
        >
          {loading === "telegram" ? (
            <Spinner size={18} />
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden="true">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
          )}
          <span>Войти через Telegram</span>
        </button>
      )}

      {/* Google — временно скрыто, добавим позже */}
      {/* {GOOGLE_CLIENT_ID ? (...) : (...)} */}

    </div>
  );
}
