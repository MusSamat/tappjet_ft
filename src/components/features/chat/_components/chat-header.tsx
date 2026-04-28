"use client";

import Link from "next/link";
import { ArrowLeft, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { DriverAvatar } from "@/components/ui";

interface Props {
  otherUserId?: string;
  otherName: string;
  otherAvatarUrl: string | null;
  otherPhone?: string;
  bookingStatus?: string;
  tripRoute?: string;
  connected: boolean;
  typingUserId: string | null;
}

export function ChatHeader({
  otherUserId,
  otherName,
  otherAvatarUrl,
  otherPhone,
  bookingStatus,
  tripRoute,
  connected,
  typingUserId,
}: Props) {
  const t = useTranslations("chat");

  const subtitle = tripRoute
    ? tripRoute
    : connected
      ? (typingUserId ? t("typing") : t("online"))
      : t("connecting");

  const nameBlock = (
    <>
      <DriverAvatar name={otherName} src={otherAvatarUrl} size="sm" />
      <div className="min-w-0">
        <p className="text-[15px] font-extrabold text-gray-900">{otherName}</p>
        <p className="text-[12px] font-semibold text-gray-500">{subtitle}</p>
      </div>
    </>
  );

  return (
    <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5">
      <div className="flex items-center gap-3">
        <Link
          href="/my/bookings"
          aria-label={t("back")}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 lg:hidden"
        >
          <ArrowLeft className="h-5 w-5 text-gray-900" aria-hidden="true" />
        </Link>
        {otherUserId ? (
          <Link href={`/drivers/${otherUserId}`} className="flex items-center gap-3 hover:opacity-80">
            {nameBlock}
          </Link>
        ) : (
          <div className="flex items-center gap-3">{nameBlock}</div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {otherPhone && bookingStatus === "accepted" && (
          <a
            href={`tel:${otherPhone}`}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-[12px] font-bold text-gray-700 hover:bg-gray-50"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            {otherPhone}
          </a>
        )}
      </div>
    </div>
  );
}
