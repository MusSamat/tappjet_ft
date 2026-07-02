"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

// Floating «наверх» button — appears after ~3 viewport-heights of scroll and
// smooth-scrolls to the top (respecting prefers-reduced-motion). Window-scroll
// based. On the trips/requests feeds the desktop columns scroll internally, so
// it's mobile-only there; set `showOnDesktop` for window-scrolling pages.
export function BackToTop({ showOnDesktop = false }: { showOnDesktop?: boolean }) {
  const t = useTranslations("common");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 3);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label={t("back_to_top")}
      className={cn(
        "fixed bottom-24 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink-700 shadow-lift ring-1 ring-ink-100 transition-colors hover:bg-ink-50 dark:bg-ink-800 dark:text-ink-100 dark:ring-ink-700 dark:hover:bg-ink-700",
        !showOnDesktop && "lg:hidden",
        showOnDesktop && "lg:bottom-8",
      )}
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
