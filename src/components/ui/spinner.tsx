import { cn } from "@/lib/utils/cn";

interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export function Spinner({ size = 20, className, label = "Загрузка" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-ink-300 border-t-brand-600",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}
