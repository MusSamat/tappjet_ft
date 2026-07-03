"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { useKeyboardOpen } from "@/lib/hooks/use-keyboard-open";
import { useUnreadCount } from "@/lib/hooks/use-unread-count";
import { useAuth } from "@/store/auth";
import { cn } from "@/lib/utils/cn";

// Floating notifications bell — the app's single floating action icon
// (the old floating chat FAB is gone; chats live in the bottom nav).
// Mobile only, authenticated only, visible on feed / my / profile
// (never on detail/create/chat). Draggable (chat-head style): follows the
// finger via Pointer Events, snaps to the nearest edge on release, position
// persists in localStorage. Tap / Enter / Space opens /notifications.
const SHOW_ON = ["/trips", "/requests", "/my/bookings", "/profile"];

const STORAGE_KEY = "tappjet_fab_pos";
const SIZE = 56; // h-14 w-14
const EDGE_MARGIN = 20; // snapped horizontal margin (matches old right-5)
const TOP_MIN = 72; // stay below the 64px top nav
const NAV_CLEARANCE = 96; // stay above the bottom nav (matches .main-mobile-pad)
const TAP_SLOP_PX = 8; // movement under this = tap, over = drag

type StoredPos = { side: "left" | "right"; yFrac: number };

function readStored(): StoredPos {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<StoredPos>;
      if ((p.side === "left" || p.side === "right") && typeof p.yFrac === "number") {
        return { side: p.side, yFrac: Math.min(Math.max(p.yFrac, 0), 1) };
      }
    }
  } catch {
    /* corrupted storage — fall through to default */
  }
  return { side: "right", yFrac: 1 }; // default: bottom-right, clamped above the nav
}

function safeBottomInset(): number {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--sai-bottom");
  return parseFloat(v) || 0;
}

function clampY(y: number): number {
  const max = window.innerHeight - SIZE - NAV_CLEARANCE - safeBottomInset();
  return Math.min(Math.max(y, TOP_MIN), Math.max(TOP_MIN, max));
}

export function FloatingBell() {
  const t = useTranslations("top_nav");
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuth((s) => s.status === "authenticated");
  const keyboardOpen = useKeyboardOpen();
  const { data: unread = 0 } = useUnreadCount();

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);

  // Restore persisted position on mount; re-clamp on resize/orientation change
  // so the bell never ends up off-screen. SSR-safe (effect only).
  const applyStored = useCallback(() => {
    const s = readStored();
    setPos({
      x: s.side === "left" ? EDGE_MARGIN : window.innerWidth - SIZE - EDGE_MARGIN,
      y: clampY(s.yFrac * window.innerHeight),
    });
  }, []);

  useEffect(() => {
    applyStored();
    window.addEventListener("resize", applyStored);
    return () => window.removeEventListener("resize", applyStored);
  }, [applyStored]);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!pos) return;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      baseX: pos.x,
      baseY: pos.y,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pointerId) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) > TAP_SLOP_PX) d.moved = true;
    if (!d.moved) return;
    setPos({
      x: Math.min(Math.max(d.baseX + dx, 8), window.innerWidth - SIZE - 8),
      y: Math.min(Math.max(d.baseY + dy, 8), window.innerHeight - SIZE - 8),
    });
  };

  const onPointerEnd = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    suppressClickRef.current = d.moved;
    if (!d.moved || !pos) return;
    // Snap to the nearest horizontal edge, clamp vertically, persist.
    const side: StoredPos["side"] = pos.x + SIZE / 2 < window.innerWidth / 2 ? "left" : "right";
    const y = clampY(pos.y);
    setPos({ x: side === "left" ? EDGE_MARGIN : window.innerWidth - SIZE - EDGE_MARGIN, y });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ side, yFrac: y / window.innerHeight }));
    } catch {
      /* storage unavailable — position just won't persist */
    }
  };

  const onClick = () => {
    // A drag release also fires click — only navigate on a real tap/Enter/Space.
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    router.push("/notifications");
  };

  if (!isAuthenticated || !SHOW_ON.includes(pathname) || keyboardOpen || !pos) return null;

  return (
    <button
      type="button"
      aria-label={t("notifications_aria")}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onClick={onClick}
      className={cn(
        "fixed left-0 top-0 z-50 flex h-14 w-14 touch-none select-none items-center justify-center rounded-full bg-brand-600 text-white shadow-xl hover:bg-brand-700 md:hidden",
        dragging ? "cursor-grabbing" : "transition-transform duration-200 ease-out",
      )}
      style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
    >
      <Bell className="h-6 w-6" aria-hidden="true" />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral-500 px-1 text-[10px] font-900 text-white ring-2 ring-white dark:ring-ink-900">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </button>
  );
}
