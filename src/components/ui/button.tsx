import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap",
  {
    variants: {
      variant: {
        submit: "bg-accent-500 text-[#4A2C00] shadow-cta hover:bg-accent-400 focus-visible:ring-accent-500",
        primary: "bg-brand-600 text-white shadow-brandcta hover:bg-brand-700 focus-visible:ring-brand-600",
        secondary: "bg-brand-50 text-brand-700 hover:bg-brand-100",
        outline: "bg-white text-ink-700 border-2 border-ink-200 hover:border-brand-400 hover:text-brand-700",
        ghost: "text-brand-700 hover:bg-brand-50",
        danger: "bg-coral-500 text-white hover:bg-coral-600",
        pill: "bg-accent-500 text-[#4A2C00] shadow-cta hover:bg-accent-400 rounded-full",
      },
      size: {
        sm: "h-9 px-4 text-caption rounded-xl",
        md: "h-11 px-5 text-body rounded-2xl",
        lg: "h-[52px] px-7 text-body-lg rounded-2xl min-w-[44px]",
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
