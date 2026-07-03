/**
 * Open a Telegram bot deep-link (https://t.me/...?start=...) reliably.
 *
 * All our deep-links are opened AFTER an await (mutation onSuccess), i.e.
 * outside the original user gesture — mobile browsers (iOS Safari, Android
 * Chrome) popup-block `window.open` there, so Telegram never opened and the
 * bot never received /start automatically.
 *
 * Fix: on mobile, navigate the CURRENT tab via `location.href`. Same-tab
 * navigation is exempt from popup blocking, and the OS intercepts the t.me
 * universal/app link and bounces straight into the Telegram app without
 * unloading this page — so status polling keeps running. On desktop t.me is
 * a plain website, so same-tab navigation would kill the SPA (and polling);
 * there we keep `window.open` — every caller also renders a visible manual
 * "Open Telegram" link as a fallback in case a blocker eats it.
 */
export function openTelegramDeepLink(deepLink: string): void {
  if (typeof window === "undefined" || !deepLink) return;
  const ua = window.navigator.userAgent;
  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(ua) ||
    // iPadOS 13+ masquerades as macOS but is a touch device.
    (/Macintosh/i.test(ua) && window.navigator.maxTouchPoints > 1);
  if (isMobile) {
    window.location.href = deepLink;
  } else {
    window.open(deepLink, "_blank", "noopener,noreferrer");
  }
}
