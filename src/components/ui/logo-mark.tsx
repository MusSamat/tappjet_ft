"use client";

import { useId } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Tappjet brand mark — exact geometry from the design prototype (tappjet-proto.js):
 * white paper-plane (two facets), amber point dot, two small white spark dots.
 * - default: on a teal-gradient rounded tile (nav / auth on light bg)
 * - plain:   no tile (white plane) — for the welcome frosted tile on the teal bg
 * Gradient id is per-instance (useId) so multiple marks on one page don't collide.
 */
export function LogoMark({
  className = "h-9 w-9",
  plain = false,
}: {
  className?: string;
  plain?: boolean;
}) {
  const id = useId();
  const grad = `tj-mark-${id}`;
  return (
    <svg viewBox="0 0 48 48" className={cn("shrink-0", className)} aria-hidden="true">
      {!plain && (
        <>
          <defs>
            <linearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#14B8A6" />
              <stop offset="1" stopColor="#0D9488" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="14" fill={`url(#${grad})`} />
        </>
      )}
      <g fill="#fff">
        <path d="M14.4 28.8 L35.5 12.5 L25.9 31.7 Z" opacity=".6" />
        <path d="M14.4 28.8 L35.5 12.5 L25 25 Z" />
      </g>
      <circle cx="12.5" cy="35.5" r="3.1" fill="#FBB924" />
      <circle cx="19" cy="30" r="1.5" fill="#fff" opacity=".7" />
      <circle cx="24" cy="24.5" r="1.5" fill="#fff" opacity=".7" />
    </svg>
  );
}

/** Two-tone «Tappjet» wordmark — «Tapp» ink, «jet» brand teal. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-disp font-900 leading-none", className)}>
      <span className="text-ink-900 dark:text-white">Tapp</span>
      <span className="text-brand-600 dark:text-brand-400">jet</span>
    </span>
  );
}
