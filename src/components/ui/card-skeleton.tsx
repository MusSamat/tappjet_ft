import { cn } from "@/lib/utils/cn";

/**
 * Loading placeholder that mirrors design-system.html §11 (lines 607-616):
 * a pulsing card with a top row, a title bar and a subtitle bar.
 * Decorative — hidden from assistive tech; announce loading on the list wrapper.
 */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-2xl border-l-[5px] border-ink-200 bg-ink-50 p-4 motion-reduce:animate-none",
        className,
      )}
    >
      <div className="mb-3 flex justify-between">
        <div className="h-4 w-20 rounded-full bg-ink-200" />
        <div className="h-4 w-16 rounded-full bg-ink-200" />
      </div>
      <div className="mb-2 h-5 w-32 rounded-full bg-ink-200" />
      <div className="h-3 w-24 rounded-full bg-ink-200" />
    </div>
  );
}

export function CardSkeletonList({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn("space-y-3", className)}
    >
      <span className="sr-only">Загрузка</span>
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
