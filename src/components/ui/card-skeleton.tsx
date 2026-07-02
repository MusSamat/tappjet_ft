import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

// Loading placeholders mirroring the redesigned card shapes (design-spec §1.5/§1.6).

export type CardSkeletonVariant = "trip" | "request" | "booking";

const CARD =
  "animate-pulse rounded-3xl bg-white p-3.5 shadow-card ring-1 ring-ink-100 motion-reduce:animate-none dark:bg-ink-900 dark:ring-ink-800";
const BAR = "rounded-full bg-ink-100 dark:bg-ink-800";

function TripBars() {
  return (
    <>
      <div className="flex items-center gap-2.5 pr-7">
        <div className={cn(BAR, "h-14 w-1")} />
        <div className="min-w-0 flex-1 space-y-2">
          <div className={cn(BAR, "h-4 w-2/5")} />
          <div className={cn(BAR, "h-3 w-3/5")} />
          <div className={cn(BAR, "h-4 w-1/3")} />
        </div>
        <div className={cn(BAR, "h-5 w-14 self-start")} />
      </div>
      <div className="mt-2.5 flex items-center gap-2 border-t border-ink-100 pt-2.5 dark:border-ink-800">
        <div className={cn(BAR, "h-6 w-6 shrink-0")} />
        <div className={cn(BAR, "h-3 w-24")} />
        <div className={cn(BAR, "ml-auto h-3.5 w-12")} />
      </div>
    </>
  );
}

function RequestBars() {
  return (
    <>
      <div className="flex items-center gap-2.5">
        <div className={cn("h-10 w-10 shrink-0 rounded-2xl bg-ink-100 dark:bg-ink-800")} />
        <div className="min-w-0 flex-1 space-y-2">
          <div className={cn(BAR, "h-4 w-2/5")} />
          <div className={cn(BAR, "h-3 w-1/3")} />
        </div>
        <div className={cn(BAR, "h-5 w-14")} />
      </div>
      <div className="mt-2.5 h-12 rounded-2xl bg-ink-50 dark:bg-ink-800/60" />
      <div className="mt-2.5 flex items-center gap-3">
        <div className={cn(BAR, "h-3 w-16")} />
        <div className={cn(BAR, "h-3 w-12")} />
        <div className={cn(BAR, "ml-auto h-3 w-6")} />
      </div>
    </>
  );
}

function BookingBars() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className={cn(BAR, "h-5 w-24")} />
        <div className={cn(BAR, "h-3 w-16")} />
      </div>
      <div className={cn(BAR, "mt-2.5 h-4 w-3/5")} />
      <div className="mt-2.5 flex items-center justify-between border-t border-ink-100 pt-2.5 dark:border-ink-800">
        <div className="flex items-center gap-2">
          <div className={cn(BAR, "h-6 w-6")} />
          <div className={cn(BAR, "h-3 w-28")} />
        </div>
        <div className={cn(BAR, "h-8 w-20")} />
      </div>
    </>
  );
}

export function CardSkeleton({
  variant = "trip",
  className,
}: {
  variant?: CardSkeletonVariant;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={cn(CARD, className)}>
      {variant === "trip" && <TripBars />}
      {variant === "request" && <RequestBars />}
      {variant === "booking" && <BookingBars />}
    </div>
  );
}

export function CardSkeletonList({
  variant = "trip",
  count = 3,
  className,
}: {
  variant?: CardSkeletonVariant;
  count?: number;
  className?: string;
}) {
  const t = useTranslations("common");
  return (
    <div role="status" aria-busy="true" aria-live="polite" className={cn("space-y-2.5", className)}>
      <span className="sr-only">{t("loading")}</span>
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}
