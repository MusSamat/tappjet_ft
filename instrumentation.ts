// Next.js instrumentation hook. Only loaded when experimental.instrumentationHook
// is enabled in next.config.mjs, which is gated on a Sentry DSN being present —
// so with no DSN this module is never evaluated and adds zero overhead.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export { captureRequestError as onRequestError } from "@sentry/nextjs";
