"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { ModalOverlay, ModalPortal } from "./modal";

// Bottom sheet — design-spec §3.2 (filters): grab handle, rounded-t-4xl,
// max-h-[82vh], scrollable body + sticky footer slot.

export const BottomSheet = DialogPrimitive.Root;
export const BottomSheetTrigger = DialogPrimitive.Trigger;
export const BottomSheetClose = DialogPrimitive.Close;

export const BottomSheetContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...rest }, ref) => (
  <ModalPortal>
    <ModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 flex max-h-[82vh] flex-col overflow-hidden rounded-t-4xl bg-white shadow-lift focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom dark:bg-ink-900",
        className,
      )}
      {...rest}
    >
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-ink-200 dark:bg-ink-700"
      />
      {children}
    </DialogPrimitive.Content>
  </ModalPortal>
));
BottomSheetContent.displayName = "BottomSheetContent";

export const BottomSheetTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...rest }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-[16px] font-900 text-ink-900 dark:text-white", className)}
    {...rest}
  />
));
BottomSheetTitle.displayName = DialogPrimitive.Title.displayName;

export function BottomSheetHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex items-center justify-between gap-2 px-5 pb-2 pt-6", className)}>{children}</div>;
}

/** Scrollable middle section. */
export function BottomSheetBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex-1 overflow-y-auto px-5 pb-3", className)}>{children}</div>;
}

/** Sticky footer slot (CTA row) pinned under the scrollable body. */
export function BottomSheetFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "border-t border-ink-100 bg-white p-3 pb-[calc(12px+env(safe-area-inset-bottom))] dark:border-ink-800 dark:bg-ink-900",
        className,
      )}
    >
      {children}
    </div>
  );
}
