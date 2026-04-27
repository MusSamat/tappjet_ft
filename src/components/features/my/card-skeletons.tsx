import { Skeleton } from "@/components/ui/skeleton";

// Matches PassengerCard / RequestCard in my/bookings (passenger tab)
export function BookingCardSkeleton() {
  return (
    <div className="rounded-2xl border-[0.5px] border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-[15px] w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="mb-3 h-px bg-gray-100" />
      <div className="flex gap-6">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

// Matches DriverTripCard in my/bookings (driver tab)
export function DriverTripCardSkeleton() {
  return (
    <div className="rounded-2xl border-[0.5px] border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <Skeleton className="h-[16px] w-44" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="mb-3 h-px bg-gray-100" />
      <div className="flex gap-6">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

// Matches incoming RequestCard in my/bookings (requests tab)
export function IncomingRequestSkeleton() {
  return (
    <div className="rounded-2xl border-[0.5px] border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-[15px] w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="mb-3 h-16 w-full rounded-xl" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-xl" />
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>
    </div>
  );
}

export function BookingCardSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => <BookingCardSkeleton key={i} />)}
    </div>
  );
}

export function DriverTripCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => <DriverTripCardSkeleton key={i} />)}
    </div>
  );
}

export function IncomingRequestSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => <IncomingRequestSkeleton key={i} />)}
    </div>
  );
}
