import * as Sentry from "@sentry/nextjs";

// Client-side Sentry. Fully inert unless NEXT_PUBLIC_SENTRY_DSN is set — this
// file is only injected into the bundle when withSentryConfig is applied in
// next.config.mjs (which itself only happens when a DSN is configured).
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: !!dsn,
  tracesSampleRate: 0.1,
});
