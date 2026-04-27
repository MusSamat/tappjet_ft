"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, Users, Zap, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { createPassengerRequest, type CreatePassengerRequestInput } from "@/lib/api/passenger-requests";
import { extractError } from "@/lib/api/client";
import { friendlyError } from "@/lib/utils/api-error";
import { CityAutocomplete, DatePicker, Spinner } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/store/auth";

const DRAFT_KEY = "tappjet_req_draft";

interface DraftData {
  originCity: string;
  destinationCity: string;
  date: string;
  seatsNeeded: number;
  flexible: boolean;
  comment: string;
}

const EMPTY: DraftData = {
  originCity: "",
  destinationCity: "",
  date: "",
  seatsNeeded: 1,
  flexible: false,
  comment: "",
};

function todayStr() {
  return new Date().toISOString().split("T")[0]!;
}
function tomorrowStr() {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0]!;
}
function dayAfterStr() {
  const d = new Date(); d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0]!;
}

function loadDraft(): DraftData {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(DRAFT_KEY) : null;
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<DraftData>) };
  } catch { return EMPTY; }
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border-[1.5px] px-3.5 py-1.5 text-[12px] font-bold transition-colors",
        active
          ? "border-sky-600 bg-sky-50 text-sky-700"
          : "border-gray-200 text-gray-700 hover:border-sky-400",
      )}
    >
      {children}
    </button>
  );
}

export default function CreateRequestPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const t = useTranslations("requests.create");
  const status = useAuth((s) => s.status);
  const [draft, setDraft] = useState<DraftData>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "anonymous") {
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

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const iso = new Date(`${draft.date}T12:00:00Z`).toISOString();
      const input: CreatePassengerRequestInput = {
        originCity: draft.originCity,
        destinationCity: draft.destinationCity,
        seatsNeeded: draft.seatsNeeded,
        departureDate: iso,
        flexible: draft.flexible,
        ...(draft.comment.trim() ? { comment: draft.comment.trim() } : {}),
      };
      return createPassengerRequest(input);
    },
    onSuccess: () => {
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      void qc.invalidateQueries({ queryKey: ["passenger-requests"] });
      router.push("/my/requests");
    },
    onError: (e) => {
      setError(friendlyError(extractError(e)));
    },
  });

  const canSubmit =
    draft.originCity &&
    draft.destinationCity &&
    draft.originCity !== draft.destinationCity &&
    draft.date &&
    draft.seatsNeeded >= 1;

  const dateOptions = [
    { label: t("date_today"), value: todayStr() },
    { label: t("date_tomorrow"), value: tomorrowStr() },
    { label: t("date_dayafter"), value: dayAfterStr() },
  ];

  if (status === "loading" || status === "idle") {
    return <div className="flex min-h-[60vh] items-center justify-center"><Spinner size={28} /></div>;
  }

  return (
    <div className="mx-auto max-w-[640px] px-4 py-8">
      {/* Header */}
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-[13px] font-semibold text-gray-600 hover:bg-gray-100"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("back")}
      </button>

      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100">
        <Users className="h-5 w-5 text-sky-600" />
      </div>
      <h1 className="mb-1 text-[24px] font-extrabold text-gray-900">{t("title")}</h1>
      <p className="mb-6 text-[13px] text-gray-500">{t("subtitle")}</p>

      <div className="flex flex-col gap-5">
        {/* Route */}
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-sky-600">{t("route_label")}</p>
          <div className="flex flex-col gap-3 rounded-2xl border-[0.5px] border-sky-200 bg-white p-5">
            <CityAutocomplete
              label={t("from_label")}
              value={draft.originCity}
              onChange={(v) => patch({ originCity: v })}
              placeholder={t("from_placeholder")}
            />
            <CityAutocomplete
              label={t("to_label")}
              value={draft.destinationCity}
              onChange={(v) => patch({ destinationCity: v })}
              placeholder={t("to_placeholder")}
            />
          </div>
        </div>

        {/* Date */}
        <div>
          <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-sky-600">{t("date_label")}</p>
          <div className="flex flex-wrap items-center gap-2">
            {dateOptions.map(({ label, value }) => (
              <Chip key={value} active={draft.date === value} onClick={() => patch({ date: value })}>
                {label}
              </Chip>
            ))}
            <DatePicker
              value={/^\d{4}-\d{2}-\d{2}$/.test(draft.date) ? draft.date : ""}
              onChange={(v) => patch({ date: v })}
              min={todayStr()}
              placeholder={t("date_pick")}
              compact
            />
          </div>
        </div>

        {/* Seats */}
        <div className="rounded-2xl border-[0.5px] border-sky-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-bold text-gray-900">{t("seats_label")}</div>
              <div className="mt-0.5 text-[12px] text-gray-500">{t("seats_hint")}</div>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => patch({ seatsNeeded: Math.max(1, draft.seatsNeeded - 1) })}
                className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-gray-200 text-[18px] font-bold text-gray-700 hover:bg-gray-50"
                aria-label={t("seats_less_aria")}
              >
                −
              </button>
              <span className="min-w-[28px] text-center text-[26px] font-extrabold text-sky-700">
                {draft.seatsNeeded}
              </span>
              <button
                type="button"
                onClick={() => patch({ seatsNeeded: Math.min(8, draft.seatsNeeded + 1) })}
                className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-gray-200 text-[18px] font-bold text-gray-700 hover:bg-gray-50"
                aria-label={t("seats_more_aria")}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Flexible */}
        <button
          type="button"
          onClick={() => patch({ flexible: !draft.flexible })}
          className={cn(
            "flex w-full items-center justify-between rounded-2xl border-[1.5px] p-4 text-left transition-colors",
            draft.flexible ? "border-sky-200 bg-sky-50" : "border-gray-200 bg-white hover:border-sky-200",
          )}
        >
          <div className="flex items-center gap-3">
            <Zap className={cn("h-5 w-5", draft.flexible ? "text-sky-600" : "text-gray-400")} />
            <div>
              <div className="text-[14px] font-bold text-gray-900">{t("flexible_label")}</div>
              <div className="text-[12px] text-gray-500">{t("flexible_hint")}</div>
            </div>
          </div>
          <div className={cn("relative h-6 w-10 flex-shrink-0 rounded-full transition-colors", draft.flexible ? "bg-sky-600" : "bg-gray-200")}>
            <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", draft.flexible ? "left-0.5 translate-x-4" : "left-0.5")} />
          </div>
        </button>

        {/* Comment */}
        <div className="rounded-2xl border-[0.5px] border-gray-200 bg-white p-5">
          <div className="mb-2 flex items-center gap-2">
            <MessageCircle className="h-3.5 w-3.5 text-gray-400" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {t("comment_label")}
            </p>
          </div>
          <textarea
            rows={3}
            maxLength={500}
            value={draft.comment}
            onChange={(e) => patch({ comment: e.target.value })}
            placeholder={t("comment_placeholder")}
            className="w-full resize-none rounded-xl border-[1.5px] border-gray-200 bg-gray-50 px-4 py-3 text-[13px] font-semibold text-gray-900 outline-none focus:border-sky-500 placeholder:text-gray-400"
          />
          <div className="mt-1 text-right text-[11px] text-gray-400">{draft.comment.length}/500</div>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={!canSubmit || isPending}
          onClick={() => { setError(null); mutate(); }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 text-[14px] font-bold text-white transition-colors hover:bg-sky-700 disabled:opacity-40"
        >
          {isPending ? (
            <Spinner size={18} />
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              {t("publish")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
