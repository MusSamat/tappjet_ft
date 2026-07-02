"use client";

import { useReportWebVitals } from "next/web-vitals";

// Core Web Vitals reporter. Zero-cost when nothing is configured:
//   - dev: logs LCP/INP/CLS/etc. to the console
//   - prod: POSTs a beacon to NEXT_PUBLIC_WEB_VITALS_URL when that env is set
//     (TODO: point this at the real analytics sink). When Sentry is enabled it
//     also captures these automatically via performance tracing.
export function WebVitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console -- intentional dev-only diagnostics
      console.log(`[web-vitals] ${metric.name}: ${Math.round(metric.value)}`, metric);
      return;
    }

    const url = process.env.NEXT_PUBLIC_WEB_VITALS_URL;
    if (!url) return;

    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      rating: metric.rating,
      navigationType: metric.navigationType,
    });

    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(url, body);
    } else {
      void fetch(url, { method: "POST", body, keepalive: true });
    }
  });

  return null;
}
