"use client";

import { useEffect, useRef, useState } from "react";
import { hasSessionHint, refreshAccessToken, onTokenRefreshed } from "@/lib/api/client";
import { getMe, loginWithTelegramMiniApp } from "@/lib/api/auth";
import { useAuth } from "@/store/auth";
import { refreshSocketAuth } from "@/lib/socket/client";
import { detectRuntime, getTelegramInitData } from "@/lib/detect-runtime";
import { isFullAuthResult } from "@/lib/api/types";
import { LogoMark, Spinner } from "@/components/ui";

// Inside Telegram Mini App the shell must not flash guest UI and then flip to
// logged-in: cover the app with a branded splash until the auth bootstrap
// below resolves (authenticated | anonymous). Regular web keeps no splash.
// Network failure degrades to guest after this timeout instead of hanging.
const TMA_SPLASH_TIMEOUT_MS = 6000;

export function AuthBootstrap() {
  const { hydrate, setSession, setStatus, clearSession } = useAuth();
  const status = useAuth((s) => s.status);
  const done = useRef(false);
  const [showSplash, setShowSplash] = useState(false);

  // UI gating only — the auth flow itself (session-hint refresh → Telegram
  // silent-login fallback) is owned by the effect below and stays untouched.
  useEffect(() => {
    if (detectRuntime() === "telegram" && Boolean(getTelegramInitData())) {
      setShowSplash(true);
    }
  }, []);

  useEffect(() => {
    if (!showSplash) return;
    if (status === "authenticated" || status === "anonymous") {
      setShowSplash(false);
      return;
    }
    const timer = window.setTimeout(() => setShowSplash(false), TMA_SPLASH_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [showSplash, status]);

  useEffect(() => {
    onTokenRefreshed(refreshSocketAuth);

    if (done.current) return;
    done.current = true;

    const sessionLikely = hasSessionHint();

    // Telegram Mini App silent login via initData. Returns false when not
    // running inside Telegram (or initData is unavailable).
    const tryTelegramSilentLogin = (): boolean => {
      if (detectRuntime() !== "telegram") return false;
      const initData = getTelegramInitData();
      if (!initData) return false;
      setStatus("loading");
      loginWithTelegramMiniApp(initData)
        .then((result) => {
          if (isFullAuthResult(result)) {
            setSession(result);
            refreshSocketAuth();
          } else {
            // Provisional — Telegram account exists but has no phone yet.
            // Leave status as anonymous; the app will redirect to /auth/login.
            setStatus("anonymous");
          }
        })
        .catch(() => setStatus("anonymous"));
      return true;
    };

    if (!sessionLikely) {
      // No prior session — attempt Telegram Mini App silent login if running inside Telegram.
      if (!tryTelegramSilentLogin()) setStatus("anonymous");
      return;
    }

    setStatus("loading");
    // Refresh first: accessToken lives only in memory and is wiped on every page load.
    refreshAccessToken()
      .then(() => getMe())
      .then((user) => {
        hydrate(user);
        refreshSocketAuth();
      })
      .catch(() => {
        clearSession();
        // Telegram webviews may block the cross-site refresh cookie entirely —
        // fall back to the silent Mini App login instead of staying logged out.
        tryTelegramSilentLogin();
      });
  }, [hydrate, setSession, setStatus, clearSession]);

  if (!showSplash) return null;
  return (
    <div
      role="status"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-white dark:bg-ink-950"
    >
      <LogoMark className="h-16 w-16" />
      <Spinner size={22} className="text-brand-600" />
    </div>
  );
}
