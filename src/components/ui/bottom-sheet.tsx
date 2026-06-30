"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { ModalOverlay, ModalPortal } from "./modal";

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
        "fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-4xl bg-white p-6 pb-[calc(24px+env(safe-area-inset-bottom))] shadow-soft focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        className,
      )}
      {...rest}
    >
      <span
        aria-hidden="true"
        className="mx-auto mb-4 block h-1 w-10 rounded-full bg-gray-300"
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
  <DialogPrimitive.Title ref={ref} className={cn("text-h1 text-gray-900", className)} {...rest} />
));
BottomSheetTitle.displayName = DialogPrimitive.Title.displayName;

export function BottomSheetHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mb-4 flex flex-col gap-1", className)}>{children}</div>;
}
