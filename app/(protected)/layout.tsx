"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Spinner } from "@/components/ui";
import { useAuth } from "@/store/auth";
import { NotificationListener } from "@/components/layout/notification-listener";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "anonymous") router.replace("/auth/login");
  }, [status, router]);

  if (status === "authenticated") return <><NotificationListener />{children}</>;

  return (
    <div className="container flex min-h-[60vh] items-center justify-center">
      <Spinner size={32} />
    </div>
  );
}
