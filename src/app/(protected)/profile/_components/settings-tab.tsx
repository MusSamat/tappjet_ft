"use client";

import Link from "next/link";
import { Download, LogOut, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { CarPhotoUploader } from "@/components/features/profile/car-photo-uploader";
import { ProfileForm } from "@/components/features/profile/profile-form";
import { PasswordForm } from "@/components/features/profile/password-form";
import { PhoneChangeForm } from "@/components/features/profile/phone-change-form";
import { Spinner, LocaleSwitcher } from "@/components/ui";
import type { UseMutationResult } from "@tanstack/react-query";

interface Props {
  isDriver: boolean;
  exportMutation: UseMutationResult<unknown, unknown, void, unknown>;
  logoutMutation: UseMutationResult<unknown, unknown, void, unknown>;
}

export function SettingsTab({ isDriver, exportMutation, logoutMutation }: Props) {
  const t = useTranslations("profile");

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-ink-100 bg-white">
        <div className="border-b border-ink-100 px-5 py-4">
          <h2 className="text-[15px] font-bold text-ink-900">{t("lang_section")}</h2>
        </div>
        <div className="px-5 py-4">
          <LocaleSwitcher />
        </div>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white">
        <div className="border-b border-ink-100 px-5 py-4">
          <h2 className="text-[15px] font-bold text-ink-900">{t("personal_section")}</h2>
        </div>
        <div className="px-5 py-5">
          <ProfileForm />
        </div>
      </div>

      {isDriver && (
        <div className="rounded-2xl border border-ink-100 bg-white">
          <div className="border-b border-ink-100 px-5 py-4">
            <h2 className="text-[15px] font-bold text-ink-900">{t("car_photo_section")}</h2>
          </div>
          <div className="px-5 py-5">
            <CarPhotoUploader />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-ink-100 bg-white">
        <div className="border-b border-ink-100 px-5 py-4">
          <h2 className="text-[15px] font-bold text-ink-900">{t("password_section")}</h2>
        </div>
        <div className="px-5 py-5">
          <PasswordForm />
        </div>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white">
        <div className="border-b border-ink-100 px-5 py-4">
          <h2 className="text-[15px] font-bold text-ink-900">{t("phone_section")}</h2>
        </div>
        <div className="px-5 py-5">
          <PhoneChangeForm />
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-ink-100 bg-white p-4">
        <button
          type="button"
          className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-[13px] font-semibold text-ink-700 hover:bg-ink-50"
          onClick={() => exportMutation.mutate()}
          disabled={exportMutation.isPending}
        >
          {exportMutation.isPending ? <Spinner size={16} /> : <Download className="h-4 w-4" aria-hidden="true" />}
          {t("export_btn")}
        </button>

        <button
          type="button"
          className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-[13px] font-semibold text-ink-700 hover:bg-ink-50"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? <Spinner size={16} /> : <LogOut className="h-4 w-4" aria-hidden="true" />}
          {t("logout_btn")}
        </button>

        <Link
          href="/profile/delete"
          className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-[13px] font-semibold text-coral-600 hover:bg-coral-50"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          {t("delete_btn")}
        </Link>
      </div>
    </div>
  );
}
