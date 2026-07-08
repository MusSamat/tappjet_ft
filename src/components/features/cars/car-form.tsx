"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Car as CarIcon, Minus, Plus } from "lucide-react";
import type { CarCreateInput } from "@/lib/api/cars";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

// Compact add-car form (Phase 1: no verification). Used inline in trip
// creation and in profile «Мои авто». 4 fields + seats stepper — 30 seconds.

const COMMON_MAKES = [
  "Toyota", "Honda", "Lexus", "Nissan", "Mazda", "Subaru", "Mitsubishi",
  "Mercedes-Benz", "BMW", "Audi", "Volkswagen", "Hyundai", "Kia", "Daewoo",
  "Chevrolet", "Lada (ВАЗ)", "Renault", "Skoda", "Geely", "Chery", "BYD",
];

const FIELD =
  "h-11 w-full rounded-xl border-2 border-ink-200 bg-ink-50 px-3 text-[15px] font-700 text-ink-900 outline-none transition-colors focus:border-brand-500 dark:border-ink-700 dark:bg-ink-800 dark:text-white";

interface Props {
  onSubmit: (input: CarCreateInput) => void;
  pending?: boolean;
  submitLabel: string;
  className?: string;
}

export function CarForm({ onSubmit, pending, submitLabel, className }: Props) {
  const t = useTranslations("cars");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [plate, setPlate] = useState("");
  const [seats, setSeats] = useState(4);

  const plateClean = plate.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
  const valid = make.trim() && model.trim() && plateClean.length >= 4;

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <input
            list="car-makes"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            placeholder={t("make_ph")}
            className={FIELD}
          />
          <datalist id="car-makes">
            {COMMON_MAKES.map((m) => <option key={m} value={m} />)}
          </datalist>
        </div>
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder={t("model_ph")}
          className={FIELD}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          value={color}
          onChange={(e) => setColor(e.target.value)}
          placeholder={t("color_ph")}
          className={FIELD}
        />
        <input
          value={plate}
          onChange={(e) => setPlate(e.target.value.toUpperCase())}
          placeholder={t("plate_ph")}
          autoCapitalize="characters"
          spellCheck={false}
          className={cn(FIELD, "uppercase tracking-wider")}
        />
      </div>
      {/* Seats — compact stepper row */}
      <div className="flex h-11 items-center justify-between rounded-xl border-2 border-ink-200 bg-ink-50 px-3 dark:border-ink-700 dark:bg-ink-800">
        <span className="text-[15px] font-700 text-ink-600 dark:text-ink-300">{t("seats_label")}</span>
        <span className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="−"
            disabled={seats <= 1}
            onClick={() => setSeats((s) => Math.max(1, s - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-ink-600 ring-1 ring-ink-200 disabled:opacity-35 dark:bg-ink-900 dark:text-ink-300 dark:ring-ink-700"
          >
            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <span className="min-w-[20px] text-center text-[17px] font-900 text-ink-900 dark:text-white">{seats}</span>
          <button
            type="button"
            aria-label="+"
            disabled={seats >= 7}
            onClick={() => setSeats((s) => Math.min(7, s + 1))}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand-600 ring-1 ring-ink-200 disabled:opacity-35 dark:bg-ink-900 dark:text-brand-300 dark:ring-ink-700"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </span>
      </div>
      <button
        type="button"
        disabled={!valid || pending}
        onClick={() =>
          onSubmit({
            make: make.trim(),
            model: model.trim(),
            color: color.trim() || undefined,
            plate: plateClean,
            seatsCount: seats,
          })
        }
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-[15px] font-800 text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
      >
        {pending ? <Spinner size={16} /> : <CarIcon className="h-4 w-4" aria-hidden="true" />}
        {submitLabel}
      </button>
    </div>
  );
}
