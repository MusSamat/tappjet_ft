"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import { cn } from "@/lib/utils/cn";

export const Label = forwardRef<
  ElementRef<typeof LabelPrimitive.Root>,
  ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...rest }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-caption font-bold text-ink-900 dark:text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      className,
    )}
    {...rest}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;
