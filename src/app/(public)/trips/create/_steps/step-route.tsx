"use client";

import { ArrowRight } from "lucide-react";
import { CityAutocomplete, RouteCitiesPicker } from "@/components/ui";

interface StepRouteProps {
  originCity: string;
  destinationCity: string;
  pickupCities: string[];
  dropoffCities: string[];
  canNext: boolean;
  onPatchOrigin: (v: string) => void;
  onPatchDestination: (v: string) => void;
  onPatchPickups: (v: string[]) => void;
  onPatchDropoffs: (v: string[]) => void;
  onNext: () => void;
  t: (key: string) => string;
}

export function StepRoute({
  originCity,
  destinationCity,
  pickupCities,
  dropoffCities,
  canNext,
  onPatchOrigin,
  onPatchDestination,
  onPatchPickups,
  onPatchDropoffs,
  onNext,
  t,
}: StepRouteProps) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[17px] font-bold text-ink-900">{t("step1_title")}</h2>

      <div className="flex flex-col gap-3 rounded-2xl border border-ink-100 bg-white p-5">
        <CityAutocomplete
          label={t("from_label")}
          value={originCity}
          onChange={onPatchOrigin}
          placeholder={t("from_placeholder")}
        />
        <RouteCitiesPicker
          value={pickupCities}
          onChange={onPatchPickups}
          exclude={[originCity, destinationCity]}
          label={t("pickup_cities_label")}
          placeholder={t("pickup_cities_placeholder")}
          emptyHint={t("route_cities_empty")}
        />
        <CityAutocomplete
          label={t("to_label")}
          value={destinationCity}
          onChange={onPatchDestination}
          placeholder={t("to_placeholder")}
        />
        <RouteCitiesPicker
          value={dropoffCities}
          onChange={onPatchDropoffs}
          exclude={[originCity, destinationCity]}
          label={t("dropoff_cities_label")}
          placeholder={t("dropoff_cities_placeholder")}
          emptyHint={t("route_cities_empty")}
        />
      </div>

      <button
        type="button"
        disabled={!canNext}
        onClick={onNext}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent-500 text-[14px] font-bold text-[#4A2C00] transition-colors hover:bg-accent-600 disabled:opacity-40"
      >
        {t("next")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
