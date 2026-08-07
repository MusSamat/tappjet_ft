"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

// Pull-to-refresh for the window-scrolled feeds (mobile mini-app gesture).
// Engages only when the page is at the very top; a finger-drag down past the
// threshold rubber-bands the content and, on release, awaits `onRefresh`.
const THRESHOLD = 72; // px of pull needed to trigger a refresh
const MAX_PULL = 110; // px cap for the rubber-band
const RESISTANCE = 0.5; // drag-to-travel ratio

interface Props {
  onRefresh: () => Promise<unknown>;
  children: ReactNode;
  /** Disable on desktop / where the gesture shouldn't apply. */
  disabled?: boolean;
}

export function PullToRefresh({ onRefresh, children, disabled }: Props) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Mutable mirrors so the window listeners never need re-subscribing.
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);
  const startY = useRef<number | null>(null);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    if (disabled) return;
    const set = (v: number) => {
      pullRef.current = v;
      setPull(v);
    };

    const onStart = (e: TouchEvent) => {
      if (refreshingRef.current || window.scrollY > 0) {
        startY.current = null;
        return;
      }
      startY.current = e.touches[0]?.clientY ?? null;
    };
    const onMove = (e: TouchEvent) => {
      if (startY.current === null || refreshingRef.current) return;
      const dy = (e.touches[0]?.clientY ?? 0) - startY.current;
      if (dy <= 0 || window.scrollY > 0) {
        if (window.scrollY > 0) startY.current = null;
        set(0);
        return;
      }
      set(Math.min(MAX_PULL, dy * RESISTANCE));
      if (e.cancelable) e.preventDefault(); // suppress native overscroll while pulling
    };
    const onEnd = async () => {
      if (startY.current === null) return;
      startY.current = null;
      if (pullRef.current >= THRESHOLD) {
        refreshingRef.current = true;
        setRefreshing(true);
        set(THRESHOLD); // hold at the threshold while the spinner runs
        try {
          await onRefreshRef.current();
        } finally {
          refreshingRef.current = false;
          setRefreshing(false);
          set(0);
        }
      } else {
        set(0);
      }
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [disabled]);

  const progress = Math.min(1, pull / THRESHOLD);
  const show = pull > 0 || refreshing;
  const snap = pull === 0; // animate the release, but track the finger 1:1

  return (
    <>
      <div
        aria-hidden={!refreshing}
        className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center"
        style={{
          transform: `translateY(${show ? pull : 0}px)`,
          opacity: show ? 1 : 0,
          transition: snap ? "transform .2s ease, opacity .2s ease" : "none",
        }}
      >
        <div className="mt-2 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-card dark:bg-ink-800">
          <Loader2
            className={`h-5 w-5 text-brand-500 ${refreshing ? "animate-spin" : ""}`}
            style={
              refreshing
                ? undefined
                : { transform: `rotate(${progress * 270}deg)`, opacity: 0.4 + progress * 0.6 }
            }
            aria-hidden="true"
          />
        </div>
      </div>
      <div
        style={{
          transform: show ? `translateY(${pull}px)` : undefined,
          transition: snap ? "transform .2s ease" : "none",
        }}
      >
        {children}
      </div>
    </>
  );
}
