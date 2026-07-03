"use client";

import { useEffect, useState } from "react";

// visualViewport height lost vs the tallest height seen at the current
// viewport width. Software keyboards are ≥150px; URL-bar collapse is ~56px.
const KEYBOARD_MIN_PX = 150;
// Re-check delay after focus changes — lets the keyboard animation and the
// final visualViewport resize settle (iOS sometimes skips that resize).
const FOCUS_SETTLE_MS = 250;

/**
 * True while the on-screen keyboard is (very likely) open.
 *
 * Signals combined so the state can never get stuck:
 * - window.visualViewport `resize` + `scroll`: height loss vs a baseline that
 *   only heals upward (max height seen at the current width; width change =
 *   orientation/pinch-zoom → baseline restarts). Works both when the keyboard
 *   overlays content (iOS Safari) and when it resizes the layout viewport
 *   (interactive-widget=resizes-content), where `innerHeight - vv.height`
 *   stays ~0.
 * - document `focusin`/`focusout` (bubbles from portals/modals too): "open"
 *   is only ever reported while a text control is focused, and every focus
 *   change re-checks shortly after — covers iOS dismissing the keyboard
 *   without a final resize and modals unmounting mid-typing.
 */
export function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const vv = window.visualViewport;
    let baseHeight = Math.max(vv.height, window.innerHeight);
    let baseWidth = vv.width;
    let settleTimer: number | undefined;

    const isTextControl = (el: Element | null): boolean =>
      !!el &&
      (el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.tagName === "SELECT" ||
        (el as HTMLElement).isContentEditable);

    const update = () => {
      if (Math.abs(vv.width - baseWidth) > 1) {
        // Orientation change or pinch-zoom — restart the baseline.
        baseWidth = vv.width;
        baseHeight = Math.max(vv.height, window.innerHeight);
      } else {
        // Baseline only heals upward: tallest height seen at this width.
        baseHeight = Math.max(baseHeight, vv.height, window.innerHeight);
      }
      const shrunk = baseHeight - vv.height > KEYBOARD_MIN_PX;
      setOpen(shrunk && isTextControl(document.activeElement));
    };

    const onFocusChange = () => {
      window.clearTimeout(settleTimer);
      update();
      settleTimer = window.setTimeout(update, FOCUS_SETTLE_MS);
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    document.addEventListener("focusin", onFocusChange);
    document.addEventListener("focusout", onFocusChange);
    return () => {
      window.clearTimeout(settleTimer);
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      document.removeEventListener("focusin", onFocusChange);
      document.removeEventListener("focusout", onFocusChange);
    };
  }, []);

  return open;
}
