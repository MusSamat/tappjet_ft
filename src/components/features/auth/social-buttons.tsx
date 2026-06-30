"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { initTelegramBotLogin, getTelegramBotLoginStatus, claimTelegramBotLogin } from "@/lib/api/auth";
import { isFullAuthResult } from "@/lib/api/types";
import { extractError } from "@/lib/api/client";
import { consumeDeferredAction, routeForIntent } from "@/lib/auth/deferred-action";
import { useAuth } from "@/store/auth";
import { Send } from "lucide-react";
import { NotifCard, Spinner } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import "./social-buttons-types";

const baseBtn =
  "flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-ink-200 bg-white text-body-lg font-extrabold text-ink-700 transition-colors hover:bg-ink-50 focus-visible:border-brand-500 focus-visible:outline-none disabled:opacity-50";

const tgBtn = "border-[#0088cc] bg-[#0088cc] font-black text-white hover:bg-[#0088cc]/90";

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
            className={cn(baseBtn, tgBtn)}
          >
            <Spinner size={18} />
            <span>Ожидание подтверждения...</span>
          </a>
          <button
            type="button"
            className="text-center text-[12px] font-semibold text-brand-600 hover:text-brand-700"
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
          className={cn(baseBtn, tgBtn)}
          onClick={handleTelegram}
          disabled={loading !== null}
          aria-label="Войти через Telegram"
        >
          {loading === "telegram" ? <Spinner size={18} /> : <Send className="h-5 w-5 shrink-0" aria-hidden="true" />}
          <span>Войти через Telegram</span>
        </button>
      )}

      {/* Google — временно скрыто, добавим позже */}
      {/* {GOOGLE_CLIENT_ID ? (...) : (...)} */}

    </div>
  );
}
