"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Spinner } from "@/components/ui";
import { useAuth } from "@/store/auth";
import { NotificationListener } from "@/components/layout/notification-listener";
import { GateScreen } from "@/components/features/auth/gate-screen";

function useGateTitle(): string {
  const t = useTranslations("gate");
  const pathname = usePathname();
  if (pathname.includes("/create")) return t("titles.create");
  if (pathname.includes("/chat")) return t("titles.chat");
  if (pathname.startsWith("/notifications")) return t("titles.notifications");
  if (pathname.startsWith("/profile")) return t("titles.profile");
  if (pathname.startsWith("/my")) return t("titles.my");
  return t("titles.default");
}

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const status = useAuth((s) => s.status);
  const gateTitle = useGateTitle();

  // Failsafe: if the auth bootstrap never resolves (hung refresh / thrown boot),
  // don't strand the user on an infinite spinner — after a timeout show the
  // login gate instead of a blank spinning protected page.
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (status === "authenticated" || status === "anonymous") {
      setTimedOut(false);
      return;
    }
    const id = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(id);
  }, [status]);

  if (status === "authenticated") {
    return (
      <>
        <NotificationListener />
        {children}
      </>
    );
  }

  if (status === "anonymous" || timedOut) return <GateScreen title={gateTitle} />;

  return (
    <div className="container flex min-h-[60vh] items-center justify-center">
      <Spinner size={32} />
    </div>
  );
}
