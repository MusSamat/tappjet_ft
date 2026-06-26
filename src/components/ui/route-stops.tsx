import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Props {
  pickup?: string[] | null;
  dropoff?: string[] | null;
  className?: string;
}

/**
 * Compact pickup (board, origin side) / dropoff (alight, destination side)
 * cities row. Shared across every trip block so the presentation stays
 * consistent. Renders nothing when both lists are empty.
 */
export function RouteStops({ pickup, dropoff, className }: Props) {
  const hasPickup = (pickup?.length ?? 0) > 0;
  const hasDropoff = (dropoff?.length ?? 0) > 0;
  if (!hasPickup && !hasDropoff) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {hasPickup && (
        <span
          title="Посадка по пути"
          className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-md bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold text-teal-700"
        >
          <ArrowDownToLine className="h-2.5 w-2.5 flex-shrink-0" aria-hidden="true" />
          <span className="opacity-60">Посадка</span>
          <span className="truncate">{pickup!.join(", ")}</span>
        </span>
      )}
      {hasDropoff && (
        <span
          title="Высадка по пути"
          className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700"
        >
          <ArrowUpFromLine className="h-2.5 w-2.5 flex-shrink-0" aria-hidden="true" />
          <span className="opacity-60">Высадка</span>
          <span className="truncate">{dropoff!.join(", ")}</span>
        </span>
      )}
    </div>
  );
}
