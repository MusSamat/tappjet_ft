import { Skeleton } from "@/components/ui/skeleton";

export function TripCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white px-4 py-3">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-[18px] w-3/5" />
        <Skeleton className="h-3 w-2/5" />
      </div>
      <div className="flex flex-shrink-0 flex-col items-end gap-2">
        <Skeleton className="h-5 w-16" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export function TripCardSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <TripCardSkeleton key={i} />
      ))}
    </div>
  );
}
