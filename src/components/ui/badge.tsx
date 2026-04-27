import { cva, type VariantProps } from "class-variance-authority";
import { ShieldCheck, Users, Clock } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-caption font-semibold",
  {
    variants: {
      variant: {
        verified: "bg-teal-100 text-teal-900",
        pending: "bg-amber-100 text-amber-900",
        seats: "bg-gray-100 text-gray-700",
        neutral: "bg-gray-100 text-gray-700",
        success: "bg-teal-100 text-teal-900",
        danger: "bg-red-100 text-error",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: ReactNode;
}

export function Badge({ className, variant, icon, children, ...rest }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...rest}>
      {icon}
      {children}
    </span>
  );
}

export function VerifiedBadge() {
  return (
    <Badge variant="verified" icon={<ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />}>
      Верифицирован
    </Badge>
  );
}

export function PendingBadge() {
  return (
    <Badge variant="pending" icon={<Clock className="h-3.5 w-3.5" aria-hidden="true" />}>
      Ожидание
    </Badge>
  );
}

export function SeatsBadge({ available, total }: { available: number; total: number }) {
  return (
    <Badge variant="seats" icon={<Users className="h-3.5 w-3.5" aria-hidden="true" />}>
      {available} из {total}
    </Badge>
  );
}
