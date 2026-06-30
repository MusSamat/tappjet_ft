import { cva, type VariantProps } from "class-variance-authority";
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const notifVariants = cva("flex gap-3 rounded-2xl border-l-[4px] p-4", {
  variants: {
    variant: {
      info: "bg-teal-50 border-l-teal-500 text-gray-900",
      success: "bg-teal-50 border-l-success text-gray-900",
      warning: "bg-amber-50 border-l-amber-500 text-gray-900",
      error: "bg-coral-100/40 border-l-coral-500 text-gray-900",
    },
  },
  defaultVariants: { variant: "info" },
});

const iconColorMap = {
  info: "text-teal-700",
  success: "text-success",
  warning: "text-amber-600",
  error: "text-error",
} as const;

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
} as const;

interface NotifCardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof notifVariants> {
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
}

export function NotifCard({
  variant = "info",
  title,
  children,
  icon,
  className,
  ...rest
}: NotifCardProps) {
  const v = variant ?? "info";
  const Icon = iconMap[v];
  return (
    <div className={cn(notifVariants({ variant: v }), className)} {...rest}>
      <span className={cn("mt-0.5 flex-shrink-0", iconColorMap[v])} aria-hidden="true">
        {icon ?? <Icon className="h-5 w-5" />}
      </span>
      <div className="min-w-0 flex-1">
        {title && <p className="text-body font-bold">{title}</p>}
        <div className="text-body-lg text-gray-700">{children}</div>
      </div>
    </div>
  );
}
