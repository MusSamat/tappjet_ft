"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getPassengerRequest } from "@/lib/api/passenger-requests";
import { useAuth } from "@/store/auth";
import { BackButton } from "@/components/ui/back-button";
import { Spinner } from "@/components/ui";
import { QueryError } from "@/components/ui/query-error";
import { RequestDetailPane } from "@/components/features/passenger-requests/request-detail-pane";
import { RequestWithOffers } from "@/app/(protected)/my/bookings/_components/my-requests-tab";

// Standalone request page (linked from «Мои», favorites, notifications).
// Owner sees their request + driver offers to accept; everyone else sees the
// detail pane with respond / call actions.

export default function RequestPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const t = useTranslations("requests");
  const myId = useAuth((s) => s.user?.id);

  const { data: request, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["passenger-request", id],
    queryFn: () => getPassengerRequest(id),
    staleTime: 15_000,
  });

  return (
    <div className="mx-auto w-full max-w-[640px] px-3 py-5 sm:px-4">
      <BackButton />
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size={26} />
        </div>
      ) : isError || !request ? (
        <QueryError error={error} onRetry={() => void refetch()} />
      ) : myId && request.passengerId === myId ? (
        <>
          <h1 className="mb-3 text-[20px] font-900 text-ink-900 dark:text-white">{t("own_title")}</h1>
          <RequestWithOffers request={request} />
        </>
      ) : (
        <div className="rounded-3xl bg-white p-4 shadow-card ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
          <RequestDetailPane request={request} />
        </div>
      )}
    </div>
  );
}
