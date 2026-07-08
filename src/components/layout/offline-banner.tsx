"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Wifi, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

const RESTORED_FLASH_MS = 2600;

/**
 * Slim connectivity banner (design spec §3.9). Fixed at the top of the
 * viewport (below the desktop header), driven by window online/offline
 * events. On reconnect it flashes a brand "restored" state and invalidates
 * all queries so stale screens refresh.
 */
export function OfflineBanner() {
  const t = useTranslations("offline");
  const queryClient = useQueryClient();
  const [offline, setOffline] = useState(false);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    if (!navigator.onLine) setOffline(true);

    const handleOffline = () => {
      setOffline(true);
      setRestored(false);
    };
    const handleOnline = () => {
      setOffline(false);
      setRestored(true);
      void queryClient.invalidateQueries();
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [queryClient]);

  useEffect(() => {
    if (!restored) return;
    const timer = setTimeout(() => setRestored(false), RESTORED_FLASH_MS);
    return () => clearTimeout(timer);
  }, [restored]);

  if (!offline && !restored) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-800 text-white md:top-16",
        offline ? "bg-ink-800 dark:bg-ink-700" : "bg-brand-600",
      )}
    >
      {offline ? (
        <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
      ) : (
        <Wifi className="h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      <span>{offline ? t("no_connection") : t("restored")}</span>
    </div>
  );
}
