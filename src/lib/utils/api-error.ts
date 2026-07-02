// Maps backend error codes + reason details to user-friendly messages.
// Priority: details.reason > error code > server message field.
// The message dictionaries live in messages/{ru,kg}.json under the
// `api_errors.*` (reason) and `api_error_codes.*` (code) namespaces.
// friendlyError resolves them through an optional translator so it also works
// outside React — without a translator it falls back to the server's message.

export type ErrorShape = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

/** Resolves a message from a namespace/key, or undefined if absent. */
export type ErrorTranslate = (
  namespace: "api_errors" | "api_error_codes",
  key: string,
) => string | undefined;

export function friendlyError(err: ErrorShape, translate?: ErrorTranslate): string {
  const reason = err.details?.reason as string | undefined;
  if (translate) {
    if (reason) {
      const byReason = translate("api_errors", reason);
      if (byReason) return byReason;
    }
    const byCode = translate("api_error_codes", err.code);
    if (byCode) return byCode;
  }
  return err.message;
}
