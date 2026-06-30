import { User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type SeatTone = "free" | "taken" | "needed";

const TONE: Record<SeatTone, string> = {
  free: "text-brand-600",
  taken: "text-ink-400",
  needed: "text-grape-500",
};

interface SeatStackProps {
  /** taken (grey), free (teal), needed (grape) — rendered left→right, overlapping */
  taken?: number;
  free?: number;
  needed?: number;
  /** icon size in px */
  size?: number;
  className?: string;
}

/**
 * Overlapping person-icons showing seat occupancy. First fully visible, the rest
 * peek out behind it (white halo via the `.seat` utility separates them).
 */
export function SeatStack({ taken = 0, free = 0, needed = 0, size = 28, className }: SeatStackProps) {
  const seats: SeatTone[] = [
    ...Array(Math.max(0, taken)).fill("taken"),
    ...Array(Math.max(0, free)).fill("free"),
    ...Array(Math.max(0, needed)).fill("needed"),
  ];
  if (seats.length === 0) return null;
  const overlap = Math.round(size * 0.42);
  const label =
    needed > 0
      ? `Нужно ${needed} мест`
      : `Занято ${taken}, свободно ${free}`;

  return (
    <div className={cn("flex", className)} role="img" aria-label={label}>
      {seats.map((tone, i) => (
        <span
          key={i}
          className="relative"
          style={{ zIndex: seats.length - i, marginLeft: i === 0 ? 0 : -overlap }}
        >
          <User
            className={cn("seat", TONE[tone])}
            style={{ width: size, height: size }}
            aria-hidden="true"
          />
        </span>
      ))}
    </div>
  );
}
