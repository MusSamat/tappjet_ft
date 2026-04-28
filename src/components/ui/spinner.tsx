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
        "inline-block animate-spin rounded-full border-2 border-gray-300 border-t-teal-600",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}
