import { Bell, Star, Car, CheckCircle, AlertCircle, MessageCircle, Users, Clock } from "lucide-react";
import type { AppNotification } from "@/lib/api/notifications";

export const TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  new_booking_request:            { icon: Car,           label: "Новый запрос на бронь",       color: "text-teal-600" },
  booking_accepted:               { icon: CheckCircle,   label: "Бронь подтверждена",           color: "text-teal-600" },
  booking_request_confirmed:      { icon: CheckCircle,   label: "Заявка принята",                color: "text-teal-600" },
  booking_rejected:               { icon: AlertCircle,   label: "Бронь отклонена",              color: "text-red-500"  },
  booking_expired:                { icon: AlertCircle,   label: "Бронь истекла",                color: "text-red-500"  },
  booking_cancelled_by_passenger: { icon: AlertCircle,   label: "Пассажир отменил бронь",       color: "text-red-500"  },
  booking_cancelled_by_driver:    { icon: AlertCircle,   label: "Водитель отменил бронь",       color: "text-red-500"  },
  trip_cancelled:                 { icon: Car,           label: "Поездка отменена",             color: "text-red-500"  },
  trip_reminder:                  { icon: Clock,         label: "Скоро отправление",            color: "text-sky-600"  },
  trip_completed_rate:            { icon: Star,          label: "Оцените поездку",              color: "text-amber-500"},
  request_response_received:      { icon: Users,         label: "Новое предложение",            color: "text-sky-600"  },
  request_response_accepted:      { icon: CheckCircle,   label: "Предложение принято",          color: "text-teal-600" },
  request_response_declined:      { icon: AlertCircle,   label: "Предложение отклонено",        color: "text-red-500"  },
  new_message:                    { icon: MessageCircle, label: "Новое сообщение",              color: "text-teal-600" },
  rating_received:                { icon: Star,          label: "Новая оценка",                 color: "text-amber-500"},
  rating_warning:                 { icon: AlertCircle,   label: "Рейтинг снизился",             color: "text-red-500"  },
  verification_approved:          { icon: CheckCircle,   label: "Верификация одобрена",         color: "text-teal-600" },
  verification_rejected:          { icon: AlertCircle,   label: "Верификация отклонена",        color: "text-red-500"  },
  verification_need_docs:         { icon: AlertCircle,   label: "Нужны документы",              color: "text-amber-500"},
  account_blocked:                { icon: AlertCircle,   label: "Аккаунт заблокирован",         color: "text-red-500"  },
  loyalty_tier_changed:           { icon: Star,          label: "Новый уровень лояльности",     color: "text-amber-500"},
  security_alert_reuse:           { icon: AlertCircle,   label: "Предупреждение безопасности",  color: "text-red-500"  },
};

export const ACTION_TYPES = new Set([
  "new_booking_request",
  "booking_accepted",
  "booking_request_confirmed",
  "request_response_received",
  "request_response_accepted",
]);

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export function buildBody(notif: AppNotification): string {
  const p = notif.payload as Record<string, unknown>;
  const str = (key: string) => (p[key] as string | undefined) ?? "";

  switch (notif.type) {
    case "new_booking_request": {
      const name = str("passengerName");
      const from = str("originCity");
      const to = str("destinationCity");
      const seats = p["seatsCount"] as number | undefined;
      return name
        ? `${name} хочет поехать с вами${from && to ? ` · ${from} → ${to}` : ""}${seats ? ` · ${seats} мест` : ""}`
        : "Новый запрос на бронирование";
    }
    case "booking_accepted": {
      const booking = p["booking"] as Record<string, unknown> | undefined;
      const trip = booking?.["trip"] as Record<string, unknown> | undefined;
      const driver = trip?.["driver"] as Record<string, unknown> | undefined;
      const from = trip?.["originCity"] as string | undefined;
      const to = trip?.["destinationCity"] as string | undefined;
      const driverName = driver?.["name"] as string | undefined;
      return driverName
        ? `${driverName} принял вашу бронь${from && to ? ` · ${from} → ${to}` : ""}`
        : "Водитель подтвердил вашу бронь";
    }
    case "booking_request_confirmed": {
      const name = str("passengerName");
      return name
        ? `Вы приняли заявку от ${name} — чат открыт`
        : "Вы приняли заявку на поездку";
    }
    case "booking_rejected": {
      const booking = p["booking"] as Record<string, unknown> | undefined;
      const trip = booking?.["trip"] as Record<string, unknown> | undefined;
      const from = trip?.["originCity"] as string | undefined;
      const to = trip?.["destinationCity"] as string | undefined;
      return from && to ? `Водитель отклонил бронь · ${from} → ${to}` : "Водитель отклонил вашу бронь";
    }
    case "booking_expired":
      return "Водитель не успел ответить на вашу заявку — попробуйте другую поездку";
    case "booking_cancelled_by_passenger": {
      const booking = p["booking"] as Record<string, unknown> | undefined;
      const trip = booking?.["trip"] as Record<string, unknown> | undefined;
      const from = trip?.["originCity"] as string | undefined;
      const to = trip?.["destinationCity"] as string | undefined;
      return from && to ? `Пассажир отменил бронь · ${from} → ${to}` : "Пассажир отменил бронирование";
    }
    case "booking_cancelled_by_driver": {
      const booking = p["booking"] as Record<string, unknown> | undefined;
      const trip = booking?.["trip"] as Record<string, unknown> | undefined;
      const from = trip?.["originCity"] as string | undefined;
      const to = trip?.["destinationCity"] as string | undefined;
      return from && to ? `Водитель отменил бронь · ${from} → ${to}` : "Водитель отменил бронирование";
    }
    case "trip_cancelled": {
      const from = str("originCity");
      const to = str("destinationCity");
      return from && to ? `Поездка ${from} → ${to} отменена водителем` : "Водитель отменил поездку";
    }
    case "trip_reminder": {
      const from = str("origin_city");
      const to = str("destination_city");
      const dep = str("departure_at");
      return from && to
        ? `Поездка ${from} → ${to}${dep ? ` · ${fmtTime(dep)}` : ""} — не забудьте!`
        : "Напоминание о предстоящей поездке";
    }
    case "request_response_received": {
      const name = str("driverName");
      const price = p["price"] as number | undefined;
      const dep = str("departureTime");
      return name
        ? `${name} предлагает поездку${price ? ` за ${price} сом` : ""}${dep ? ` · ${fmtTime(dep)}` : ""}`
        : "Водитель откликнулся на вашу заявку";
    }
    case "request_response_accepted": {
      const name = str("passengerName");
      return name
        ? `${name} принял ваше предложение — откройте чат`
        : "Пассажир принял ваше предложение — откройте чат";
    }
    case "request_response_declined":
      return "Пассажир отклонил ваше предложение";
    case "new_message": {
      const preview = str("preview");
      return preview ? `«${preview}»` : "Новое сообщение в чате";
    }
    case "rating_received": {
      const rater = str("raterName");
      const score = p["score"] as number | undefined;
      return rater
        ? `${rater} оставил вам оценку${score ? ` ★ ${score}` : ""}`
        : "Вы получили новую оценку";
    }
    case "rating_warning":
      return `Ваш рейтинг опустился до ${(p["rating"] as number | undefined)?.toFixed(1) ?? "< 4.0"} — постарайтесь улучшить его`;
    case "verification_approved":
      return "Ваш профиль водителя прошёл верификацию — теперь вы можете публиковать поездки";
    case "verification_rejected":
      return str("reason") || "Документы не прошли проверку — проверьте причину и загрузите повторно";
    case "verification_need_docs": {
      const docs = (p["docs"] as string[] | undefined) ?? [];
      return docs.length ? `Загрузите недостающие документы: ${docs.join(", ")}` : "Загрузите недостающие документы";
    }
    case "account_blocked":
      return str("reason") || "Ваш аккаунт заблокирован — обратитесь в поддержку";
    case "loyalty_tier_changed":
      return str("tier") ? `Ваш уровень лояльности повышен до «${str("tier")}»` : "Ваш уровень лояльности изменён";
    case "security_alert_reuse":
      return "Обнаружена подозрительная активность — все устройства разлогинены для вашей защиты";
    case "trip_completed_rate": {
      const from = str("origin_city");
      const to = str("destination_city");
      return from && to ? `Оцените поездку ${from} → ${to}` : "Оцените завершённую поездку";
    }
    default:
      return "Уведомление";
  }
}

export function buildDeepLink(notif: AppNotification): string | null {
  const p = notif.payload as Record<string, unknown>;
  const booking = p["booking"] as { id?: string } | undefined;

  switch (notif.type) {
    case "new_booking_request":
    case "booking_request_confirmed":
      return "/my/bookings";
    case "booking_accepted": {
      const id = booking?.id ?? (p["bookingId"] as string | undefined);
      return id ? `/my/bookings/${id}/chat` : "/my/bookings";
    }
    case "booking_rejected":
    case "booking_expired":
    case "booking_cancelled_by_passenger":
    case "booking_cancelled_by_driver":
      return "/my/bookings";
    case "trip_cancelled":
      return "/trips";
    case "trip_reminder":
      return "/my/bookings";
    case "trip_completed_rate":
      return "/my/bookings";
    case "rating_received":
      return "/profile";
    case "new_message": {
      const msg = p["message"] as { bookingId?: string } | undefined;
      return msg?.bookingId ? `/my/bookings/${msg.bookingId}/chat` : "/my/bookings";
    }
    case "request_response_received":
    case "request_response_accepted":
    case "request_response_declined":
      return "/my/requests";
    case "verification_approved":
    case "verification_rejected":
    case "verification_need_docs":
      return "/profile/driver";
    default:
      return null;
  }
}
