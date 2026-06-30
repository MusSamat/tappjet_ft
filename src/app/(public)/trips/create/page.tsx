"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, ShieldCheck, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { createTrip, type CreateTripInput, type LuggageOption } from "@/lib/api/trips-create";
import { getDriverStatus } from "@/lib/api/profile";
import { extractError } from "@/lib/api/client";
import { friendlyError } from "@/lib/utils/api-error";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/store/auth";
import { saveDeferredAction } from "@/lib/auth/deferred-action";
import { AddPhoneModal } from "@/components/features/auth/add-phone-modal";
import { StepRoute } from "./_steps/step-route";
import { StepDateTime } from "./_steps/step-datetime";
import { Step2 } from "./_steps/step-2";
import { Step3 } from "./_steps/step-3";
import { StepPreview } from "./_steps/step-preview";

const TOTAL_STEPS = 5;

const DRAFT_KEY = "tappjet_trip_draft";

interface DraftData {
  originCity: string;
  destinationCity: string;
  pickupCities: string[];
  dropoffCities: string[];
  date: string;
  time: string;
  seatsTotal: number;
  pricePerSeat: number;
  priceNegotiable: boolean;
  luggage: LuggageOption;
  comment: string;
  prefSilence: boolean;
  prefMusic: boolean;
  prefNoSmoking: boolean;
}

const EMPTY: DraftData = {
  originCity: "",
  destinationCity: "",
  pickupCities: [],
  dropoffCities: [],
  date: "",
  time: "09:00",
  seatsTotal: 3,
  pricePerSeat: 1200,
  priceNegotiable: false,
  luggage: "small",
  comment: "",
  prefSilence: false,
  prefMusic: false,
  prefNoSmoking: true,
};

const TIME_OPTIONS = [
  "06:00",
  "08:00",
  "09:00",
  "10:00",
  "12:00",
  "15:00",
  "17:00",
  "20:00",
  "22:00",
];

function todayStr(): string {
  return new Date().toISOString().split("T")[0]!;
}
function tomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0]!;
}
function dayAfterStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0]!;
}

function readSavedDraft(): DraftData | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return { ...EMPTY, date: tomorrowStr(), ...(JSON.parse(raw) as Partial<DraftData>) };
  } catch {
    return null;
  }
}

// A draft is worth resuming only if the user actually entered something.
function isMeaningful(d: DraftData): boolean {
  return Boolean(d.originCity || d.destinationCity || d.comment);
}

export default function CreateTripPage() {
  const router = useRouter();
  const t = useTranslations("trips.create");
  const status = useAuth((s) => s.status);
  const user = useAuth((s) => s.user);
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<DraftData>(EMPTY);
  const [showAddPhone, setShowAddPhone] = useState(false);
  // Draft-resume prompt (TZ §26.7 "У вас есть незавершённая поездка. Продолжить?")
  const [pendingDraft, setPendingDraft] = useState<DraftData | null>(null);

  useEffect(() => {
    if (status === "anonymous") {
      saveDeferredAction({ action: "book_trip", trip_id: "", seats: 1 });
      router.replace("/auth/login");
      return;
    }
    if (status === "authenticated" && !user?.phoneVerified) {
      setShowAddPhone(true);
    }
    const saved = readSavedDraft();
    if (saved && isMeaningful(saved)) {
      // Offer to resume — start fresh until the user decides.
      setPendingDraft(saved);
      setDraft({ ...EMPTY, date: tomorrowStr() });
    } else {
      setDraft(saved ?? { ...EMPTY, date: tomorrowStr() });
    }
  }, [status, user, router]);

  const resumeDraft = () => {
    if (pendingDraft) setDraft(pendingDraft);
    setPendingDraft(null);
  };
  const discardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    setDraft({ ...EMPTY, date: tomorrowStr() });
    setPendingDraft(null);
  };

  // Driver-verification gate — mirrors the backend rule (trips.service.ts:
  // verificationStatus !== 'verified' → 403). Only publishing a trip requires it,
  // so we fetch once the user is authenticated with a verified phone.
  const { data: driverStatus, isLoading: driverLoading } = useQuery({
    queryKey: ["driver-status"],
    queryFn: getDriverStatus,
    enabled: status === "authenticated" && Boolean(user?.phoneVerified),
    staleTime: 60_000,
  });

  const patch = (update: Partial<DraftData>) => {
    setDraft((prev) => {
      const next = { ...prev, ...update };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const [createError, setCreateError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const departureAt = new Date(`${draft.date}T${draft.time}:00`).toISOString();
      const input: CreateTripInput = {
        originCity: draft.originCity,
        destinationCity: draft.destinationCity,
        pickupCities: draft.pickupCities,
        dropoffCities: draft.dropoffCities,
        originAddress: draft.originCity,
        departureAt,
        departureFlexible: false,
        seatsTotal: draft.seatsTotal,
        pricePerSeat: draft.pricePerSeat,
        priceNegotiable: draft.priceNegotiable,
        luggage: draft.luggage,
        comment: draft.comment || undefined,
        preferences: {
          music: draft.prefMusic,
          animals: false,
          smoking: !draft.prefNoSmoking,
        },
      };
      return createTrip(input);
    },
    onSuccess: (trip) => {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      router.push(`/trips/${trip.id}`);
    },
    onError: (e) => {
      setCreateError(friendlyError(extractError(e)));
    },
  });

  const canRoute = Boolean(
    draft.originCity && draft.destinationCity && draft.originCity !== draft.destinationCity,
  );
  const canDate = Boolean(draft.date);
  const canStep2 = draft.seatsTotal >= 1 && draft.pricePerSeat >= 50;

  const dateOptions = [
    { label: t("date_today"), value: todayStr() },
    { label: t("date_tomorrow"), value: tomorrowStr() },
    { label: t("date_dayafter"), value: dayAfterStr() },
  ];

  // Read-only summary values for the preview step.
  const dateLabel =
    dateOptions.find((o) => o.value === draft.date)?.label ??
    (/^\d{4}-\d{2}-\d{2}$/.test(draft.date)
      ? new Date(`${draft.date}T00:00:00`).toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "long",
        })
      : draft.date);
  const luggageKey = ({ no: "luggage_no", small: "luggage_small", yes: "luggage_big" } as const)[
    draft.luggage
  ];
  const priceLabel = `${draft.pricePerSeat} ${t("price_som")}${draft.priceNegotiable ? ` · ${t("price_negotiable")}` : ""}`;
  const prefLabels = [
    draft.prefSilence && t("pref_silence_label"),
    draft.prefMusic && t("pref_music_label"),
    draft.prefNoSmoking && t("pref_no_smoke_label"),
  ].filter(Boolean) as string[];

  if (status === "loading" || status === "idle") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  // Block the whole flow until the driver is verified (backend enforces too).
  // The phone modal handles the unverified-phone case; this covers the driver gate.
  if (user?.phoneVerified && (driverLoading || (driverStatus && driverStatus.status !== "verified"))) {
    const pending = driverStatus?.status === "pending" || driverStatus?.status === "docs_requested";
    return (
      <div className="mx-auto max-w-[560px] px-4 py-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-[13px] font-semibold text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("back")}
        </button>
        {driverLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Spinner size={28} />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-3xl border-[0.5px] border-gray-200 bg-white px-6 py-10 text-center">
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl",
                pending ? "bg-amber-50 text-amber-600" : "bg-teal-50 text-teal-600",
              )}
            >
              {pending ? <Clock className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}
            </div>
            <h1 className="text-[20px] font-extrabold text-gray-900">
              {pending ? t("gate_pending_title") : t("gate_unverified_title")}
            </h1>
            <p className="max-w-[380px] text-[13px] font-semibold text-gray-500">
              {pending ? t("gate_pending_text") : t("gate_unverified_text")}
            </p>
            <button
              type="button"
              onClick={() => router.push("/profile/driver")}
              className="mt-2 flex h-12 w-full max-w-[320px] items-center justify-center rounded-xl bg-teal-600 text-[14px] font-bold text-white transition-colors hover:bg-teal-700"
            >
              {pending ? t("gate_pending_cta") : t("gate_cta")}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <AddPhoneModal open={showAddPhone} onClose={() => setShowAddPhone(false)} />
      <div className="mx-auto max-w-[720px] px-4 py-8">
        <button
          type="button"
          onClick={() => (step > 1 ? setStep((s) => s - 1) : router.back())}
          className="mb-4 flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-[13px] font-semibold text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("back")}
        </button>

        <h1 className="mb-1 text-[26px] font-extrabold text-gray-900">{t("title")}</h1>
        <p className="mb-5 text-[12px] font-semibold text-gray-400">{t("step", { step })}</p>

        <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-teal-600 transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {pendingDraft && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] font-bold text-amber-900">{t("draft_title")}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={discardDraft}
                className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-[13px] font-bold text-amber-800 hover:bg-amber-100"
              >
                {t("draft_discard")}
              </button>
              <button
                type="button"
                onClick={resumeDraft}
                className="rounded-xl bg-amber-500 px-4 py-2 text-[13px] font-bold text-[#4A2C00] hover:bg-amber-600"
              >
                {t("draft_continue")}
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <StepRoute
            originCity={draft.originCity}
            destinationCity={draft.destinationCity}
            pickupCities={draft.pickupCities}
            dropoffCities={draft.dropoffCities}
            canNext={canRoute}
            onPatchOrigin={(v) => patch({ originCity: v })}
            onPatchDestination={(v) => patch({ destinationCity: v })}
            onPatchPickups={(v) => patch({ pickupCities: v })}
            onPatchDropoffs={(v) => patch({ dropoffCities: v })}
            onNext={() => setStep(2)}
            t={t}
          />
        )}

        {step === 2 && (
          <StepDateTime
            date={draft.date}
            time={draft.time}
            canNext={canDate}
            dateOptions={dateOptions}
            timeOptions={TIME_OPTIONS}
            todayStr={todayStr()}
            onPatchDate={(v) => patch({ date: v })}
            onPatchTime={(v) => patch({ time: v })}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            t={t}
          />
        )}

        {step === 3 && (
          <Step2
            seatsTotal={draft.seatsTotal}
            pricePerSeat={draft.pricePerSeat}
            priceNegotiable={draft.priceNegotiable}
            luggage={draft.luggage}
            canStep2={canStep2}
            onPatchSeats={(v) => patch({ seatsTotal: v })}
            onPatchPrice={(v) => patch({ pricePerSeat: v })}
            onPatchNegotiable={(v) => patch({ priceNegotiable: v })}
            onPatchLuggage={(v) => patch({ luggage: v })}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
            t={t}
          />
        )}

        {step === 4 && (
          <Step3
            comment={draft.comment}
            prefSilence={draft.prefSilence}
            prefMusic={draft.prefMusic}
            prefNoSmoking={draft.prefNoSmoking}
            onPatchComment={(v) => patch({ comment: v })}
            onToggleSilence={() => patch({ prefSilence: !draft.prefSilence })}
            onToggleMusic={() => patch({ prefMusic: !draft.prefMusic })}
            onToggleNoSmoking={() => patch({ prefNoSmoking: !draft.prefNoSmoking })}
            onBack={() => setStep(3)}
            onNext={() => setStep(5)}
            t={t}
          />
        )}

        {step === 5 && (
          <StepPreview
            originCity={draft.originCity}
            destinationCity={draft.destinationCity}
            pickupCities={draft.pickupCities}
            dropoffCities={draft.dropoffCities}
            dateLabel={dateLabel}
            time={draft.time}
            seatsTotal={draft.seatsTotal}
            priceLabel={priceLabel}
            luggageLabel={t(luggageKey)}
            prefLabels={prefLabels}
            comment={draft.comment}
            isPending={isPending}
            createError={createError}
            onBack={() => {
              setStep(4);
              setCreateError(null);
            }}
            onPublish={() => {
              setCreateError(null);
              mutate();
            }}
            t={t}
          />
        )}
      </div>
    </>
  );
}
