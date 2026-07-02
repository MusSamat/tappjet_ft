import { cn } from "@/lib/utils/cn";

// Seat meter — design-spec §1.5 / §2.3 (`.seatmeter/.seatpill`): a row of
// vertical pills, taken (gray) first, free (teal) last.

export type SeatMeterSize = "sm" | "md" | "lg";

const PILL: Record<SeatMeterSize, string> = {
  /** card pills 7×14 */
  sm: "h-[14px] w-[7px] rounded-[3px]",
  /** detail mobile 20×26 */
  md: "h-[26px] w-[20px] rounded-md",
  /** detail desktop 26×32 */
  lg: "h-[32px] w-[26px] rounded-lg",
};

const GAP: Record<SeatMeterSize, string> = {
  sm: "gap-[3px]",
  md: "gap-[5px]",
  lg: "gap-[6px]",
};

const COUNT_TEXT: Record<SeatMeterSize, string> = {
  sm: "text-[10px]",
  md: "text-[12px]",
  lg: "text-[13px]",
};

export interface SeatMeterProps {
  free: number;
  total: number;
  size?: SeatMeterSize;
  /** numeric free-count next to the pills: 0 → danger, 1 → accent, else brand */
  showCount?: boolean;
  /** accessible label; defaults to "{free}/{total}" */
  label?: string;
  className?: string;
}

export function SeatMeter({ free, total, size = "sm", showCount = false, label, className }: SeatMeterProps) {
  const safeTotal = Math.max(0, Math.floor(total));
  const safeFree = Math.min(Math.max(0, Math.floor(free)), safeTotal);
  if (safeTotal === 0) return null;

  const countCls =
    safeFree === 0
      ? "text-danger-600"
      : safeFree === 1
        ? "text-accent-600"
        : "text-brand-700 dark:text-brand-300";

  return (
    <span
      role="img"
      aria-label={label ?? `${safeFree}/${safeTotal}`}
      className={cn("inline-flex shrink-0 items-center gap-1.5", className)}
    >
      <span className={cn("inline-flex items-center", GAP[size])} aria-hidden="true">
        {Array.from({ length: safeTotal }, (_, i) => {
          const isFree = i >= safeTotal - safeFree;
          return (
            <span
              key={i}
              className={cn(
                PILL[size],
                isFree ? "bg-brand-500" : "bg-ink-200 dark:bg-ink-700",
                // inner highlight on the bigger pills
                isFree && size !== "sm" && "shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
              )}
            />
          );
        })}
      </span>
      {showCount && (
        <span className={cn("font-900 leading-none", COUNT_TEXT[size], countCls)}>{safeFree}</span>
      )}
    </span>
  );
}

interface SeatStackProps {
  taken?: number;
  free?: number;
  needed?: number;
  /** legacy icon size in px — mapped onto SeatMeter sizes */
  size?: number;
  className?: string;
}

/** @deprecated compat shim over SeatMeter (pre-redesign API). Migrate call sites to SeatMeter. */
export function SeatStack({ taken = 0, free = 0, needed = 0, size = 28, className }: SeatStackProps) {
  const meterSize: SeatMeterSize = size <= 16 ? "sm" : size <= 26 ? "md" : "lg";
  if (needed > 0) {
    return <SeatMeter free={needed} total={needed} size={meterSize} className={className} />;
  }
  return <SeatMeter free={free} total={taken + free} size={meterSize} className={className} />;
}
