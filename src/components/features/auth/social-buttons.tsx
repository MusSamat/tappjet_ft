"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithGoogle, loginWithTelegram } from "@/lib/api/auth";
import { isFullAuthResult } from "@/lib/api/types";
import { extractError } from "@/lib/api/client";
import { consumeDeferredAction, routeForIntent } from "@/lib/auth/deferred-action";
import { useAuth } from "@/store/auth";
import { NotifCard, Spinner } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import "./social-buttons-types";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const TELEGRAM_BOT_ID = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID;

const baseBtn =
  "flex h-11 w-full items-center justify-center gap-3 rounded-xl border-[1.5px] border-gray-300 bg-white text-body text-gray-900 transition-colors hover:bg-gray-50 focus-visible:border-teal-500 focus-visible:outline-none disabled:opacity-50";

interface Props {
  onDone?: () => void;
}

export function SocialButtons({ onDone }: Props) {
  const router = useRouter();
  const { setSession } = useAuth();
  const [loading, setLoading] = useState<"google" | "telegram" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const googleOverlayRef = useRef<HTMLDivElement>(null);

  const handleResult = useCallback(
    (result: Awaited<ReturnType<typeof loginWithGoogle>>) => {
      if (!isFullAuthResult(result)) {
        setError("Аккаунт требует верификации телефона. Войдите через телефон.");
        return;
      }
      setSession(result);
      onDone?.();
      const intent = consumeDeferredAction();
      router.replace(intent ? routeForIntent(intent) : "/");
    },
    [router, setSession, onDone],
  );

  // ── Google GIS — overlay pattern ────────────────────────────────────────
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const init = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        auto_select: false,
        cancel_on_tap_outside: true,
        callback: async ({ credential }) => {
          setLoading("google");
          setError(null);
          try {
            handleResult(await loginWithGoogle(credential));
          } catch (e) {
            setError(extractError(e).message);
          } finally {
            setLoading(null);
          }
        },
      });

      if (googleOverlayRef.current) {
        window.google?.accounts.id.renderButton(googleOverlayRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          width: 500,
        });
      }
    };

    if (window.google) {
      init();
      return;
    }

    if (!document.getElementById("gsi-client")) {
      const s = document.createElement("script");
      s.id = "gsi-client";
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.onload = init;
      document.head.appendChild(s);
    }

    return () => {
      window.google?.accounts.id.cancel();
    };
  }, [handleResult]);

  // ── Telegram Login Widget ───────────────────────────────────────────────
  useEffect(() => {
    if (!TELEGRAM_BOT_ID || document.getElementById("tg-widget-js")) return;

    const s = document.createElement("script");
    s.id = "tg-widget-js";
    s.src = "https://telegram.org/js/telegram-widget.js?22";
    s.async = true;
    document.head.appendChild(s);
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleTelegram = () => {
    if (!TELEGRAM_BOT_ID) {
      setError("Telegram не настроен: укажите NEXT_PUBLIC_TELEGRAM_BOT_ID.");
      return;
    }
    if (!window.Telegram?.Login) {
      setError("Telegram SDK ещё загружается. Попробуйте через секунду.");
      return;
    }
    setLoading("telegram");
    setError(null);

    window.Telegram.Login.auth(
      { bot_id: Number(TELEGRAM_BOT_ID), request_access: "write" },
      async (data) => {
        if (!data) {
          setLoading(null);
          return;
        }
        try {
          handleResult(await loginWithTelegram(data));
        } catch (e) {
          setError(extractError(e).message);
        } finally {
          setLoading(null);
        }
      },
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <NotifCard variant="error" title="Ошибка входа">
          {error}
        </NotifCard>
      )}

      {/* Telegram */}
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

      {/* Google */}
      {GOOGLE_CLIENT_ID ? (
        <div className="relative h-11 w-full overflow-hidden rounded-xl">
          <div
            className={cn(
              baseBtn,
              "absolute inset-0 pointer-events-none",
              loading === "google" && "opacity-50",
            )}
            aria-hidden="true"
          >
            {loading === "google" ? (
              <Spinner size={18} />
            ) : (
              <Image src="/icons/google.svg" alt="" width={20} height={20} unoptimized />
            )}
            <span>Войти через Google</span>
          </div>
          <div
            ref={googleOverlayRef}
            className="absolute inset-0 opacity-0"
            aria-label="Войти через Google"
          />
        </div>
      ) : (
        <button
          type="button"
          className={baseBtn}
          onClick={() =>
            setError("Google OAuth не настроен: укажите NEXT_PUBLIC_GOOGLE_CLIENT_ID.")
          }
        >
          <Image src="/icons/google.svg" alt="" width={20} height={20} unoptimized />
          <span>Войти через Google</span>
        </button>
      )}

    </div>
  );
}
