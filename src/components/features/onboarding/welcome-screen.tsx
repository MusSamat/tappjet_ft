"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Zap } from "lucide-react";
import { ICON } from "@/components/ui";

const ShieldCheck = ICON.verified;
const Wallet = ICON.price;
const ArrowRight = ICON.next;

interface WelcomeScreenProps {
  onStart: () => void;
}

/** Design system §12 — дружелюбный первый экран-стикер. */
export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const t = useTranslations("welcome");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-brand-500 to-brand-600 px-6 py-10 text-center text-white">
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-10 top-10 h-32 w-32 rounded-full bg-white/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 bottom-24 h-24 w-24 rounded-full bg-accent-400/20"
      />

      <div className="flex w-full max-w-sm flex-1 flex-col items-center justify-center">
        {/* Sticker */}
        <div className="relative mb-6">
          <div className="flex h-36 w-36 items-center justify-center rounded-full bg-white/15 shadow-soft ring-4 ring-white/20">
            <span aria-hidden="true" className="text-[80px] leading-none">
              🚗
            </span>
          </div>
          <span aria-hidden="true" className="absolute -right-2 -top-1 text-[34px]">
            👋
          </span>
          <span
            aria-hidden="true"
            className="absolute -bottom-1 -left-2 text-[26px] motion-safe:animate-pulse motion-reduce:animate-none"
          >
            ✨
          </span>
        </div>

        <p className="text-[28px] font-900">{t("title")}</p>
        <p className="mt-2 max-w-[260px] text-[14px] font-700 text-white/85">{t("subtitle")}</p>

        {/* Trust chips */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-800">
            <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" /> {t("chip_verified")}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-800">
            <Wallet aria-hidden="true" className="h-3.5 w-3.5" /> {t("chip_cheap")}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-800">
            <Zap aria-hidden="true" className="h-3.5 w-3.5" /> {t("chip_fast")}
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className="w-full max-w-sm">
        <button
          type="button"
          onClick={onStart}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-accent-500 text-[16px] font-900 text-[#4A2C00] shadow-cta transition-transform active:scale-[0.98] hover:bg-accent-400"
        >
          {t("cta")} <ArrowRight aria-hidden="true" className="h-5 w-5" />
        </button>
        <p className="mt-3 text-[12px] font-700 text-white/70">
          {t("have_account")}{" "}
          <Link href="/auth/login" className="font-900 text-white underline">
            {t("login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
