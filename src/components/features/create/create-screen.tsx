"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CarFront, User, PartyPopper, ShieldCheck, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { createTrip, type CreateTripInput } from "@/lib/api/trips-create";
import { createPassengerRequest, type CreatePassengerRequestInput } from "@/lib/api/passenger-requests";
import { getDriverStatus } from "@/lib/api/profile";
import { extractError } from "@/lib/api/client";
import { useFriendlyError } from "@/lib/hooks/use-api-error";
import { useAuth } from "@/store/auth";
import { useRoleTheme } from "@/lib/hooks/use-role-colors";
import { saveDeferredAction } from "@/lib/auth/deferred-action";
import { Spinner } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { ActionModal } from "@/components/ui/action-modal";
import type { ChipAccent } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { AddPhoneModal } from "@/components/features/auth/add-phone-modal";
import { RouteCard } from "./route-card";
import { PickupZones } from "./pickup-zones";
import { WhenChips } from "./when-chips";
import { SeatsStepper } from "./seats-stepper";
import { PriceCard } from "./price-card";
import { PrefsCollapsible, PREF_KEYS, type PrefKey } from "./prefs-collapsible";

// Unified single-scroll create form — design-spec §2.4. Driver publishes a
// trip, passenger publishes a request; the variant is chosen by useUiRole.
// All create mutations / draft-persistence / phone + verification gating are
// preserved — this is a presentational collapse of the old multi-step wizard.

interface Draft {
  originCity: string;
  destinationCity: string;
  pickup: string[];
  dropoff: string[];
  date: string;
  time: string;
  flexible: boolean;
  seats: number;
  price: number;
  comment: string;
  prefs: Record<PrefKey, boolean>;
}

function emptyPrefs(): Record<PrefKey, boolean> {
  const p = {} as Record<PrefKey, boolean>;
  for (const k of PREF_KEYS) p[k] = false;
  p.clean = true;
  p.no_smoking = true;
  return p;
}

function defaults(isDriver: boolean): Draft {
  return {
    originCity: "",
    destinationCity: "",
    pickup: [],
    dropoff: [],
    date: "",
    time: "09:00",
    flexible: false,
    seats: isDriver ? 3 : 2,
    price: isDriver ? 1200 : 1500,
    comment: "",
    prefs: emptyPrefs(),
  };
}

function dstr(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0]!;
}

interface Props {
  initialFrom?: string;
  initialTo?: string;
}

export function CreateScreen({ initialFrom, initialTo }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const t = useTranslations("create");
  const fe = useFriendlyError();
  const status = useAuth((s) => s.status);
  const user = useAuth((s) => s.user);
  const { role, theme } = useRoleTheme();
  const isDriver = role === "driver";
  const draftKey = isDriver ? "tappjet_trip_draft" : "tappjet_req_draft";
  const chipAccent: ChipAccent = isDriver ? "brand" : "grape";

  const [draft, setDraft] = useState<Draft>(() => defaults(isDriver));
  const [showAddPhone, setShowAddPhone] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [publishedId, setPublishedId] = useState<string | null>(null);

  // Guest gate (proper gate screen lands in a later batch — this is the seam).
  useEffect(() => {
    if (status === "anonymous") {
      saveDeferredAction({ action: "book_trip", trip_id: "", seats: 1 });
      router.replace("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && !user?.phoneVerified) setShowAddPhone(true);
  }, [status, user]);

  // Load persisted draft (preserve existing localStorage keys).
  useEffect(() => {
    const base = defaults(isDriver);
    base.date = dstr(1);
    try {
      const raw = localStorage.getItem(draftKey);
      const saved = raw ? (JSON.parse(raw) as Partial<Draft>) : {};
      const merged: Draft = { ...base, ...saved, prefs: { ...base.prefs, ...(saved.prefs ?? {}) } };
      if (initialFrom) merged.originCity = initialFrom;
      if (initialTo) merged.destinationCity = initialTo;
      setDraft(merged);
    } catch {
      setDraft(base);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDriver, draftKey]);

  const patch = (u: Partial<Draft>) =>
    setDraft((prev) => {
      const next = { ...prev, ...u };
      try {
        localStorage.setItem(draftKey, JSON.stringify(next));
      } catch {
        /* ignore quota / private-mode */
      }
      return next;
    });

  // Driver-verification gate (backend enforces verificationStatus === 'verified').
  const { data: driverStatus, isLoading: driverLoading } = useQuery({
    queryKey: ["driver-status"],
    queryFn: getDriverStatus,
    enabled: isDriver && status === "authenticated" && Boolean(user?.phoneVerified),
    staleTime: 60_000,
  });

  const departureAt = (): string => {
    const day = /^\d{4}-\d{2}-\d{2}$/.test(draft.date) ? draft.date : dstr(1);
    return new Date(`${day}T${draft.flexible ? "12:00" : draft.time}:00`).toISOString();
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (): Promise<string> => {
      if (isDriver) {
        const input: CreateTripInput = {
          originCity: draft.originCity,
          destinationCity: draft.destinationCity,
          pickupCities: draft.pickup,
          dropoffCities: draft.dropoff,
          originAddress: draft.originCity,
          departureAt: departureAt(),
          departureFlexible: draft.flexible,
          seatsTotal: draft.seats,
          pricePerSeat: draft.price,
          priceNegotiable: false,
          luggage: "small",
          comment: draft.comment || undefined,
          preferences: {
            clean: draft.prefs.clean,
            music: draft.prefs.music,
            smoking: !draft.prefs.no_smoking,
            ac: draft.prefs.ac,
            animals: draft.prefs.pets,
            quiet: draft.prefs.quiet,
            chat: draft.prefs.chat,
          },
        };
        const trip = await createTrip(input);
        return trip.id ?? "";
      }
      // Passenger request — payload has no pickup/budget fields, so the budget
      // is folded into the comment to avoid losing it.
      const budgetNote = draft.price > 0 ? `${t("budget_note", { n: draft.price })} ` : "";
      const input: CreatePassengerRequestInput = {
        originCity: draft.originCity,
        destinationCity: draft.destinationCity,
        seatsNeeded: draft.seats,
        departureDate: departureAt(),
        flexible: draft.flexible,
        comment: (budgetNote + draft.comment).trim() || undefined,
      };
      const req = await createPassengerRequest(input);
      return req.id ?? "";
    },
    onSuccess: (id) => {
      try {
        localStorage.removeItem(draftKey);
      } catch {
        /* ignore */
      }
      void qc.invalidateQueries({ queryKey: isDriver ? ["trips"] : ["passenger-requests"] });
      setPublishedId(id);
    },
    onError: (e) => setCreateError(fe(extractError(e))),
  });

  const canSubmit =
    Boolean(draft.originCity && draft.destinationCity && draft.originCity !== draft.destinationCity) &&
    (draft.flexible || Boolean(draft.date)) &&
    draft.seats >= 1 &&
    (!isDriver || draft.price >= 50);

  if (status === "loading" || status === "idle" || status === "anonymous") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  // Driver not yet verified — block the form (mirrors backend 403).
  if (isDriver && user?.phoneVerified && (driverLoading || (driverStatus && driverStatus.status !== "verified"))) {
    const pending = driverStatus?.status === "pending" || driverStatus?.status === "docs_requested";
    return (
      <div className="mx-auto max-w-[560px] px-4 py-8">
        {driverLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Spinner size={28} />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-ink-100 bg-white px-6 py-10 text-center dark:border-ink-800 dark:bg-ink-900">
            <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", pending ? "bg-accent-50 text-accent-600" : "bg-brand-50 text-brand-600")}>
              {pending ? <Clock className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}
            </div>
            <h1 className="text-[20px] font-900 text-ink-900 dark:text-white">
              {pending ? t("gate_pending_title") : t("gate_unverified_title")}
            </h1>
            <p className="max-w-[380px] text-[13px] font-700 text-ink-500 dark:text-ink-400">
              {pending ? t("gate_pending_text") : t("gate_unverified_text")}
            </p>
            <Button variant="brand" size="lg" className="mt-2 w-full max-w-[320px]" onClick={() => router.push("/profile/driver")}>
              {pending ? t("gate_pending_cta") : t("gate_cta")}
            </Button>
          </div>
        )}
      </div>
    );
  }

  const submitLabel = isDriver ? t("submit_driver") : t("submit_passenger");
  const submitBtn = (
    <Button
      variant={isDriver ? "brand" : "grape"}
      size="lg"
      className="w-full"
      disabled={!canSubmit || isPending}
      onClick={() => {
        setCreateError(null);
        mutate();
      }}
    >
      {isPending ? (
        <Spinner size={18} />
      ) : (
        <>
          {isDriver ? <CarFront className="h-5 w-5" aria-hidden="true" /> : <User className="h-5 w-5" aria-hidden="true" />}
          {submitLabel}
        </>
      )}
    </Button>
  );

  const form = (
    <div className="space-y-3.5">
      <p className="text-[13px] font-700 text-ink-500 dark:text-ink-400">
        {isDriver ? t("intro_driver") : t("intro_passenger")}
      </p>
      <RouteCard
        origin={draft.originCity}
        destination={draft.destinationCity}
        onOrigin={(v) => patch({ originCity: v })}
        onDestination={(v) => patch({ destinationCity: v })}
        iconAccent={theme.iconAccent}
      />
      <PickupZones
        role={role}
        pickup={draft.pickup}
        dropoff={draft.dropoff}
        onPickup={(v) => patch({ pickup: v })}
        onDropoff={(v) => patch({ dropoff: v })}
      />
      <WhenChips
        date={draft.date}
        time={draft.time}
        flexible={draft.flexible}
        tomorrow={dstr(1)}
        dayAfter={dstr(2)}
        today={dstr(0)}
        accent={chipAccent}
        flexChip={theme.flexChip}
        onDate={(v) => patch({ date: v })}
        onTime={(v) => patch({ time: v })}
        onFlexible={(v) => patch({ flexible: v })}
      />
      <SeatsStepper
        value={draft.seats}
        label={isDriver ? t("seats_label_driver") : t("seats_label_passenger")}
        counterText={theme.counterText}
        onChange={(v) => patch({ seats: v })}
      />
      <PriceCard
        value={draft.price}
        label={isDriver ? t("price_label_driver") : t("price_label_passenger")}
        onChange={(v) => patch({ price: v })}
      />
    </div>
  );

  return (
    <>
      <AddPhoneModal open={showAddPhone} onClose={() => setShowAddPhone(false)} />

      {/* ===== MOBILE ===== */}
      <div className="flex min-h-[calc(100vh-56px)] flex-col lg:hidden">
        <div className={cn("px-5 pb-4 pt-11 text-white", theme.headerGrad)}>
          <button type="button" onClick={() => router.back()} aria-label={t("back")} className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <h1 className="text-[15px] font-900">{isDriver ? t("title_driver") : t("title_passenger")}</h1>
          <p className="text-[11px] font-700 text-white/80">{isDriver ? t("subtitle_driver") : t("subtitle_passenger")}</p>
        </div>
        <div className="flex-1 space-y-3.5 px-4 py-4">{form}</div>
        <div className="space-y-3.5 px-4 pb-4">
          <PrefsCollapsible role={role} prefs={draft.prefs} onToggle={(k) => patch({ prefs: { ...draft.prefs, [k]: !draft.prefs[k] } })} />
          <div className="rounded-2xl bg-white p-4 shadow-card dark:bg-ink-900">
            <p className="mb-3 text-center text-[11px] font-700 text-ink-400">{isDriver ? t("note_driver") : t("note_passenger")}</p>
            {createError && <p className="mb-3 rounded-xl bg-coral-50 px-4 py-2 text-[13px] font-700 text-coral-700 dark:bg-coral-500/10">{createError}</p>}
            {submitBtn}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP (webCreate 2-col) ===== */}
      <div className="mx-auto hidden max-w-[1080px] gap-8 bg-ink-50 p-8 lg:grid lg:grid-cols-[330px_1fr] dark:bg-ink-950">
        <aside className="space-y-4">
          <h2 className="text-[26px] font-900 text-ink-900 dark:text-white">{isDriver ? t("web_title_driver") : t("web_title_passenger")}</h2>
          <p className="text-[14px] font-700 text-ink-500 dark:text-ink-400">{isDriver ? t("web_sub_driver") : t("web_sub_passenger")}</p>
          <div className="rounded-3xl bg-brand-50 p-4 dark:bg-brand-500/10">
            <div className="flex items-start gap-2.5 text-[12px] font-700 text-ink-600 dark:text-ink-300">
              <ShieldCheck className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              {t("web_trust")}
            </div>
          </div>
        </aside>
        <div className="rounded-4xl bg-white p-7 shadow-card dark:bg-ink-900">
          <div className="space-y-3.5">
            {form}
            <PrefsCollapsible role={role} prefs={draft.prefs} onToggle={(k) => patch({ prefs: { ...draft.prefs, [k]: !draft.prefs[k] } })} />
            {createError && <p className="rounded-xl bg-coral-50 px-4 py-2 text-[13px] font-700 text-coral-700 dark:bg-coral-500/10">{createError}</p>}
            {submitBtn}
          </div>
        </div>
      </div>

      {/* Published success — design-spec §3.5 */}
      <ActionModal
        open={publishedId !== null}
        onOpenChange={(o) => {
          if (!o) setPublishedId(null);
        }}
        tone="brand"
        icon={PartyPopper}
        title={t("published_title")}
        primary={
          <Button
            variant="cta"
            size="lg"
            className="w-full"
            onClick={() => {
              const id = publishedId;
              setPublishedId(null);
              if (isDriver && id) router.push(`/trips/${id}`);
              else router.push("/my/bookings");
            }}
          >
            {isDriver ? t("published_cta_driver") : t("published_cta_passenger")}
          </Button>
        }
      >
        {isDriver ? t("published_body_driver") : t("published_body_passenger")}
      </ActionModal>
    </>
  );
}
