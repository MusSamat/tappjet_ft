import { Skeleton } from "@/components/ui/skeleton";

export function RequestCardSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border-[0.5px] border-gray-100 bg-white px-4 py-3">
      <Skeleton className="h-9 w-9 flex-shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2 pt-0.5">
        <Skeleton className="h-[15px] w-2/5" />
        <Skeleton className="h-[18px] w-3/5" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-5 w-14 flex-shrink-0" />
    </div>
  );
}

export function RequestCardSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <RequestCardSkeleton key={i} />
      ))}
    </div>
  );
}
