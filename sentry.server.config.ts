import * as Sentry from "@sentry/nextjs";

// Server-side Sentry (Node runtime). Loaded from instrumentation.ts, which
// only runs when the instrumentation hook is enabled — and that only happens
// when a DSN is configured. Inert otherwise.
const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: !!dsn,
  tracesSampleRate: 0.1,
});
