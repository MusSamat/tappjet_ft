"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

/**
 * Wraps page content and reserves bottom clearance for the floating mobile
 * bottom-nav — but only where nothing else already does.
 *   - home "/": the footer renders on mobile and carries its own nav clearance,
 *     so no extra pad here (keeps the bottom compact, no double gap).
 *   - chat: manages its own full-height layout (chat-page-wrapper).
 *   - everything else: app screens with no footer on mobile → pad clears the nav.
 * On desktop the pad is a no-op (`md:pb-0`).
 */
export function MainRegion({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // /onboarding fills its own 100dvh and clears the nav itself — adding the
  // 96px main pad on top of that would overflow the viewport and force a scroll.
  const selfManaged =
    pathname === "/" || pathname.includes("/chat") || pathname === "/onboarding";
  return <main className={cn(!selfManaged && "main-mobile-pad")}>{children}</main>;
}
