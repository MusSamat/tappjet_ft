"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, LogIn, MessageCircle, ShieldCheck, Wallet } from "lucide-react";
import { LogoMark } from "@/components/ui";
import { detectRuntime } from "@/lib/detect-runtime";

interface WelcomeScreenProps {
  onLogin: () => void;
  onGuest: () => void;
}

/** Welcome / onboarding entry — design-spec §2.1 (full-bleed teal gradient). */
export function WelcomeScreen({ onLogin, onGuest }: WelcomeScreenProps) {
  const t = useTranslations("welcome");
  // Inside the Telegram Mini App the account comes from silent Telegram login —
  // «войти/зарегистрироваться/гость» make no sense there; show a single CTA.
  // Detected in an effect to keep SSR markup stable (no hydration mismatch).
  const [isTma, setIsTma] = useState(false);
  useEffect(() => setIsTma(detectRuntime() === "telegram"), []);

  return (
    // Single-viewport, never-scroll layout: fixed to the DYNAMIC viewport
    // height (100dvh accounts for the TMA/browser chrome that 100vh ignores),
    // overflow-hidden guarantees no scroll, content flexes, buttons pinned.
    <div
      className="flex flex-col overflow-hidden text-white"
      style={{
        height: "100dvh",
        paddingTop: "env(safe-area-inset-top)",
        background: "linear-gradient(160deg,#2CC9B4 0%,#0D9488 45%,#0C6F65 100%)",
      }}
    >
      <div className="mx-auto flex min-h-0 w-full max-w-[460px] flex-1 flex-col items-center justify-start gap-3 px-7 pt-[9vh] text-center">
        {/* Tappjet paper-plane mark — frosted white/15 tile on the teal gradient. */}
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.75rem] bg-white/15 shadow-lift ring-1 ring-white/25">
          <LogoMark plain className="h-14 w-14" />
        </span>

        <div>
          <p className="text-[14px] font-900 text-accent-300">{t("title")}</p>
          <h1 className="font-disp mt-1 text-[22px] font-900 leading-tight text-white">{t("subtitle")}</h1>
        </div>

        {/* Feature chips */}
        <div className="flex flex-wrap justify-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-800 ring-1 ring-white/20">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" /> {t("chip_verified")}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-800 ring-1 ring-white/20">
            <Wallet className="h-4 w-4" aria-hidden="true" /> {t("chip_cheap")}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-800 ring-1 ring-white/20">
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> {t("chip_chat")}
          </span>
        </div>
      </div>

      {/* Bottom actions — shrink-0 so they're always in view. Bottom padding
          clears the floating menu block (96px, matches .main-mobile-pad) so the
          CTAs sit ABOVE the nav and everything fits in one viewport, no scroll. */}
      <div
        className="mx-auto w-full max-w-[460px] shrink-0 space-y-2.5 px-6 pt-2"
        style={{ paddingBottom: "calc(96px + env(safe-area-inset-bottom))" }}
      >
        {isTma ? (
          <button
            type="button"
            onClick={onGuest}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-accent-500 py-3.5 text-[15px] font-900 text-accent-ink shadow-cta transition-colors hover:bg-accent-400"
          >
            {t("cta_start")} <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        ) : (
        <>
        <button
          type="button"
          onClick={onLogin}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-accent-500 py-3.5 text-[15px] font-900 text-accent-ink shadow-cta transition-colors hover:bg-accent-400"
        >
          <LogIn className="h-5 w-5" aria-hidden="true" /> {t("cta_primary")}
        </button>
        <button
          type="button"
          onClick={onGuest}
          className="h-12 w-full rounded-2xl bg-white/15 text-[14px] font-900 text-white ring-1 ring-white/25 transition-colors hover:bg-white/20"
        >
          {t("cta_guest")}
        </button>
        </>
        )}
      </div>
    </div>
  );
}
