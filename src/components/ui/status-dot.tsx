import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const wrapperVariants = cva(
  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-caption font-semibold",
  {
    variants: {
      status: {
        accepted: "bg-brand-50 text-brand-700",
        pending: "bg-accent-100 text-accent-700",
        rejected: "bg-coral-100 text-coral-600",
        cancelled: "bg-ink-100 text-ink-600",
        completed: "bg-brand-50 text-brand-700",
      },
    },
    defaultVariants: { status: "pending" },
  },
);

const dotVariants = cva("h-2 w-2 rounded-full", {
  variants: {
    status: {
      accepted: "bg-brand-500",
      pending: "bg-accent-500",
      rejected: "bg-coral-500",
      cancelled: "bg-ink-400",
      completed: "bg-brand-500",
    },
  },
  defaultVariants: { status: "pending" },
});

interface StatusDotProps extends VariantProps<typeof wrapperVariants> {
  label: string;
  className?: string;
}

export function StatusDot({ status, label, className }: StatusDotProps) {
  return (
    <span className={cn(wrapperVariants({ status }), className)}>
      <span className={cn(dotVariants({ status }))} aria-hidden="true" />
      {label}
    </span>
  );
}
