"use client";

import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { useState, useEffect, useCallback, memo } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { listPassengerRequests, type PassengerRequest } from "@/lib/api/passenger-requests";
import { RequestCard } from "@/components/features/passenger-requests/request-card";
import { RequestDetailPane } from "@/components/features/passenger-requests/request-detail-pane";
import { RequestFilters } from "@/components/features/passenger-requests/request-filters";
import { FeedHeader } from "@/components/features/search/feed-header";
import { RouteEntry } from "@/components/features/search/route-entry";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeletonList } from "@/components/ui/card-skeleton";
import { QueryError } from "@/components/ui/query-error";
import { BackToTop } from "@/components/ui/back-to-top";
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll";
import { useScrollRestoration } from "@/lib/hooks/use-scroll-restoration";
import { useUiRole } from "@/lib/hooks/use-role-colors";

/** Role-aware empty state for the requests feed (feed.empty_* keys). */
function RequestsEmpty() {
  const t = useTranslations("feed");
  const role = useUiRole();

  const action =
    role === "guest"
      ? { label: t("empty_cta_login"), href: "/auth/login" }
      : role === "driver"
        ? { label: t("empty_requests_cta_driver"), href: "/trips/create" }
        : { label: t("empty_requests_cta"), href: "/requests/create" };

  return (
    <div className="flex flex-col gap-5">
      <EmptyState
        icon="request"
        iconTone="grape"
        title={t("empty_requests_title")}
        description={role === "driver" ? t("empty_requests_desc_driver") : t("empty_requests_desc")}
        action={action}
        className="bg-white shadow-card ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800"
      />
    </div>
  );
}

// Memoized row so selection re-renders only the affected cards (RequestCard is
// memo'd; onSelect is stable from the parent).
const FeedRequestRow = memo(function FeedRequestRow({
  request,
  index,
  active,
  onSelect,
}: {
  request: PassengerRequest;
  index: number;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="animate-card-in" style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}>
      <RequestCard
        request={request}
        onClick={() => onSelect(request.id)}
        className={active ? "ring-2 ring-grape-400 dark:ring-grape-500" : ""}
      />
    </div>
  );
});

// ── Feed ──────────────────────────────────────────────────────────────────────
// Self-contained requests feed (route gate → results → filters/detail sheets).
// Mounted by the unified home `/` (driver mode) and the legacy /requests route.
export function RequestsFeed() {
  const params = useSearchParams();
  const t = useTranslations("requests");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  // Chips write YYYY-MM-DD; the API wants full ISO. Anchor at KG midnight (+06:00).
  // No explicit date → default to today; «any» sentinel = no date filter.
  const rawDate =
    params.get("date") ?? new Date(Date.now() + 6 * 3_600_000).toISOString().slice(0, 10);
  const filters = {
    from_city: params.get("from") ?? undefined,
    to_city: params.get("to") ?? undefined,
    date: /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? `${rawDate}T00:00:00+06:00` : undefined,
    seats: params.get("seats") ? Number(params.get("seats")) : undefined,
  };

  // Route-first: don't fetch or show any requests until origin AND destination
  // are both set (matches the trips feed / «Межгород» flow).
  const hasRoute = Boolean(filters.from_city && filters.to_city);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error, refetch } = useInfiniteQuery({
    queryKey: ["passenger-requests", filters],
    queryFn: ({ pageParam }) =>
      listPassengerRequests({ ...filters, cursor: pageParam as string | undefined, limit: 20 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled: hasRoute,
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

  const sentinel = useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });
  useScrollRestoration();

  // Card tap → open the detail sheet (same on all widths now).
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setMobileDetailOpen(true);
  }, []);

  const nearby = data?.pages[0]?.nearby === true;

  if (!hasRoute) {
    return <RouteEntry mode="requests" modeSwitchable initialFrom={filters.from_city} initialTo={filters.to_city} />;
  }

  return (
    <>
      <BackToTop showOnDesktop />

      {/* ONE structure for all widths (same concept as the trips feed): header
          on top → results grid (1 col mobile, 2 cols ≥md) → centered sheets. */}
      <div className="mx-auto w-full max-w-[900px]">
        <FeedHeader tab="requests" onOpenFilters={() => setMobileFiltersOpen(true)} />

        <div className="px-4 pb-6">
          {isLoading ? (
            <CardSkeletonList variant="request" />
          ) : isError ? (
            <QueryError error={error} onRetry={() => void refetch()} />
          ) : requests.length === 0 ? (
            <RequestsEmpty />
          ) : (
            <>
              {nearby && (
                <div className="mb-2.5 rounded-2xl bg-accent-50 px-4 py-2.5 text-[14px] font-700 text-accent-700 dark:bg-accent-500/10 dark:text-accent-300">
                  {t("nearby_notice")}
                </div>
              )}
              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                {requests.map((req, i) => (
                  <FeedRequestRow key={req.id} request={req} index={i} active={false} onSelect={handleSelect} />
                ))}
              </div>
              {isFetchingNextPage && <CardSkeletonList variant="request" count={2} className="mt-2.5" />}
              <div ref={sentinel} className="flex h-8 items-center justify-center">
                {!hasNextPage && requests.length > 5 && (
                  <span className="text-[12px] font-800 text-ink-400">{t("no_more")}</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {(mobileFiltersOpen || mobileDetailOpen) && (
        <div
          className="fixed inset-0 z-30 bg-black/40"
          onClick={() => { setMobileFiltersOpen(false); setMobileDetailOpen(false); }}
        />
      )}

      {/* Filters sheet — full-width on mobile, centered + width-capped on desktop */}
      <div
        className={`search-sheet sheet-nav-pad fixed bottom-0 left-0 right-0 z-40 mx-auto max-h-[85vh] w-full max-w-[520px] overflow-y-auto rounded-t-4xl bg-white dark:bg-ink-900${mobileFiltersOpen ? " open" : ""}`}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-800">
          <h2 className="text-[17px] font-900 text-ink-900 dark:text-white">{t("filters_title")}</h2>
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-100 text-ink-500 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="px-5 py-5">
          <RequestFilters />
        </div>
        <div className="border-t border-ink-100 px-5 py-4 dark:border-ink-800">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(false)}
            className="h-12 w-full rounded-2xl bg-accent-500 text-[16px] font-900 text-accent-ink shadow-cta transition-colors hover:bg-accent-400"
          >
            {t("show_btn")}
          </button>
        </div>
      </div>

      {/* Detail sheet */}
      <div
        className={`search-sheet sheet-nav-pad fixed bottom-0 left-0 right-0 z-40 mx-auto max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-t-4xl bg-white dark:bg-ink-900${mobileDetailOpen ? " open" : ""}`}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-800">
          <h2 className="text-[17px] font-900 text-ink-900 dark:text-white">{t("request_label")}</h2>
          <button
            type="button"
            onClick={() => setMobileDetailOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-100 text-ink-500 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        {selectedRequest && <RequestDetailPane request={selectedRequest} />}
      </div>
    </>
  );
}
