"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Phone } from "lucide-react";
import { revealTripContact, revealRequestContact, type RevealedContact } from "@/lib/api/contacts";
import { extractError } from "@/lib/api/client";
import { useAuth } from "@/store/auth";
import { Spinner } from "@/components/ui";
import { toastError } from "@/components/layout/quick-toast";
import { cn } from "@/lib/utils/cn";

// «Позвонить» — call-first flow (Yandex Межгород pattern). One tap for a
// logged-in user reveals the counterparty's number and dials it; the number
// stays on screen for redials. Guests are sent to login. Server audits every
// reveal and rate-limits per day.

interface Props {
  target: "trip" | "request";
  id: string;
  className?: string;
  /** "icon" — compact round button for list cards (errors go to a toast). */
  variant?: "full" | "icon";
}

export function ContactRevealButton({ target, id, className, variant = "full" }: Props) {
  const t = useTranslations("contact");
  const router = useRouter();
  const authed = useAuth((s) => s.status === "authenticated");
  const [contact, setContact] = useState<RevealedContact | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: () => (target === "trip" ? revealTripContact(id) : revealRequestContact(id)),
    onSuccess: (c) => {
      setContact(c);
      // Straight to the dialer — the number stays rendered for redials.
      window.location.href = `tel:${c.phone}`;
    },
    onError: (e) => {
      const err = extractError(e) as { code?: string; details?: { reason?: string } };
      const msg =
        err.code === "RATE_LIMITED" ? t("limit_reached")
        : err.details?.reason === "no_phone" ? t("no_phone")
        : t("error");
      if (variant === "icon") toastError(msg);
      else setError(msg);
    },
  });

  const onClick = () => {
    if (!authed) {
      router.push("/auth/login");
      return;
    }
    setError(null);
    if (contact) window.location.href = `tel:${contact.phone}`;
    else mutate();
  };

  if (variant === "icon") {
    // Once revealed, show the number as a real tel: link so it works even when
    // the programmatic auto-dial doesn't fire (desktop / restrictive webviews).
    if (contact) {
      return (
        <a
          href={`tel:${contact.phone}`}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-brand-50 px-3 text-[13px] font-800 text-brand-700 transition-colors hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-300 dark:hover:bg-brand-500/25",
            className,
          )}
        >
          <Phone className="h-[15px] w-[15px]" aria-hidden="true" />
          {contact.phone}
        </a>
      );
    }
    // Compact round button for cards. The card itself is clickable — stop the
    // event so a call tap never opens the detail page.
    return (
      <button
        type="button"
        aria-label={t("call")}
        title={t("call")}
        disabled={isPending}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-colors hover:bg-brand-100 disabled:opacity-60 dark:bg-brand-500/15 dark:text-brand-300 dark:hover:bg-brand-500/25",
          className,
        )}
      >
        {isPending ? <Spinner size={14} /> : <Phone className="h-[18px] w-[18px]" aria-hidden="true" />}
      </button>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className={cn(
          "flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-[16px] font-900 transition-colors disabled:opacity-60",
          "bg-brand-600 text-white hover:bg-brand-700",
        )}
      >
        {isPending ? <Spinner size={16} /> : <Phone className="h-4 w-4" aria-hidden="true" />}
        {contact ? contact.phone : t("call")}
      </button>
      {!contact && !error && (
        <p className="mt-1.5 text-center text-[13px] font-600 text-ink-400">
          {authed ? t("hint") : t("hint_guest")}
        </p>
      )}
      {error && (
        <p className="mt-1.5 text-center text-[13px] font-700 text-coral-600">{error}</p>
      )}
    </div>
  );
}
