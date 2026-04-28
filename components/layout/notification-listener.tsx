"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { getSocket } from "@/lib/socket/client";
import { useAuth } from "@/store/auth";
import { pushToast } from "@/components/layout/quick-toast";

export function NotificationListener() {
  const isAuthenticated = useAuth((s) => s.status === "authenticated");
  const queryClient = useQueryClient();
  const pathname = usePathname();

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
          title: "Новое сообщение",
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
        title: "Новая заявка на поездку",
        body: passengerName
          ? `${passengerName} хочет поехать с вами (${trip.originCity} → ${trip.destinationCity})`
          : `${trip.originCity} → ${trip.destinationCity}`,
      });
    };

    const onBookingAccepted = () => {
      invalidateBookings();
      invalidateNotifications();
      pushToast({ type: "booking_accepted", title: "Заявка принята", body: "Водитель принял вашу заявку" });
    };

    const onBookingRequestConfirmed = (data: { passengerName?: string }) => {
      invalidateBookings();
      invalidateNotifications();
      const name = data?.passengerName;
      pushToast({
        type: "booking_accepted",
        title: "Заявка принята",
        body: name ? `Вы приняли заявку от ${name}` : "Вы приняли заявку на поездку",
      });
    };

    const onBookingRejected = () => {
      invalidateBookings();
      invalidateNotifications();
      pushToast({ type: "booking_rejected", title: "Заявка отклонена", body: "Водитель отклонил вашу заявку" });
    };

    const onBookingCancelled = (data: { cancelledBy?: "driver" | "passenger" }) => {
      invalidateBookings();
      invalidateNotifications();
      const body = data?.cancelledBy === "driver"
        ? "Водитель отменил бронирование"
        : "Бронирование отменено";
      pushToast({ type: "booking_cancelled", title: "Бронирование отменено", body });
    };

    const onBookingExpired = () => {
      invalidateBookings();
      invalidateNotifications();
      pushToast({ type: "booking_expired", title: "Заявка истекла", body: "Время ответа на заявку истекло" });
    };

    const onTripCancelled = (data: { originCity?: string; destinationCity?: string }) => {
      invalidateBookings();
      invalidateNotifications();
      const route = data?.originCity && data?.destinationCity
        ? `${data.originCity} → ${data.destinationCity}`
        : null;
      pushToast({
        type: "booking_cancelled",
        title: "Поездка отменена",
        body: route ? `Водитель отменил поездку · ${route}` : "Водитель отменил поездку",
      });
    };

    const onRequestResponseReceived = (data: { driverName?: string; price?: number }) => {
      void queryClient.invalidateQueries({ queryKey: ["request-responses"] });
      void queryClient.invalidateQueries({ queryKey: ["passenger-requests"] });
      invalidateNotifications();
      const { driverName, price } = data ?? {};
      pushToast({
        type: "booking_request",
        title: "Новое предложение",
        body: driverName
          ? `${driverName} предлагает поездку${price ? ` за ${price} сом` : ""}`
          : "Водитель откликнулся на вашу заявку",
      });
    };

    const onRequestResponseAccepted = (data: { passengerName?: string }) => {
      void queryClient.invalidateQueries({ queryKey: ["request-responses"] });
      invalidateBookings();
      invalidateNotifications();
      const name = data?.passengerName;
      pushToast({
        type: "booking_accepted",
        title: "Предложение принято",
        body: name
          ? `${name} принял ваше предложение — откройте чат`
          : "Пассажир принял ваше предложение",
      });
    };

    const onRequestResponseDeclined = () => {
      void queryClient.invalidateQueries({ queryKey: ["request-responses"] });
      invalidateNotifications();
      pushToast({
        type: "booking_rejected",
        title: "Предложение отклонено",
        body: "Пассажир отклонил ваше предложение",
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
  }, [isAuthenticated, queryClient, pathname]);

  return null;
}
