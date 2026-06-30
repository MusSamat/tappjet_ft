"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X, Users, ArrowLeftRight, CarFront, Hand } from "lucide-react";
import { Segmented } from "@/components/ui/segmented";
import { listPassengerRequests, type PassengerRequest } from "@/lib/api/passenger-requests";
import { RequestCard } from "@/components/features/passenger-requests/request-card";
import { RequestDetailPane } from "@/components/features/passenger-requests/request-detail-pane";
import { RequestFilters } from "@/components/features/passenger-requests/request-filters";
import { Spinner } from "@/components/ui/spinner";
import { RequestCardSkeletonList } from "@/components/features/passenger-requests/request-card-skeleton";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";

// ── Mobile route bar (mirrors trips layout) ──────────────────────────────────
function MobileRouteBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const t = useTranslations("request_filters");
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2 py-2">
      <CityAutocomplete
        compact
        value={from}
        onChange={(v) => update({ from: v || null })}
        placeholder={t("from_placeholder")}
        className="flex-1"
      />
      <button
        type="button"
        onClick={() => update({ from: to || null, to: from || null })}
        disabled={!from && !to}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:border-sky-300 hover:text-sky-600 disabled:opacity-30 transition-colors"
        aria-label={t("swap_aria")}
      >
        <ArrowLeftRight className="h-3 w-3" aria-hidden />
      </button>
      <CityAutocomplete
        compact
        value={to}
        onChange={(v) => update({ to: v || null })}
        placeholder={t("to_placeholder")}
        className="flex-1"
      />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RequestsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const t = useTranslations("requests");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const filters = {
    from_city: params.get("from") ?? undefined,
    to_city: params.get("to") ?? undefined,
    date: params.get("date") ?? undefined,
    seats: params.get("seats") ? Number(params.get("seats")) : undefined,
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["passenger-requests", filters],
    queryFn: ({ pageParam }) =>
      listPassengerRequests({ ...filters, cursor: pageParam as string | undefined, limit: 20 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
  });

  const requests = data?.pages.flatMap((p) => p.data) ?? [];
  const selectedRequest: PassengerRequest | null =
    requests.find((r) => r.id === selectedId) ?? requests[0] ?? null;

  useEffect(() => {
    if (requests.length && !selectedId) setSelectedId(requests[0]?.id ?? null);
  }, [requests.length]);

  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen || mobileDetailOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileFiltersOpen, mobileDetailOpen]);

  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasNextPage) return;
    const io = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting && !isFetchingNextPage) void fetchNextPage(); },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const heading =
    filters.from_city && filters.to_city
      ? `${filters.from_city} → ${filters.to_city}`
      : t("page_title");

  const empty = (
    <div className="rounded-2xl border-[0.5px] border-gray-200 bg-white p-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100">
        <Users className="h-6 w-6 text-sky-400" aria-hidden />
      </div>
      <p className="text-[16px] font-bold text-gray-800">{t("no_requests")}</p>
      <p className="mt-1 text-[13px] text-gray-500">
        {Object.values(filters).some(Boolean)
          ? t("no_requests_hint_filter")
          : t("no_requests_hint_empty")}
      </p>
    </div>
  );

  const list = (onSelect?: (id: string) => void) => (
    <div className="flex flex-col gap-2">
      {requests.map((req, i) => (
        <div
          key={req.id}
          className="animate-card-in"
          style={{ animationDelay: `${Math.min(i, 10) * 45}ms` }}
        >
          <RequestCard
            request={req}
            onClick={
              onSelect
                ? () => onSelect(req.id)
                : () => setSelectedId(req.id)
            }
            className={
              !onSelect && selectedId === req.id
                ? "border-sky-400 shadow-[0_0_0_2px_#E0F2FE]"
                : ""
            }
          />
        </div>
      ))}
      {isFetchingNextPage && <RequestCardSkeletonList count={3} />}
      <div ref={sentinel} className="flex h-8 items-center justify-center">
        {false && <Spinner size={20} />}
        {!hasNextPage && requests.length > 5 && (
          <span className="text-[11px] font-semibold text-gray-400">{t("no_more")}</span>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ===== DESKTOP (≥1024px): 3-column ===== */}
      <div className="hidden lg:flex lg:justify-center" style={{ height: "calc(100vh - 64px)" }}>
        <div
          className="grid w-full max-w-[1500px]"
          style={{ gridTemplateColumns: "240px 1fr 360px" }}
        >
          {/* LEFT: Filters */}
          <div className="overflow-y-auto border-r border-gray-200 bg-white p-5">
            <RequestFilters />
          </div>

          {/* MIDDLE: List */}
          <div className="overflow-y-auto bg-gray-50 px-6 py-5">
            <div className="mb-4">
              <h1 className="text-[22px] font-extrabold text-gray-900">{heading}</h1>
              <p className="mt-1 text-[12px] font-semibold text-gray-500">
                {isLoading ? t("loading") : t("count", { n: requests.length })}
              </p>
            </div>
            {isLoading ? (
              <RequestCardSkeletonList />
            ) : requests.length === 0 ? empty : list()}
          </div>

          {/* RIGHT: Detail */}
          <div className="overflow-y-auto border-l border-gray-200 bg-white px-6 py-5">
            {selectedRequest ? (
              <RequestDetailPane request={selectedRequest} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-[13px] font-semibold text-gray-500">{t("select_request")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== MOBILE / TABLET (<1024px) ===== */}
      <div className="lg:hidden">
        {/* Sticky header */}
        <div className="sticky top-0 z-20 bg-white md:top-16">
          <div className="border-b border-gray-100 px-4 pt-3">
            <div className="mx-auto max-w-[1100px]">
              <Segmented
                value="requests"
                tone="grape"
                onChange={(v) => { if (v === "trips") router.push("/trips"); }}
                options={[
                  { value: "trips", label: "Поездки", icon: <CarFront className="h-4 w-4" /> },
                  { value: "requests", label: "Заявки", icon: <Hand className="h-4 w-4" /> },
                ]}
              />
            </div>
          </div>
          <div className="border-b border-gray-100">
            <div className="mx-auto max-w-[1100px] px-4">
              <MobileRouteBar />
            </div>
          </div>
          <div className="border-b border-gray-100">
            <div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-2">
              <p className="text-[12px] font-semibold text-gray-400">
                {isLoading ? t("loading") : requests.length > 0 ? t("count", { n: requests.length }) : t("no_requests")}
              </p>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-bold text-gray-700 shadow-sm active:bg-gray-50"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-sky-500" aria-hidden />
                {t("filters_title")}
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="mx-auto max-w-[1100px] px-4 py-4">
          {isLoading ? (
            <RequestCardSkeletonList />
          ) : requests.length === 0 ? empty : list((id) => {
            setSelectedId(id);
            setMobileDetailOpen(true);
          })}
        </div>

        {/* Backdrop */}
        {(mobileFiltersOpen || mobileDetailOpen) && (
          <div
            className="fixed inset-0 z-30 bg-black/40"
            onClick={() => { setMobileFiltersOpen(false); setMobileDetailOpen(false); }}
          />
        )}

        {/* Filters bottom sheet */}
        <div
          className={`search-sheet fixed bottom-0 left-0 right-0 z-40 max-h-[85vh] overflow-y-auto rounded-t-[20px] bg-white${mobileFiltersOpen ? " open" : ""}`}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-[17px] font-extrabold text-gray-900">{t("filters_title")}</h2>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <div className="px-5 py-5">
            <RequestFilters />
          </div>
          <div className="border-t border-gray-100 px-5 py-4">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="h-12 w-full rounded-xl bg-sky-600 text-[15px] font-bold text-white hover:bg-sky-700"
            >
              {t("show_btn")}
            </button>
          </div>
        </div>

        {/* Detail bottom sheet */}
        <div
          className={`search-sheet fixed bottom-0 left-0 right-0 z-40 max-h-[90vh] overflow-y-auto rounded-t-[20px] bg-white${mobileDetailOpen ? " open" : ""}`}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-[17px] font-extrabold text-gray-900">{t("request_label")}</h2>
            <button
              type="button"
              onClick={() => setMobileDetailOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <div className="px-5 py-5">
            {selectedRequest && <RequestDetailPane request={selectedRequest} />}
          </div>
        </div>
      </div>
    </>
  );
}
