"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n.config";
import {
  ArrowLeft,
  Share2,
  Calendar,
  Users,
  Briefcase,
  ShieldCheck,
  MessageCircle,
  Wallet,
  CheckCircle,
  Lock,
  CarFront,
  Star,
  Quote,
} from "lucide-react";
import { useUiRole } from "@/lib/hooks/use-role-colors";
import { useRecordView } from "@/lib/hooks/use-record-view";
import { saveDeferredAction } from "@/lib/auth/deferred-action";
import { formatDepartureLabel } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { DriverAvatar, LikeButton, SeatMeter, SectionLabel } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { pushToast } from "@/components/layout/quick-toast";
import { BookingModal } from "./booking-modal";

// Viewport-agnostic trip detail — design-spec §2.3. Rendered both as the
// desktop feed right-rail (`variant="rail"`) and the standalone page
// (`variant="page"` → mobile full-screen + desktop webDetail 2-col).

export interface DetailTripData {
  id?: string;
  driverId?: string | null;
  originCity?: string;
  destinationCity?: string;
  originAddress?: string | null;
  pricePerSeat?: number | null;
  priceNegotiable?: boolean | null;
  seatsAvailable?: number | null;
  seatsTotal?: number | null;
  departureAt?: string | null;
  estimatedDurationMin?: number | null;
  luggage?: string | null;
  comment?: string | null;
  liked?: boolean;
  metrics?: { views: number; likes: number } | null;
  pickupCities?: string[];
  dropoffCities?: string[];
  preferences?: Record<string, boolean> | null;
  driver?: {
    id?: string;
    name?: string | null;
    avatarUrl?: string | null;
    verified?: boolean;
    rating?: number | null;
    ratingCount?: number;
    tripsCount?: number;
    car?: { make?: string; model?: string; color?: string; plate?: string } | null;
  } | null;
}

interface Props {
  trip: DetailTripData;
  variant?: "page" | "rail";
  /** deep-link `?book=1` — open the booking modal on mount */
  autoOpenBook?: boolean;
}

function useDetailModel(trip: DetailTripData) {
  const t = useTranslations("detail");
  const locale = useLocale() as Locale;
  const driver = trip.driver ?? {};
  const seatsAvailable = trip.seatsAvailable ?? 0;
  const seatsTotal = trip.seatsTotal ?? 0;
  const rating = driver.rating ?? null;
  const ratingCount = driver.ratingCount ?? 0;
  const car = driver.car ? [driver.car.make, driver.car.model].filter(Boolean).join(" ") : null;
  const departureLabel = trip.departureAt ? formatDepartureLabel(trip.departureAt, locale) : "—";
  const luggageLabel =
    trip.luggage === "yes" ? t("luggage_big") : trip.luggage === "small" ? t("luggage_small") : t("luggage_none");
  const stops = (trip.pickupCities ?? []).concat(trip.dropoffCities ?? []).filter(Boolean);
  return { t, driver, seatsAvailable, seatsTotal, rating, ratingCount, car, departureLabel, luggageLabel, stops };
}

type Model = ReturnType<typeof useDetailModel>;

/** Vertical route spine — hollow white dot → dashed connector → amber dot. */
function HeaderSpine() {
  return (
    <div className="flex flex-col items-center self-stretch pt-1.5" aria-hidden="true">
      <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white" />
      <svg width="14" height="40" viewBox="0 0 14 40" className="my-0.5 flex-1">
        <path d="M7 0 C 11 12, 3 28, 7 40" stroke="#fff" strokeOpacity="0.55" strokeWidth="2.5" strokeDasharray="0.1 6" strokeLinecap="round" fill="none" />
      </svg>
      <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-accent-400" />
    </div>
  );
}

function InfoTiles({ model }: { model: Model }) {
  const { t, seatsAvailable, departureLabel, luggageLabel } = model;
  const tiles: { icon: typeof Calendar; value: string; sub: string }[] = [
    { icon: Calendar, value: departureLabel, sub: t("tile_departure") },
    { icon: Users, value: t("tile_seats_value", { n: seatsAvailable }), sub: t("tile_seats_sub") },
    { icon: Briefcase, value: t("tile_luggage_title"), sub: luggageLabel },
  ];
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {tiles.map((tile, i) => {
        const Icon = tile.icon;
        return (
          <div key={i} className="rounded-2xl bg-ink-50 p-3 text-center dark:bg-ink-800">
            <Icon className="mx-auto mb-1 h-4 w-4 text-brand-600" aria-hidden="true" />
            <div className="truncate text-[12px] font-900 text-ink-900 dark:text-white">{tile.value}</div>
            <div className="text-[11px] font-600 text-ink-400">{tile.sub}</div>
          </div>
        );
      })}
    </div>
  );
}

function DriverCard({ model, showMessage, onMessage }: { model: Model; showMessage: boolean; onMessage: () => void }) {
  const { t, driver, rating, ratingCount, car } = model;
  const meta = [
    rating !== null && ratingCount >= 3 ? `★${rating.toFixed(1)}` : t("new_driver"),
    ratingCount >= 3 ? t("reviews_count", { n: ratingCount }) : null,
    car,
  ].filter(Boolean).join(" · ");
  return (
    <div className="flex items-center gap-2.5 rounded-2xl bg-white p-3 shadow-xs ring-1 ring-ink-100 dark:bg-ink-800 dark:ring-ink-700">
      <DriverAvatar name={driver.name ?? "?"} src={driver.avatarUrl ?? null} size="lg" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-1 text-[14px] font-900 text-ink-900 dark:text-white">
          <span className="truncate">{driver.name}</span>
          {driver.verified && <ShieldCheck className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />}
        </span>
        <span className="truncate text-[12px] font-600 text-ink-400">{meta}</span>
      </div>
      {showMessage && (
        <button
          type="button"
          onClick={onMessage}
          aria-label={t("message_driver")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function SeatsCard({ model }: { model: Model }) {
  const { t, seatsAvailable, seatsTotal } = model;
  return (
    <div className="rounded-2xl bg-white p-3 shadow-xs ring-1 ring-ink-100 dark:bg-ink-800 dark:ring-ink-700">
      <SectionLabel className="mb-2">{t("seats_label")}</SectionLabel>
      <div className="flex items-center justify-between">
        <SeatMeter free={seatsAvailable} total={seatsTotal} size="md" />
        <span className="text-[12px] font-900 text-brand-700 dark:text-brand-300">
          {t("seats_of", { free: seatsAvailable, total: seatsTotal })}
        </span>
      </div>
    </div>
  );
}

function DetailCta({
  role,
  onBook,
  onSignin,
  originCity,
  destinationCity,
  myBooking,
  size = "mobile",
}: {
  role: "guest" | "passenger" | "driver";
  onBook: () => void;
  onSignin: () => void;
  originCity?: string;
  destinationCity?: string;
  myBooking?: { id: string; status: string } | null;
  size?: "mobile" | "desktop";
}) {
  const t = useTranslations("detail");
  const h = size === "desktop" ? "h-14 text-[16px]" : "h-12 text-[14px]";
  // Already booked → no duplicate; the CTA becomes an entry to the chat.
  if (role === "passenger" && myBooking) {
    return (
      <Link href={`/my/bookings/${myBooking.id}/chat`} className="block">
        <Button variant="brand" className={cn("w-full", h)}>
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          {t("cta_already_booked")}
        </Button>
      </Link>
    );
  }
  if (role === "driver") {
    const href = `/trips/create?from=${encodeURIComponent(originCity ?? "")}&to=${encodeURIComponent(destinationCity ?? "")}`;
    return (
      <Link href={href} className="block">
        <Button variant="brand" className={cn("w-full", h)}>
          <CarFront className="h-5 w-5" aria-hidden="true" />
          {t("cta_create_similar")}
        </Button>
      </Link>
    );
  }
  if (role === "guest") {
    return (
      <Button variant="lock" onClick={onSignin} className={cn("w-full", h)}>
        <Lock className="h-4 w-4" aria-hidden="true" />
        {t("cta_signin")}
      </Button>
    );
  }
  return (
    <Button variant="cta" onClick={onBook} className={cn("w-full", h)}>
      <CheckCircle className="h-5 w-5" aria-hidden="true" />
      {t("cta_book")}
    </Button>
  );
}

export function TripDetailView({ trip, variant = "page", autoOpenBook = false }: Props) {
  const router = useRouter();
  const role = useUiRole();
  const model = useDetailModel(trip);
  const { t, driver } = model;
  const tripId = trip.id ?? "";

  useRecordView("trip", tripId);

  const [bookOpen, setBookOpen] = useState(autoOpenBook);

  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : `/trips/${tripId}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      void navigator.share({ title: `${trip.originCity} → ${trip.destinationCity}`, url }).catch(() => undefined);
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(url);
      pushToast({ type: "info", title: t("share_copied"), body: "" });
    }
  };

  const handleBook = () => setBookOpen(true);
  const handleSignin = () => {
    saveDeferredAction({ action: "book_trip", trip_id: tripId, seats: 1 });
    router.push("/auth/login");
  };
  const showMessage = role !== "guest" && role !== "driver";

  const price = trip.pricePerSeat ?? 0;

  const CircleBtn = ({ children, onClick, label }: { children: React.ReactNode; onClick?: () => void; label: string }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white"
    >
      {children}
    </button>
  );

  const header = (
    <div className={cn("bg-gradient-to-b from-brand-600 to-brand-500 px-5 pb-6 text-white", variant === "page" ? "pt-11" : "pt-5")}>
      <div className="mb-4 flex items-center justify-between">
        {variant === "page" ? (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label={t("back")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <CircleBtn onClick={handleShare} label={t("share")}>
            <Share2 className="h-4 w-4" aria-hidden="true" />
          </CircleBtn>
          {tripId && (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <LikeButton targetType="trip" id={tripId} liked={!!trip.liked} size="sm" />
            </span>
          )}
        </div>
      </div>
      <div className="flex items-start gap-3">
        <HeaderSpine />
        <div className="min-w-0 flex-1">
          <div className="text-[20px] font-900 leading-tight">{trip.originCity}</div>
          {model.stops.length > 0 && (
            <div className="truncate text-[12px] font-600 text-white/70">{model.stops.join(" · ")}</div>
          )}
          <div className="mt-2 text-[20px] font-900 leading-tight">{trip.destinationCity}</div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[24px] font-900 leading-none">
            {price}
            <span className="text-[13px]"> {t("som_short")}</span>
          </div>
          <div className="mt-1 text-[11px] font-600 text-white/70">{t("per_seat")}</div>
        </div>
      </div>
    </div>
  );

  const body = (
    <div className="space-y-3 px-5 py-4">
      <InfoTiles model={model} />
      <DriverCard model={model} showMessage={showMessage} onMessage={handleBook} />
      {model.seatsTotal > 0 && <SeatsCard model={model} />}
      {trip.comment && (
        <div className="rounded-2xl bg-accent-50 p-3.5 text-[13px] font-600 text-ink-700 dark:bg-accent-500/10 dark:text-accent-200">
          {trip.comment}
        </div>
      )}
    </div>
  );

  const cta = (
    <DetailCta role={role} onBook={handleBook} onSignin={handleSignin} originCity={trip.originCity} destinationCity={trip.destinationCity} myBooking={(trip as { myBooking?: { id: string; status: string } | null }).myBooking ?? null} />
  );

  const bookingModal = (
    <BookingModal
      open={bookOpen}
      onOpenChange={setBookOpen}
      tripId={tripId}
      pricePerSeat={price}
      seatsAvailable={model.seatsAvailable}
      initialSeats={1}
    />
  );

  // ---- RAIL (desktop feed right rail): self-contained mobile markup ----
  if (variant === "rail") {
    return (
      <div className="flex flex-col overflow-hidden rounded-3xl ring-1 ring-ink-100 dark:ring-ink-800">
        {header}
        {body}
        <div className="border-t border-ink-100 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">{cta}</div>
        {bookingModal}
      </div>
    );
  }

  // ---- PAGE: mobile full-screen + desktop webDetail ----
  return (
    <>
      {/* Mobile */}
      <div className="flex min-h-[calc(100vh-56px)] flex-col lg:hidden">
        {header}
        <div className="flex-1">{body}</div>
        <div className="sticky-cta-nav sticky border-t border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">
          {cta}
        </div>
      </div>

      {/* Desktop webDetail 2-col */}
      <div className="mx-auto hidden max-w-[1080px] gap-0 lg:grid lg:grid-cols-[1fr_380px]">
        <div className="space-y-5 p-8">
          <Link href="/trips" className="inline-flex items-center gap-1.5 text-[13px] font-700 text-ink-500 hover:text-ink-800 dark:text-ink-400">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("back_to_feed")}
          </Link>
          <div className="rounded-4xl bg-white p-6 shadow-card ring-1 ring-ink-100 dark:bg-ink-900 dark:ring-ink-800">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center self-stretch pt-1" aria-hidden="true">
                <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-brand-600" />
                <div className="my-1 w-0.5 flex-1 rounded bg-gradient-to-b from-brand-500 to-accent-400" />
                <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-accent-500" />
              </div>
              <div className="min-w-0 flex-1 space-y-6">
                <div>
                  <div className="text-[22px] font-900 text-ink-900 dark:text-white">{trip.originCity}</div>
                  {model.stops.length > 0 && (
                    <div className="mt-0.5 text-[12px] font-600 text-ink-400">{model.stops.join(" · ")}</div>
                  )}
                </div>
                <div className="text-[22px] font-900 text-ink-900 dark:text-white">{trip.destinationCity}</div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-[32px] font-900 text-brand-700 dark:text-brand-300">
                  {price}
                  <span className="text-[15px]"> {t("som_short")}</span>
                </div>
                <div className="text-[12px] font-medium text-ink-400">{t("per_seat")}</div>
              </div>
            </div>
          </div>
          <InfoTiles model={model} />
          {model.seatsTotal > 0 && <SeatsCard model={model} />}
          {trip.comment && (
            <div className="flex gap-3 rounded-3xl bg-accent-50 p-5 dark:bg-accent-500/10">
              <Quote className="h-5 w-5 shrink-0 text-accent-600" aria-hidden="true" />
              <p className="text-[14px] font-600 text-ink-700 dark:text-accent-200">{trip.comment}</p>
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-4 border-l border-ink-100 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
          <div className="rounded-3xl bg-ink-50 p-5 text-center dark:bg-ink-800">
            <DriverAvatar name={driver.name ?? "?"} src={driver.avatarUrl ?? null} size="xl" className="mx-auto" />
            <div className="mt-2 flex items-center justify-center gap-1 text-[15px] font-900 text-ink-900 dark:text-white">
              {driver.name}
              {driver.verified && <ShieldCheck className="h-4 w-4 text-brand-600" aria-hidden="true" />}
            </div>
            {model.rating !== null && model.ratingCount >= 3 && (
              <div className="mt-0.5 flex items-center justify-center gap-1 text-[12px] font-600 text-ink-400">
                <Star className="h-3 w-3 fill-accent-400 text-accent-400" aria-hidden="true" />
                {model.rating.toFixed(1)} · {t("reviews_count", { n: model.ratingCount })}
              </div>
            )}
          </div>
          <div className="rounded-2xl bg-ink-50 p-4 text-[12px] font-600 text-ink-500 dark:bg-ink-800 dark:text-ink-400">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-brand-600" aria-hidden="true" />
              {t("trust_pay")}
            </div>
            {driver.verified && (
              <div className="mt-2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand-600" aria-hidden="true" />
                {t("trust_verified")}
              </div>
            )}
          </div>
          <div className="mt-auto">
            <DetailCta
              role={role}
              onBook={handleBook}
              onSignin={handleSignin}
              originCity={trip.originCity}
              destinationCity={trip.destinationCity}
              myBooking={(trip as { myBooking?: { id: string; status: string } | null }).myBooking ?? null}
              size="desktop"
            />
          </div>
        </aside>
      </div>

      {bookingModal}
    </>
  );
}
