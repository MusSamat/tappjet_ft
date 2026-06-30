"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Users, Star, Shield, ChevronDown, Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  listMyPassengerRequests,
  cancelPassengerRequest,
  listRequestResponses,
  acceptRequestResponse,
  declineRequestResponse,
  type PassengerRequest,
  type RequestResponse,
} from "@/lib/api/passenger-requests";
import { extractError } from "@/lib/api/client";
import { friendlyError } from "@/lib/utils/api-error";
import { RequestCard } from "@/components/features/passenger-requests/request-card";
import { DriverAvatar } from "@/components/ui/driver-avatar";
import { Container, Spinner } from "@/components/ui";
import { RequestCardSkeletonList } from "@/components/features/passenger-requests/request-card-skeleton";

// ── Response offer card ────────────────────────────────────────────────
function OfferCard({
  response,
  requestId,
  onAccepted,
}: {
  response: RequestResponse;
  requestId: string;
  onAccepted: (bookingId: string) => void;
}) {
  const qc = useQueryClient();
  const t = useTranslations("requests.my");
  const [error, setError] = useState<string | null>(null);

  const acceptMut = useMutation({
    mutationFn: () => acceptRequestResponse(requestId, response.id),
    onSuccess: ({ bookingId }) => {
      void qc.invalidateQueries({ queryKey: ["passenger-requests", "my"] });
      onAccepted(bookingId);
    },
    onError: (e) => setError(friendlyError(extractError(e))),
  });

  const declineMut = useMutation({
    mutationFn: () => declineRequestResponse(requestId, response.id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["request-responses", requestId] }),
    onError: (e) => setError(friendlyError(extractError(e))),
  });

  const isPending = response.status === "pending";
  const isAccepted = response.status === "accepted";
  const isDeclined = response.status === "declined";

  return (
    <div className={`rounded-2xl border bg-white p-4 ${isDeclined ? "opacity-50" : isAccepted ? "border-teal-300" : "border-gray-200"}`}>
      <div className="flex items-start gap-3">
        <DriverAvatar name={response.driver.name} src={response.driver.avatarUrl} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-bold text-gray-900">{response.driver.name}</span>
            {response.driver.verified && <Shield className="h-3.5 w-3.5 text-teal-500" aria-hidden />}
            {response.driver.rating !== null && (
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden />
                <span className="text-[11px] font-bold text-gray-600">{response.driver.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
            <span className="text-[18px] font-extrabold text-sky-600">{response.price} {t("som")}</span>
            <span className="text-[12px] text-gray-500">
              {new Date(response.departureTime).toLocaleString("ru-RU", {
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {response.message && (
            <p className="mt-1.5 text-[12px] leading-relaxed text-gray-600">«{response.message}»</p>
          )}
        </div>

        {isPending && (
          <div className="flex flex-shrink-0 gap-2">
            <button
              type="button"
              disabled={acceptMut.isPending || declineMut.isPending}
              onClick={() => { setError(null); acceptMut.mutate(); }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 transition-colors"
              aria-label={t("accept_aria")}
            >
              {acceptMut.isPending ? <Spinner size={14} /> : <Check className="h-4 w-4" />}
            </button>
            <button
              type="button"
              disabled={acceptMut.isPending || declineMut.isPending}
              onClick={() => { setError(null); declineMut.mutate(); }}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:border-coral-300 hover:text-coral-600 disabled:opacity-40 transition-colors"
              aria-label={t("reject_aria")}
            >
              {declineMut.isPending ? <Spinner size={14} /> : <X className="h-4 w-4" />}
            </button>
          </div>
        )}
        {isAccepted && (
          <span className="flex-shrink-0 rounded-full bg-teal-100 px-2.5 py-1 text-[11px] font-bold text-teal-700">
            {t("accepted")}
          </span>
        )}
        {isDeclined && (
          <span className="flex-shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-500">
            {t("rejected")}
          </span>
        )}
      </div>
      {error && <p className="mt-2 text-[12px] font-semibold text-coral-600">{error}</p>}
    </div>
  );
}

// ── Request with expandable offers ────────────────────────────────────
function RequestWithOffers({
  request,
  onCancel,
  cancelLoading,
}: {
  request: PassengerRequest;
  onCancel?: () => void;
  cancelLoading?: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("requests.my");
  const [expanded, setExpanded] = useState(false);
  const isOpen = request.status === "open";

  const { data: responses, isLoading } = useQuery({
    queryKey: ["request-responses", request.id],
    queryFn: () => listRequestResponses(request.id),
    enabled: expanded && isOpen,
    staleTime: 30_000,
  });

  const pending = responses?.filter((r) => r.status === "pending") ?? [];

  return (
    <div className="flex flex-col gap-2">
      <RequestCard
        request={request}
        onCancel={onCancel}
        cancelLoading={cancelLoading}
      />

      {isOpen && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center justify-between rounded-xl border border-dashed border-sky-200 bg-sky-50 px-4 py-2.5 text-left hover:border-sky-300 hover:bg-sky-100 transition-colors"
        >
          <span className="text-[12px] font-bold text-sky-700">
            {expanded
              ? t("hide_offers")
              : pending.length > 0
              ? t("offers_count", { n: pending.length })
              : t("offers_title")}
          </span>
          <ChevronDown className={`h-4 w-4 text-sky-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      )}

      {expanded && isOpen && (
        <div className="flex flex-col gap-2 pl-2">
          {isLoading ? (
            <div className="flex justify-center py-4"><Spinner size={20} /></div>
          ) : !responses?.length ? (
            <p className="py-3 text-center text-[12px] font-semibold text-gray-400">
              {t("no_offers")}
            </p>
          ) : (
            responses.map((r) => (
              <OfferCard
                key={r.id}
                response={r}
                requestId={request.id}
                onAccepted={(bookingId) => router.push(`/my/bookings?booking=${bookingId}`)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────
export default function MyRequestsPage() {
  const qc = useQueryClient();
  const t = useTranslations("requests.my");

  const { data, isLoading } = useQuery({
    queryKey: ["passenger-requests", "my"],
    queryFn: listMyPassengerRequests,
  });

  const cancelMut = useMutation({
    mutationFn: cancelPassengerRequest,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["passenger-requests", "my"] }),
  });

  const requests = data?.data ?? [];
  const open = requests.filter((r) => r.status === "open");
  const past = requests.filter((r) => r.status !== "open");

  return (
    <Container className="py-6 sm:py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold text-gray-900 sm:text-[26px]">{t("title")}</h1>
          <p className="mt-0.5 text-[13px] text-gray-500">{t("subtitle")}</p>
        </div>
        <Link href="/requests/create">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-sky-700"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t("create_label")}</span>
            <span className="sm:hidden">{t("create_btn")}</span>
          </button>
        </Link>
      </div>

      {isLoading ? (
        <RequestCardSkeletonList count={4} />
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-sky-300 bg-sky-50 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
            <Users className="h-8 w-8 text-sky-400" />
          </div>
          <p className="text-[16px] font-bold text-gray-700">{t("empty_title")}</p>
          <p className="mt-1 mb-5 text-[13px] text-gray-500">{t("empty_hint")}</p>
          <Link href="/requests/create">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-2.5 text-[14px] font-bold text-white hover:bg-sky-700"
            >
              <Plus className="h-4 w-4" />
              {t("create_label")}
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {open.length > 0 && (
            <section>
              <h2 className="mb-3 text-[13px] font-bold uppercase tracking-widest text-sky-600">
                {t("open_count", { n: open.length })}
              </h2>
              <div className="flex flex-col gap-4">
                {open.map((req) => (
                  <RequestWithOffers
                    key={req.id}
                    request={req}
                    onCancel={() => cancelMut.mutate(req.id)}
                    cancelLoading={cancelMut.isPending && cancelMut.variables === req.id}
                  />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="mb-3 text-[13px] font-bold uppercase tracking-widest text-gray-400">
                {t("history_count", { n: past.length })}
              </h2>
              <div className="flex flex-col gap-3">
                {past.map((req) => (
                  <RequestCard key={req.id} request={req} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </Container>
  );
}
