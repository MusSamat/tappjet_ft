"use client";

import { useEffect, useRef } from "react";
import { hasSessionHint, refreshAccessToken, onTokenRefreshed } from "@/lib/api/client";
import { getMe, loginWithTelegramMiniApp } from "@/lib/api/auth";
import { useAuth } from "@/store/auth";
import { refreshSocketAuth } from "@/lib/socket/client";
import { detectRuntime, getTelegramInitData } from "@/lib/detect-runtime";
import { isFullAuthResult } from "@/lib/api/types";

export function AuthBootstrap() {
  const { hydrate, setSession, setStatus, clearSession } = useAuth();
  const done = useRef(false);

  useEffect(() => {
    onTokenRefreshed(refreshSocketAuth);

    if (done.current) return;
    done.current = true;

    const sessionLikely = hasSessionHint();

    if (!sessionLikely) {
      // No prior session — attempt Telegram Mini App silent login if running inside Telegram.
      if (detectRuntime() === "telegram") {
        const initData = getTelegramInitData();
        if (initData) {
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
          return;
        }
      }
      setStatus("anonymous");
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
      .catch(() => clearSession());
  }, [hydrate, setSession, setStatus, clearSession]);

  return null;
}
