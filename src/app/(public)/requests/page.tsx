"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { listPassengerRequests, type PassengerRequest } from "@/lib/api/passenger-requests";
import { RequestCard } from "@/components/features/passenger-requests/request-card";
import { RequestDetailPane } from "@/components/features/passenger-requests/request-detail-pane";
import { RequestFilters } from "@/components/features/passenger-requests/request-filters";
import { FeedHeader } from "@/components/features/search/feed-header";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeletonList } from "@/components/ui/card-skeleton";
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
    <EmptyState
      icon="request"
      iconTone="grape"
      title={t("empty_requests_title")}
      description={role === "driver" ? t("empty_requests_desc_driver") : t("empty_requests_desc")}
      action={action}
      className="bg-white shadow-card ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800"
    />
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RequestsPage() {
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

  const list = (onSelect?: (id: string) => void) => (
    <div className="space-y-2.5">
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
                ? "ring-2 ring-grape-400 dark:ring-grape-500"
                : ""
            }
          />
        </div>
      ))}
      {isFetchingNextPage && <CardSkeletonList variant="request" count={3} />}
      <div ref={sentinel} className="flex h-8 items-center justify-center">
        {!hasNextPage && requests.length > 5 && (
          <span className="text-[11px] font-800 text-ink-400">{t("no_more")}</span>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ===== DESKTOP (≥1024px): 3-column master-detail ===== */}
      <div className="hidden lg:flex lg:justify-center" style={{ height: "calc(100vh - 64px)" }}>
        <div className="grid w-full max-w-[1500px] lg:grid-cols-[260px_1fr_380px]">
          {/* LEFT: Filters */}
          <div className="overflow-y-auto border-r border-ink-100 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">
            <RequestFilters />
          </div>

          {/* MIDDLE: List */}
          <div className="overflow-y-auto bg-ink-50 px-6 py-5 dark:bg-ink-950">
            <div className="mb-4">
              <h1 className="font-disp text-[22px] font-900 text-ink-900 dark:text-white">{heading}</h1>
              <p className="mt-1 text-[12px] font-800 text-ink-500 dark:text-ink-400">
                {isLoading ? t("loading") : t("count", { n: requests.length })}
              </p>
            </div>
            {isLoading ? (
              <CardSkeletonList variant="request" />
            ) : requests.length === 0 ? <RequestsEmpty /> : list()}
          </div>

          {/* RIGHT: Detail */}
          <div className="overflow-y-auto border-l border-ink-100 bg-white px-6 py-5 dark:border-ink-800 dark:bg-ink-900">
            {selectedRequest ? (
              <RequestDetailPane request={selectedRequest} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-[13px] font-800 text-ink-500">{t("select_request")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== MOBILE / TABLET (<1024px): feed header + card list ===== */}
      <div className="lg:hidden">
        <FeedHeader tab="requests" onOpenFilters={() => setMobileFiltersOpen(true)} />

        <div className="px-4 pb-3">
          {isLoading ? (
            <CardSkeletonList variant="request" />
          ) : requests.length === 0 ? <RequestsEmpty /> : list((id) => {
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
          className={`search-sheet fixed bottom-0 left-0 right-0 z-40 max-h-[85vh] overflow-y-auto rounded-t-4xl bg-white dark:bg-ink-900${mobileFiltersOpen ? " open" : ""}`}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-800">
            <h2 className="text-[16px] font-900 text-ink-900 dark:text-white">{t("filters_title")}</h2>
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
              className="h-12 w-full rounded-2xl bg-accent-500 text-[15px] font-900 text-accent-ink shadow-cta transition-colors hover:bg-accent-400"
            >
              {t("show_btn")}
            </button>
          </div>
        </div>

        {/* Detail bottom sheet */}
        <div
          className={`search-sheet fixed bottom-0 left-0 right-0 z-40 max-h-[90vh] overflow-y-auto rounded-t-4xl bg-white dark:bg-ink-900${mobileDetailOpen ? " open" : ""}`}
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-800">
            <h2 className="text-[16px] font-900 text-ink-900 dark:text-white">{t("request_label")}</h2>
            <button
              type="button"
              onClick={() => setMobileDetailOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-100 text-ink-500 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300"
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
