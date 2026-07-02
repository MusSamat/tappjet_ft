import * as Sentry from "@sentry/nextjs";

// Edge runtime Sentry (middleware / edge routes). Same DSN gate as the server
// config — inert unless a DSN is configured.
const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: !!dsn,
  tracesSampleRate: 0.1,
});
