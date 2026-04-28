import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap",
  {
    variants: {
      variant: {
        submit: "bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500",
        primary: "bg-teal-600 text-white hover:bg-teal-700 focus-visible:ring-teal-600",
        secondary: "bg-teal-50 text-teal-700 border border-teal-600 hover:bg-teal-100",
        outline: "bg-white text-teal-700 border border-teal-600 hover:bg-teal-50",
        ghost: "bg-gray-100 text-gray-900 hover:bg-gray-300/60",
        danger: "bg-red-50 text-error hover:bg-red-100",
        pill: "bg-amber-500 text-white hover:bg-amber-600 rounded-full",
      },
      size: {
        sm: "h-9 px-4 text-caption rounded-md",
        md: "h-11 px-5 text-body rounded-xl",
        lg: "h-[52px] px-7 text-body-lg rounded-xl min-w-[44px]",
      },
    },
    compoundVariants: [{ variant: "pill", size: "lg", class: "rounded-full" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";
