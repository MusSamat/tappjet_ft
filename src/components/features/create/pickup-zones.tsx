"use client";

import { useState } from "react";
import { UserPlus, Flag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Chip, CityAutocomplete, SectionLabel, OptionalTag } from "@/components/ui";
import type { ChipAccent } from "@/components/ui";
import type { UiRole } from "@/lib/role-colors";
import { cn } from "@/lib/utils/cn";

// Pickup / drop-off zones — design-spec §2.4. Role-differentiated:
//   driver    → «Заберу из» (brand) / «Довезу до» (sky)
//   passenger → «Заберите меня из» (grape) / «Высадите у» (sky)
// removable Chip per point + dashed add Chip that reveals a CityAutocomplete.

interface ZoneProps {
  bg: string;
  headerColor: string;
  headerIcon: "pickup" | "flag";
  headerLabel: string;
  addLabel: string;
  points: string[];
  onChange: (v: string[]) => void;
  chipAccent: ChipAccent;
}

function Zone({ bg, headerColor, headerIcon, headerLabel, addLabel, points, onChange, chipAccent }: ZoneProps) {
  const [adding, setAdding] = useState(false);
  const Icon = headerIcon === "flag" ? Flag : UserPlus;
  return (
    <div className={cn("rounded-2xl p-3", bg)}>
      <div className={cn("mb-2 flex items-center gap-1.5 text-[11px] font-900", headerColor)}>
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {headerLabel}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {points.map((p) => (
          <Chip key={p} kind="removable" onRemove={() => onChange(points.filter((x) => x !== p))}>
            {p}
          </Chip>
        ))}
        {adding ? (
          <div className="w-40">
            <CityAutocomplete
              value=""
              onChange={(v) => {
                if (v && !points.includes(v)) onChange([...points, v]);
                setAdding(false);
              }}
              compact
            />
          </div>
        ) : (
          <Chip kind="add" accent={chipAccent} onClick={() => setAdding(true)}>
            {addLabel}
          </Chip>
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
  return (
    <div className="rounded-3xl bg-white p-4 shadow-card dark:bg-ink-900">
      <div className="mb-1 flex items-center gap-2">
        <SectionLabel>{isDriver ? t("pickup_title_driver") : t("pickup_title_passenger")}</SectionLabel>
        <OptionalTag />
      </div>
      <p className="mb-3 text-[11px] font-700 text-ink-400">
        {isDriver ? t("pickup_hint_driver") : t("pickup_hint_passenger")}
      </p>
      <div className="space-y-2.5">
        <Zone
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
    </div>
  );
}
