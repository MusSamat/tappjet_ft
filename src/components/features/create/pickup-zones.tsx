"use client";

import { useState, useRef } from "react";
import { UserPlus, Flag, Plus, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Chip, CityAutocomplete, SectionLabel, OptionalTag } from "@/components/ui";
import type { ChipAccent } from "@/components/ui";
import type { UiRole } from "@/lib/role-colors";
import { cn } from "@/lib/utils/cn";

// Pickup / drop-off zones — design-spec §2.4. Role-differentiated:
//   driver    → CITIES (Кара-Балта, Токтогул) picked via CityAutocomplete
//   passenger → arbitrary POINTS inside a city (мкр Восток-5) typed free-text
// removable Chip per point + a role-appropriate add affordance.

/** Free-text add pill (passenger points — they aren't in the cities DB). */
function AddPointInline({ addLabel, points, onChange }: {
  addLabel: string;
  points: string[];
  onChange: (v: string[]) => void;
}) {
  const t = useTranslations("create");
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const add = () => {
    const v = text.trim();
    if (v && !points.includes(v)) onChange([...points, v]);
    setText("");
    inputRef.current?.focus();
  };

  const canAdd = text.trim().length > 0;

  return (
    <div className="flex w-full items-center gap-1 rounded-full border border-dashed border-ink-300 bg-white px-2.5 py-1 dark:border-ink-600 dark:bg-ink-900">
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        placeholder={t("point_placeholder")}
        className="min-w-0 flex-1 bg-transparent py-0.5 text-[13px] font-800 text-ink-900 outline-none placeholder:font-700 placeholder:text-ink-400 dark:text-white"
      />
      <button
        type="button"
        onClick={add}
        disabled={!canAdd}
        aria-label={addLabel}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-grape-500 text-white transition-opacity disabled:opacity-30"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

/** City picker add-widget (driver). Holds its own query state via a remount key
 *  so it clears after each pick and never fights a constant `value=""` prop. */
function AddCityInline({ points, onChange }: {
  points: string[];
  onChange: (v: string[]) => void;
}) {
  const [nonce, setNonce] = useState(0);
  return (
    <div className="w-44">
      <CityAutocomplete
        key={nonce}
        value=""
        onChange={(v) => {
          if (!v) return;
          if (!points.includes(v)) onChange([...points, v]);
          setNonce((n) => n + 1); // clear internal query, ready for the next city
        }}
        compact
      />
    </div>
  );
}

interface ZoneProps {
  isDriver: boolean;
  bg: string;
  headerColor: string;
  headerIcon: "pickup" | "flag";
  headerLabel: string;
  addLabel: string;
  points: string[];
  onChange: (v: string[]) => void;
  chipAccent: ChipAccent;
}

function Zone({ isDriver, bg, headerColor, headerIcon, headerLabel, addLabel, points, onChange, chipAccent }: ZoneProps) {
  const [adding, setAdding] = useState(false);
  const Icon = headerIcon === "flag" ? Flag : UserPlus;
  return (
    <div className={cn("rounded-2xl p-3", bg)}>
      <div className={cn("mb-2 flex items-center gap-1.5 text-[13px] font-900", headerColor)}>
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {headerLabel}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {points.map((p) => (
          <Chip key={p} kind="removable" onRemove={() => onChange(points.filter((x) => x !== p))}>
            {p}
          </Chip>
        ))}
        {isDriver ? (
          adding ? (
            <AddCityInline points={points} onChange={onChange} />
          ) : (
            <Chip kind="add" accent={chipAccent} onClick={() => setAdding(true)}>
              {addLabel}
            </Chip>
          )
        ) : (
          <AddPointInline addLabel={addLabel} points={points} onChange={onChange} />
        )}
      </div>
    </div>
  );
}

interface Props {
  role: UiRole;
  pickup: string[];
  dropoff: string[];
  onPickup: (v: string[]) => void;
  onDropoff: (v: string[]) => void;
}

export function PickupZones({ role, pickup, dropoff, onPickup, onDropoff }: Props) {
  const t = useTranslations("create");
  const isDriver = role === "driver";
  const zoneAccent: ChipAccent = isDriver ? "brand" : "grape";
  // Collapsed by default (optional block) — open automatically when it has data.
  const [open, setOpen] = useState(pickup.length > 0 || dropoff.length > 0);
  return (
    <div className="rounded-3xl bg-white p-4 shadow-card dark:bg-ink-900">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 text-left"
      >
        <SectionLabel>{isDriver ? t("pickup_title_driver") : t("pickup_title_passenger")}</SectionLabel>
        <OptionalTag />
        <ChevronDown
          className={cn("ml-auto h-4 w-4 shrink-0 text-ink-400 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {open && (
        <>
      <p className="mb-3 mt-1 text-[14px] font-700 text-ink-400">
        {isDriver ? t("pickup_hint_driver") : t("pickup_hint_passenger")}
      </p>
      <div className="space-y-2.5">
        <Zone
          isDriver={isDriver}
          bg={isDriver ? "bg-brand-50 dark:bg-brand-500/10" : "bg-grape-50 dark:bg-grape-500/10"}
          headerColor={isDriver ? "text-brand-700 dark:text-brand-300" : "text-grape-600 dark:text-grape-300"}
          headerIcon="pickup"
          headerLabel={isDriver ? t("pickup_from_driver") : t("pickup_from_passenger")}
          addLabel={isDriver ? t("add_city") : t("add_point")}
          points={pickup}
          onChange={onPickup}
          chipAccent={zoneAccent}
        />
        <Zone
          isDriver={isDriver}
          bg="bg-sky-50 dark:bg-sky-500/10"
          headerColor="text-sky-600 dark:text-sky-300"
          headerIcon="flag"
          headerLabel={isDriver ? t("dropoff_driver") : t("dropoff_passenger")}
          addLabel={isDriver ? t("add_city") : t("add_point")}
          points={dropoff}
          onChange={onDropoff}
          chipAccent="sky"
        />
      </div>
        </>
      )}
    </div>
  );
}
