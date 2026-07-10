"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { detectRuntime } from "@/lib/detect-runtime";

// Welcome gate, runtime-aware:
//  - Telegram Mini App: welcome ONCE PER DEVICE (localStorage) — the user is
//    already logged in via Telegram, an interstitial on every open is noise.
//    The marketing home page "/" is web-only: in TMA it redirects to /trips.
//  - Web browser: welcome once per session (sessionStorage) — it carries the
//    real login/register/guest fork for guests.
const SEEN_KEY = "tappjet_onboarding_seen";

// Pages that must never be interrupted by the welcome redirect
// (/onboarding itself is handled explicitly above the skip check).
const SKIP_PREFIXES = ["/auth", "/admin", "/dev"];

function seenStore(): Storage {
  return detectRuntime() === "telegram" ? localStorage : sessionStorage;
}

function hasSeen(): boolean {
  try {
    return seenStore().getItem(SEEN_KEY) === "1";
  } catch {
    return false; // private mode — welcome may show again; acceptable
  }
}

/** Called on redirect-to-welcome and on any visit to /onboarding. */
export function markOnboardingSeen(): void {
  try {
    seenStore().setItem(SEEN_KEY, "1");
  } catch {
    /* private mode */
  }
}

export function OnboardingGate() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Reaching the welcome page by ANY means counts as "seen" — the flag must
    // not depend on which button the user taps (the bottom nav is visible on
    // the welcome page too; leaving through it used to bounce straight back).
    if (pathname === "/onboarding" || pathname.startsWith("/onboarding/")) {
      markOnboardingSeen();
      return;
    }
    if (SKIP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return;

    if (!hasSeen()) {
      // Mark BEFORE redirecting: exactly one welcome, guaranteed — even if
      // the user leaves it via nav, deep link, or the back button.
      markOnboardingSeen();
      router.replace("/onboarding");
      return;
    }

    // `/` is now the unified search feed (role-aware) — no redirect needed;
    // TMA and web both use it as home.
  }, [pathname, router]);

  return null;
}
