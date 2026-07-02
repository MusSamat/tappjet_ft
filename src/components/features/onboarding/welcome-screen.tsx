"use client";

import { useTranslations } from "next-intl";
import { LogIn, MessageCircle, ShieldCheck, Wallet } from "lucide-react";

interface WelcomeScreenProps {
  onLogin: () => void;
  onGuest: () => void;
}

/** Welcome / onboarding entry — design-spec §2.1 (full-bleed teal gradient). */
export function WelcomeScreen({ onLogin, onGuest }: WelcomeScreenProps) {
  const t = useTranslations("welcome");

  return (
    <div
      className="flex min-h-screen flex-col text-white"
      style={{ background: "linear-gradient(160deg,#2CC9B4 0%,#0D9488 45%,#0C6F65 100%)" }}
    >
      <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col items-center justify-center px-7 text-center">
        {/* Original Tappjet «Tj» mark — white tile for contrast on the teal gradient. */}
        <span className="mb-5 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white shadow-lift ring-1 ring-white/25">
          <span className="text-[44px] font-black leading-none text-brand-600">Tj</span>
        </span>

        <p className="text-[15px] font-900 text-accent-300">{t("title")}</p>
        <h1 className="font-disp mt-1 text-[25px] font-900 leading-tight text-white">{t("subtitle")}</h1>

        {/* Feature chips */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-[12px] font-800 ring-1 ring-white/20">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" /> {t("chip_verified")}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-[12px] font-800 ring-1 ring-white/20">
            <Wallet className="h-4 w-4" aria-hidden="true" /> {t("chip_cheap")}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-[12px] font-800 ring-1 ring-white/20">
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> {t("chip_chat")}
          </span>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="mx-auto w-full max-w-[460px] space-y-2.5 px-6 pb-9">
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
      </div>
    </div>
  );
}
