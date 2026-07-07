"use client";

import Link from "next/link";
import { Download, LogOut, MonitorSmartphone, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { CarPhotoUploader } from "@/components/features/profile/car-photo-uploader";
import { ProfileForm } from "@/components/features/profile/profile-form";
import { PasswordForm } from "@/components/features/profile/password-form";
import { PhoneChangeForm } from "@/components/features/profile/phone-change-form";
import { Button, SectionLabel, Spinner } from "@/components/ui";
import type { UseMutationResult } from "@tanstack/react-query";

interface Props {
  isDriver: boolean;
  exportMutation: UseMutationResult<unknown, unknown, void, unknown>;
  logoutMutation: UseMutationResult<unknown, unknown, void, unknown>;
  logoutAllMutation: UseMutationResult<unknown, unknown, void, unknown>;
}

const CARD = "rounded-3xl bg-white p-5 shadow-card dark:bg-ink-900";
const CARD_HEAD = "mb-4 flex items-center gap-2 text-[14px] font-900 text-ink-900 dark:text-white";

export function SettingsTab({ isDriver, exportMutation, logoutMutation, logoutAllMutation }: Props) {
  const t = useTranslations("profile");

  return (
    <div className="flex flex-col gap-3.5">
      {/* Language & theme moved to the quick SettingsCard on the profile page
          itself — no duplicate controls here. */}

      {/* Personal data */}
      <div className={CARD}>
        <div className={CARD_HEAD}>{t("personal_section")}</div>
        <ProfileForm />
      </div>

      {isDriver && (
        <div className={CARD}>
          <div className={CARD_HEAD}>{t("car_photo_section")}</div>
          <CarPhotoUploader />
        </div>
      )}

      {/* Password */}
      <div className={CARD}>
        <div className={CARD_HEAD}>{t("password_section")}</div>
        <PasswordForm />
      </div>

      {/* Phone */}
      <div className={CARD}>
        <div className={CARD_HEAD}>{t("phone_section")}</div>
        <PhoneChangeForm />
      </div>

      {/* Session & account */}
      <div className={CARD}>
        <SectionLabel>{t("session_section")}</SectionLabel>
        <div className="mt-3 flex flex-col gap-2">
          <Button
            variant="invert"
            size="lg"
            className="w-full"
            onClick={() => logoutAllMutation.mutate()}
            disabled={logoutAllMutation.isPending}
          >
            {logoutAllMutation.isPending ? <Spinner size={16} /> : <MonitorSmartphone className="h-4 w-4" aria-hidden="true" />}
            {t("logout_all")}
          </Button>

          <Button
            variant="dangerSoft"
            size="lg"
            className="w-full"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? <Spinner size={16} /> : <LogOut className="h-4 w-4" aria-hidden="true" />}
            {t("logout_btn")}
          </Button>

          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-[13px] font-800 text-ink-500 hover:bg-ink-50 dark:hover:bg-ink-800"
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? <Spinner size={16} /> : <Download className="h-4 w-4" aria-hidden="true" />}
            {t("export_btn")}
          </button>

          <Link
            href="/profile/delete"
            className="flex items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-[13px] font-800 text-coral-600 hover:bg-coral-50 dark:hover:bg-coral-500/10"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {t("delete_btn")}
          </Link>
        </div>
      </div>
    </div>
  );
}
