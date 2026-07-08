"use client";

import Link from "next/link";
import { LogIn, Lock } from "lucide-react";
import { useTranslations } from "next-intl";

// Guest lock screen — design-spec §2.11. Rendered by the protected layout for
// anonymous users instead of redirecting, so the (guest) bottom nav stays put.
// Any deferred action saved by the triggering page survives to /auth/login.
export function GateScreen({ title }: { title: string }) {
  const t = useTranslations("gate");
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-4 bg-white px-8 pb-24 text-center dark:bg-ink-950">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-100 text-accent-600 dark:bg-accent-500/15">
        <Lock className="h-9 w-9" aria-hidden="true" />
      </span>
      <h1 className="text-[20px] font-900 text-ink-900 dark:text-white">{t("title", { title })}</h1>
      <p className="max-w-[280px] text-[15px] font-700 text-ink-400">{t("body")}</p>
      <Link
        href="/auth/login"
        className="mt-1 flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent-500 px-6 text-[16px] font-900 text-accent-ink shadow-cta transition-colors hover:bg-accent-400"
      >
        <LogIn className="h-5 w-5" aria-hidden="true" />
        {t("cta")}
      </Link>
    </div>
  );
}
