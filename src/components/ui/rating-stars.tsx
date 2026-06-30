import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface RatingStarsProps {
  value: number;
  max?: number;
  size?: number;
  showValue?: boolean;
  className?: string;
}

export function RatingStars({
  value,
  max = 5,
  size = 14,
  showValue = false,
  className,
}: RatingStarsProps) {
  const rounded = Math.round(value * 2) / 2;
  const filled = Math.floor(rounded);
  const half = rounded - filled === 0.5;

  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      role="img"
      aria-label={`Рейтинг ${value.toFixed(1)} из ${max}`}
    >
      <span className="relative inline-flex">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            width={size}
            height={size}
            className={cn(
              i < filled
                ? "fill-accent-500 stroke-accent-500"
                : i === filled && half
                  ? "fill-accent-500/50 stroke-accent-500"
                  : "fill-transparent stroke-ink-300",
            )}
            aria-hidden="true"
          />
        ))}
      </span>
      {showValue && <span className="text-caption font-bold text-ink-900">{value.toFixed(1)}</span>}
    </span>
  );
}
