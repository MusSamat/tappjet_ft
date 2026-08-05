"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Car as CarIcon, Minus, Plus } from "lucide-react";
import type { CarCreateInput } from "@/lib/api/cars";
import { isPlateValid, normalizePlate } from "@/lib/utils/plate";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

// The ONE car block — same fields + validation everywhere: inline in trip
// creation, in profile «Мои авто», and in driver verification (with `showYear`).
// Pass `onSubmit`+`submitLabel` for a self-contained form, or `onChange` to lift
// the values into a parent wizard (verification supplies its own «Далее»).

export interface CarValues {
  make: string;
  model: string;
  color: string;
  plate: string;
  year: string;
  seatsCount: number;
  valid: boolean;
}

const MIN_YEAR = 1980;
function yearValid(year: string): boolean {
  const y = Number(year);
  return /^\d{4}$/.test(year.trim()) && y >= MIN_YEAR && y <= new Date().getFullYear();
}

const COMMON_MAKES = [
  "Toyota", "Honda", "Lexus", "Nissan", "Mazda", "Subaru", "Mitsubishi",
  "Mercedes-Benz", "BMW", "Audi", "Volkswagen", "Hyundai", "Kia", "Daewoo",
  "Chevrolet", "Lada (ВАЗ)", "Renault", "Skoda", "Geely", "Chery", "BYD",
];

const FIELD =
  "h-11 w-full rounded-xl border-2 border-ink-200 bg-ink-50 px-3 text-[15px] font-700 text-ink-900 outline-none transition-colors focus:border-brand-500 dark:border-ink-700 dark:bg-ink-800 dark:text-white";

interface Props {
  onSubmit?: (input: CarCreateInput) => void;
  onChange?: (v: CarValues) => void;
  pending?: boolean;
  submitLabel?: string;
  showYear?: boolean;
  /** Prefill (e.g. selecting an existing car in verification). Pair with a
      React `key` on the component to re-seed the fields per selection. */
  initial?: Partial<Omit<CarValues, "valid">>;
  className?: string;
}

export function CarForm({ onSubmit, onChange, pending, submitLabel, showYear, initial, className }: Props) {
  const t = useTranslations("cars");
  const tReg = useTranslations("driver_reg");
  const [make, setMake] = useState(initial?.make ?? "");
  const [model, setModel] = useState(initial?.model ?? "");
  const [color, setColor] = useState(initial?.color ?? "");
  const [plate, setPlate] = useState(initial?.plate ?? "");
  const [year, setYear] = useState(initial?.year ?? "");
  const [seats, setSeats] = useState(initial?.seatsCount ?? 4);

  const plateOk = isPlateValid(plate);
  const yearOk = !showYear || yearValid(year);
  const valid = Boolean(make.trim() && model.trim() && plateOk && yearOk);

  // Lift the current values into a parent wizard (verification) when controlled.
  useEffect(() => {
    onChange?.({ make: make.trim(), model: model.trim(), color: color.trim(), plate, year: year.trim(), seatsCount: seats, valid });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [make, model, color, plate, year, seats, valid]);

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
          onChange={(e) => setPlate(normalizePlate(e.target.value))}
          placeholder={t("plate_ph")}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          maxLength={10}
          className={cn(
            FIELD,
            "uppercase tracking-wider",
            plate && !plateOk && "border-coral-400 dark:border-coral-400",
          )}
        />
      </div>
      {plate && !plateOk && (
        <p className="text-[13px] font-700 text-coral-500">{t("plate_hint")}</p>
      )}
      {showYear && (
        <div>
          <input
            value={year}
            onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            placeholder={tReg("year_placeholder")}
            className={cn(FIELD, year && !yearOk && "border-coral-400 dark:border-coral-400")}
          />
          {year && !yearOk && <p className="mt-1 text-[13px] font-700 text-coral-500">{tReg("err_carYear")}</p>}
        </div>
      )}
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
      {/* Self-contained mode: a submit button. Controlled mode (verification)
          omits submitLabel and drives the values via onChange. */}
      {submitLabel && (
        <button
          type="button"
          disabled={!valid || pending}
          onClick={() =>
            onSubmit?.({
              make: make.trim(),
              model: model.trim(),
              color: color.trim() || undefined,
              plate,
              seatsCount: seats,
            })
          }
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-[15px] font-800 text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
        >
          {pending ? <Spinner size={16} /> : <CarIcon className="h-4 w-4" aria-hidden="true" />}
          {submitLabel}
        </button>
      )}
    </div>
  );
}
