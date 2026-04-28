"use client";

import { useTranslations } from "next-intl";
import {
  Bell, CheckCircle,
  Car, Star, AlertCircle, Shield,
} from "lucide-react";
import { type UseMutationResult } from "@tanstack/react-query";
import { type AppNotification } from "@/lib/api/notifications";
import { cn } from "@/lib/utils/cn";

const NOTIF_ICON_MAP: Record<string, { icon: React.ElementType; color: string }> = {
  new_booking_request:             { icon: Car,          color: "text-teal-600" },
  booking_accepted:                { icon: CheckCircle,  color: "text-teal-600" },
  booking_rejected:                { icon: AlertCircle,  color: "text-red-500"  },
  booking_expired:                 { icon: AlertCircle,  color: "text-amber-500" },
  booking_cancelled_by_passenger:  { icon: AlertCircle,  color: "text-red-500"  },
  booking_cancelled_by_driver:     { icon: AlertCircle,  color: "text-red-500"  },
  trip_cancelled:                  { icon: Car,          color: "text-red-500"  },
  rating_received:                 { icon: Star,         color: "text-amber-500" },
  rating_warning:                  { icon: AlertCircle,  color: "text-red-500"  },
  verification_approved:           { icon: CheckCircle,  color: "text-teal-600" },
  verification_rejected:           { icon: AlertCircle,  color: "text-red-500"  },
  security_alert_reuse:            { icon: Shield,       color: "text-red-500"  },
};

interface NotificationsTabProps {
  notifications: AppNotification[];
  readMut: UseMutationResult<unknown, unknown, string, unknown>;
}

export function NotificationsTab({ notifications, readMut }: NotificationsTabProps) {
  const t = useTranslations("quick_actions");

  const NOTIF_LABEL: Record<string, string> = {
    new_booking_request:            t("notif_new_request"),
    booking_accepted:               t("notif_accepted"),
    booking_rejected:               t("notif_rejected"),
    booking_expired:                t("notif_expired"),
    booking_cancelled_by_passenger: t("notif_cancelled_passenger"),
    booking_cancelled_by_driver:    t("notif_cancelled_driver"),
    trip_cancelled:                 t("notif_trip_cancelled"),
    rating_received:                t("notif_rating_received"),
    rating_warning:                 t("notif_rating_warning"),
    verification_approved:          t("notif_verif_approved"),
    verification_rejected:          t("notif_verif_rejected"),
    security_alert_reuse:           t("notif_security_alert"),
  };

  function notifBody(n: AppNotification): string {
    const p = n.payload as Record<string, unknown>;
    const str = (k: string) => (p[k] as string | undefined) ?? "";
    switch (n.type) {
      case "new_booking_request":
        return str("passengerName")
          ? `${str("passengerName")}: ${str("originCity")} → ${str("destinationCity")}`
          : `${str("originCity")} → ${str("destinationCity")}`;
      case "booking_accepted":    return t("notif_body_accepted");
      case "booking_rejected":    return t("notif_body_rejected");
      case "booking_expired":     return t("notif_body_expired");
      case "booking_cancelled_by_passenger": return t("notif_body_cancelled_passenger");
      case "booking_cancelled_by_driver":    return t("notif_body_cancelled_driver");
      case "trip_cancelled":      return t("notif_body_trip_cancelled");
      case "rating_received":     return `${str("raterName")} ${t("notif_body_rating_received")} ★ ${p.score ?? ""}`;
      case "rating_warning":      return `${t("notif_body_rating_warning")} ${(p.rating as number | undefined)?.toFixed(1) ?? ""}`;
      case "verification_approved": return t("notif_body_verif_approved");
      case "verification_rejected": return str("reason") || t("notif_body_verif_rejected");
      case "security_alert_reuse":  return t("notif_body_security_alert");
      default: return n.type.replace(/_/g, " ");
    }
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
        <Bell className="h-8 w-8 text-gray-200" />
        <p className="text-[12px] font-semibold text-gray-400">{t("no_notifications")}</p>
      </div>
    );
  }

  return (
    <>
      {notifications.map((n) => {
        const iconCfg = NOTIF_ICON_MAP[n.type] ?? { icon: Bell, color: "text-gray-500" };
        const Icon = iconCfg.icon;
        const label = NOTIF_LABEL[n.type] ?? n.type;
        return (
          <button
            key={n.id}
            type="button"
            onClick={() => { if (!n.readAt) readMut.mutate(n.id); }}
            className="flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-left last:border-0 hover:bg-gray-50"
          >
            <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
              <Icon className={cn("h-4 w-4", iconCfg.color)} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-gray-900">{label}</p>
              <p className="mt-0.5 truncate text-[11px] text-gray-500">{notifBody(n)}</p>
            </div>
            {!n.readAt && (
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-teal-500" />
            )}
          </button>
        );
      })}
    </>
  );
}
