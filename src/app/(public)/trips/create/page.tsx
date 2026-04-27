"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { createTrip, type CreateTripInput, type LuggageOption } from "@/lib/api/trips-create";
import { extractError } from "@/lib/api/client";
import { friendlyError } from "@/lib/utils/api-error";
import { Spinner } from "@/components/ui";
import { useAuth } from "@/store/auth";
import { saveDeferredAction } from "@/lib/auth/deferred-action";
import { Step1 } from "./_steps/step-1";
import { Step2 } from "./_steps/step-2";
import { Step3 } from "./_steps/step-3";

const DRAFT_KEY = "tappjet_trip_draft";

interface DraftData {
  originCity: string;
  destinationCity: string;
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

const TIME_OPTIONS = ["06:00", "08:00", "09:00", "10:00", "12:00", "15:00", "17:00", "20:00", "22:00"];

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

function loadDraft(): DraftData {
  const base = { ...EMPTY, date: tomorrowStr() };
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return base;
    return { ...base, ...(JSON.parse(raw) as Partial<DraftData>) };
  } catch {
    return base;
  }
}

export default function CreateTripPage() {
  const router = useRouter();
  const t = useTranslations("trips.create");
  const status = useAuth((s) => s.status);
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<DraftData>(EMPTY);

  useEffect(() => {
    if (status === "anonymous") {
      saveDeferredAction({ action: "book_trip", trip_id: "", seats: 1 });
      router.replace("/auth/login");
      return;
    }
    setDraft(loadDraft());
  }, [status, router]);

  const patch = (update: Partial<DraftData>) => {
    setDraft((prev) => {
      const next = { ...prev, ...update };
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(next)); } catch {}
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
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      router.push(`/trips/${trip.id}`);
    },
    onError: (e) => {
      setCreateError(friendlyError(extractError(e)));
    },
  });

  const canStep1 =
    draft.originCity &&
    draft.destinationCity &&
    draft.originCity !== draft.destinationCity &&
    draft.date;
  const canStep2 = draft.seatsTotal >= 1 && draft.pricePerSeat >= 50;

  const dateOptions = [
    { label: t("date_today"), value: todayStr() },
    { label: t("date_tomorrow"), value: tomorrowStr() },
    { label: t("date_dayafter"), value: dayAfterStr() },
  ];

  if (status === "loading" || status === "idle") {
    return <div className="flex min-h-[60vh] items-center justify-center"><Spinner size={28} /></div>;
  }

  return (
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
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {step === 1 && (
        <Step1
          originCity={draft.originCity}
          destinationCity={draft.destinationCity}
          date={draft.date}
          time={draft.time}
          canStep1={!!canStep1}
          dateOptions={dateOptions}
          timeOptions={TIME_OPTIONS}
          todayStr={todayStr()}
          onPatchOrigin={(v) => patch({ originCity: v })}
          onPatchDestination={(v) => patch({ destinationCity: v })}
          onPatchDate={(v) => patch({ date: v })}
          onPatchTime={(v) => patch({ time: v })}
          onNext={() => setStep(2)}
          t={t}
        />
      )}

      {step === 2 && (
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
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
          t={t}
        />
      )}

      {step === 3 && (
        <Step3
          comment={draft.comment}
          prefSilence={draft.prefSilence}
          prefMusic={draft.prefMusic}
          prefNoSmoking={draft.prefNoSmoking}
          isPending={isPending}
          createError={createError}
          onPatchComment={(v) => patch({ comment: v })}
          onToggleSilence={() => patch({ prefSilence: !draft.prefSilence })}
          onToggleMusic={() => patch({ prefMusic: !draft.prefMusic })}
          onToggleNoSmoking={() => patch({ prefNoSmoking: !draft.prefNoSmoking })}
          onBack={() => { setStep(2); setCreateError(null); }}
          onPublish={() => { setCreateError(null); mutate(); }}
          t={t}
        />
      )}
    </div>
  );
}
