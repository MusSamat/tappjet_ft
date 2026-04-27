import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const wrapperVariants = cva(
  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-caption font-semibold",
  {
    variants: {
      status: {
        accepted: "bg-teal-50 text-teal-900",
        pending: "bg-amber-50 text-amber-900",
        rejected: "bg-red-50 text-error",
        cancelled: "bg-gray-100 text-gray-700",
        completed: "bg-teal-50 text-teal-900",
      },
    },
    defaultVariants: { status: "pending" },
  },
);

const dotVariants = cva("h-2 w-2 rounded-full", {
  variants: {
    status: {
      accepted: "bg-success",
      pending: "bg-amber-500",
      rejected: "bg-error",
      cancelled: "bg-gray-500",
      completed: "bg-success",
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
