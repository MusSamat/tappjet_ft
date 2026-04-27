import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Shield, Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getTrip } from "@/lib/api/trips";
import { extractError } from "@/lib/api/client";
import { formatDepartureLabel } from "@/lib/utils/date";
import { BookForm } from "@/components/features/booking/book-form";
import { DriverAvatar } from "@/components/ui/driver-avatar";

export const metadata: Metadata = {
  title: "Бронирование",
  robots: { index: false, follow: false },
};

interface Props {
  params: { id: string };
  searchParams: { seats?: string };
}

export default async function BookTripPage({ params, searchParams }: Props) {
  let trip;
  try {
    trip = await getTrip(params.id);
  } catch (e) {
    const err = extractError(e);
    if (err.code === "NOT_FOUND") notFound();
    throw e;
  }

  const t = await getTranslations("book");

  const initialSeats = Number(searchParams.seats) || 1;
  const driver = (trip as { driver?: { name?: string; avatarUrl?: string | null; verified?: boolean; rating?: number; ratingCount?: number } }).driver;
  const rating = driver?.rating ?? null;
  const ratingCount = driver?.ratingCount ?? 0;

  return (
    <div className="mx-auto max-w-[720px] px-4 py-8">
      <Link href={`/trips/${params.id}`} className="mb-4 inline-flex items-center gap-1 text-[13px] font-bold text-gray-600 hover:text-gray-900">
        {t("back")}
      </Link>

      <h1 className="text-[24px] font-extrabold text-gray-900">{t("title")}</h1>
      <p className="mt-1 text-[13px] font-semibold text-gray-500">{t("subtitle")}</p>

      {/* Driver + trip card */}
      <div className="mt-5 rounded-[20px] border-[0.5px] border-gray-200 bg-white p-5 shadow-sm">
        {/* Driver row */}
        <div className="flex items-center gap-3 mb-4">
          <DriverAvatar name={driver?.name ?? "?"} src={driver?.avatarUrl ?? null} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-extrabold text-gray-900">{driver?.name ?? t("driver_section")}</span>
              {driver?.verified && (
                <Shield className="h-3.5 w-3.5 text-teal-600 flex-shrink-0" aria-hidden="true" />
              )}
            </div>
            {rating !== null && ratingCount >= 3 && (
              <div className="mt-0.5 flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                <span className="text-[13px] font-bold text-gray-900">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("route_section")}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-[15px] font-bold text-gray-900">{trip.originCity}</span>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                <span className="text-[15px] font-bold text-gray-900">{trip.destinationCity}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("departure_section")}</p>
              <p className="mt-1 text-[15px] font-bold text-gray-900">
                {trip.departureAt ? formatDepartureLabel(trip.departureAt) : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <BookForm
          tripId={trip.id ?? params.id}
          pricePerSeat={trip.pricePerSeat ?? 0}
          seatsAvailable={trip.seatsAvailable ?? 0}
          initialSeats={initialSeats}
        />
      </div>
    </div>
  );
}
