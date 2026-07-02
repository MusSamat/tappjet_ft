"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { getSocket } from "@/lib/socket/client";
import { useAuth } from "@/store/auth";
import { pushToast } from "@/components/layout/quick-toast";

export function NotificationListener() {
  const isAuthenticated = useAuth((s) => s.status === "authenticated");
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const t = useTranslations("notif_toast");

  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = getSocket();

    const invalidateNotifications = () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    const invalidateBookings = () => {
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["bookings-my-all"] });
    };

    const onNewMessage = (data: { message?: { bookingId?: string; text?: string } }) => {
      void queryClient.invalidateQueries({ queryKey: ["bookings-my-all"] });
      const bookingId = data?.message?.bookingId;
      const chatPath = bookingId ? `/my/bookings/${bookingId}/chat` : null;
      if (chatPath && !pathname.startsWith(chatPath)) {
        pushToast({
          type: "chat_message",
          title: t("new_message_title"),
          body: data.message?.text?.slice(0, 80) ?? "...",
        });
      }
    };

    const onBookingNewRequest = (data: {
      booking: { id: string; seatsCount: number };
      trip: { originCity: string; destinationCity: string };
      passengerName: string;
      passengerRating: number | null;
    }) => {
      invalidateBookings();
      invalidateNotifications();
      const { passengerName, trip } = data;
      pushToast({
        type: "booking_request",
        title: t("new_request_title"),
        body: passengerName
          ? t("new_request_body", {
              name: passengerName,
              from: trip.originCity,
              to: trip.destinationCity,
            })
          : `${trip.originCity} → ${trip.destinationCity}`,
      });
    };

    const onBookingAccepted = () => {
      invalidateBookings();
      invalidateNotifications();
      pushToast({ type: "booking_accepted", title: t("accepted_title"), body: t("accepted_body") });
    };

    const onBookingRequestConfirmed = (data: { passengerName?: string }) => {
      invalidateBookings();
      invalidateNotifications();
      const name = data?.passengerName;
      pushToast({
        type: "booking_accepted",
        title: t("accepted_title"),
        body: name ? t("confirmed_body", { name }) : t("confirmed_body_fallback"),
      });
    };

    const onBookingRejected = () => {
      invalidateBookings();
      invalidateNotifications();
      pushToast({ type: "booking_rejected", title: t("rejected_title"), body: t("rejected_body") });
    };

    const onBookingCancelled = (data: { cancelledBy?: "driver" | "passenger" }) => {
      invalidateBookings();
      invalidateNotifications();
      const body = data?.cancelledBy === "driver"
        ? t("cancelled_body_driver")
        : t("cancelled_body");
      pushToast({ type: "booking_cancelled", title: t("cancelled_title"), body });
    };

    const onBookingExpired = () => {
      invalidateBookings();
      invalidateNotifications();
      pushToast({ type: "booking_expired", title: t("expired_title"), body: t("expired_body") });
    };

    const onTripCancelled = (data: { originCity?: string; destinationCity?: string }) => {
      invalidateBookings();
      invalidateNotifications();
      const route = data?.originCity && data?.destinationCity
        ? `${data.originCity} → ${data.destinationCity}`
        : null;
      pushToast({
        type: "booking_cancelled",
        title: t("trip_cancelled_title"),
        body: t("trip_cancelled_body", { route: route ? ` · ${route}` : "" }),
      });
    };

    const onRequestResponseReceived = (data: { driverName?: string; price?: number }) => {
      void queryClient.invalidateQueries({ queryKey: ["request-responses"] });
      void queryClient.invalidateQueries({ queryKey: ["passenger-requests"] });
      invalidateNotifications();
      const { driverName, price } = data ?? {};
      pushToast({
        type: "booking_request",
        title: t("offer_title"),
        body: driverName
          ? t("offer_body", { name: driverName, price: price ? t("offer_price", { price }) : "" })
          : t("offer_body_fallback"),
      });
    };

    const onRequestResponseAccepted = (data: { passengerName?: string }) => {
      void queryClient.invalidateQueries({ queryKey: ["request-responses"] });
      invalidateBookings();
      invalidateNotifications();
      const name = data?.passengerName;
      pushToast({
        type: "booking_accepted",
        title: t("offer_accepted_title"),
        body: name ? t("offer_accepted_body", { name }) : t("offer_accepted_body_fallback"),
      });
    };

    const onRequestResponseDeclined = () => {
      void queryClient.invalidateQueries({ queryKey: ["request-responses"] });
      invalidateNotifications();
      pushToast({
        type: "booking_rejected",
        title: t("offer_declined_title"),
        body: t("offer_declined_body"),
      });
    };

    socket.on("notification:new", invalidateNotifications);
    socket.on("booking:new_request", onBookingNewRequest);
    socket.on("booking:accepted", onBookingAccepted);
    socket.on("booking:request_confirmed", onBookingRequestConfirmed);
    socket.on("booking:rejected", onBookingRejected);
    socket.on("booking:cancelled", onBookingCancelled);
    socket.on("booking:expired", onBookingExpired);
    socket.on("trip:cancelled", onTripCancelled);
    socket.on("chat:message", onNewMessage);
    socket.on("request:response_received", onRequestResponseReceived);
    socket.on("request:response_accepted", onRequestResponseAccepted);
    socket.on("request:response_declined", onRequestResponseDeclined);

    return () => {
      socket.off("notification:new", invalidateNotifications);
      socket.off("booking:new_request", onBookingNewRequest);
      socket.off("booking:accepted", onBookingAccepted);
      socket.off("booking:request_confirmed", onBookingRequestConfirmed);
      socket.off("booking:rejected", onBookingRejected);
      socket.off("booking:cancelled", onBookingCancelled);
      socket.off("booking:expired", onBookingExpired);
      socket.off("trip:cancelled", onTripCancelled);
      socket.off("chat:message", onNewMessage);
      socket.off("request:response_received", onRequestResponseReceived);
      socket.off("request:response_accepted", onRequestResponseAccepted);
      socket.off("request:response_declined", onRequestResponseDeclined);
    };
  }, [isAuthenticated, queryClient, pathname, t]);

  return null;
}
