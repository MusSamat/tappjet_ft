"use client";

import { CheckCircle, MapPin, Flag, Clock, Users, Wallet, Briefcase } from "lucide-react";
import { Spinner } from "@/components/ui";

interface StepPreviewProps {
  originCity: string;
  destinationCity: string;
  pickupCities: string[];
  dropoffCities: string[];
  dateLabel: string;
  time: string;
  seatsTotal: number;
  priceLabel: string;
  luggageLabel: string;
  prefLabels: string[];
  comment: string;
  isPending: boolean;
  createError: string | null;
  onBack: () => void;
  onPublish: () => void;
  t: (key: string) => string;
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
        <p className="truncate text-[14px] font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export function StepPreview({
  originCity,
  destinationCity,
  pickupCities,
  dropoffCities,
  dateLabel,
  time,
  seatsTotal,
  priceLabel,
  luggageLabel,
  prefLabels,
  comment,
  isPending,
  createError,
  onBack,
  onPublish,
  t,
}: StepPreviewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[17px] font-bold text-gray-900">{t("step_preview_title")}</h2>
        <p className="mt-1 text-[12px] font-semibold text-gray-400">{t("preview_subtitle")}</p>
      </div>

      <div className="divide-y divide-gray-100 rounded-2xl border border-ink-100 bg-white px-5 py-2">
        <Row icon={<MapPin className="h-4 w-4" />} label={t("from_label")} value={originCity} />
        {pickupCities.length > 0 && (
          <Row
            icon={<MapPin className="h-4 w-4" />}
            label={t("pickup_cities_label")}
            value={pickupCities.join(", ")}
          />
        )}
        <Row icon={<Flag className="h-4 w-4" />} label={t("to_label")} value={destinationCity} />
        {dropoffCities.length > 0 && (
          <Row
            icon={<Flag className="h-4 w-4" />}
            label={t("dropoff_cities_label")}
            value={dropoffCities.join(", ")}
          />
        )}
        <Row
          icon={<Clock className="h-4 w-4" />}
          label={t("date_label")}
          value={`${dateLabel}, ${time}`}
        />
        <Row
          icon={<Users className="h-4 w-4" />}
          label={t("seats_title")}
          value={String(seatsTotal)}
        />
        <Row icon={<Wallet className="h-4 w-4" />} label={t("price_label")} value={priceLabel} />
        <Row
          icon={<Briefcase className="h-4 w-4" />}
          label={t("luggage_section")}
          value={luggageLabel}
        />
      </div>

      {(prefLabels.length > 0 || comment) && (
        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          {prefLabels.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {prefLabels.map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-teal-50 px-3 py-1 text-[12px] font-bold text-teal-700"
                >
                  {p}
                </span>
              ))}
            </div>
          )}
          {comment && <p className="text-[13px] font-semibold text-gray-700">{comment}</p>}
        </div>
      )}

      {createError && (
        <div className="rounded-2xl bg-coral-50 px-4 py-3 text-[13px] font-semibold text-coral-700">
          {createError}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-12 flex-1 items-center justify-center rounded-xl border-[1.5px] border-gray-200 text-[14px] font-bold text-gray-700 hover:bg-gray-50"
        >
          {t("back")}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={onPublish}
          className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-xl bg-amber-500 text-[14px] font-bold text-[#4A2C00] transition-colors hover:bg-amber-600 disabled:opacity-40"
        >
          {isPending ? (
            <Spinner size={18} />
          ) : (
            <>
              <CheckCircle className="h-4 w-4" aria-hidden="true" />
              {t("publish")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
