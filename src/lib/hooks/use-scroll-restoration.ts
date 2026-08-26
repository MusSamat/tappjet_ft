"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Restores window scroll position when returning to a feed (e.g. back from a
// detail page). React Query keeps the loaded pages in cache, so the list
// re-renders at full height immediately; we re-apply the saved scrollTop as a
// sessionStorage fallback keyed by pathname + search.
export function useScrollRestoration(enabled = true): void {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const key = `terme_scroll_${pathname}?${search.toString()}`;

    const saved = sessionStorage.getItem(key);
    let raf = 0;
    if (saved) {
      const top = Number(saved) || 0;
      // Wait a frame so cached list content has painted before we jump.
      raf = window.requestAnimationFrame(() => window.scrollTo(0, top));
    }

    const save = () => sessionStorage.setItem(key, String(window.scrollY));
    window.addEventListener("scroll", save, { passive: true });

    return () => {
      window.cancelAnimationFrame(raf);
      save();
      window.removeEventListener("scroll", save);
    };
  }, [enabled, pathname, search]);
}
