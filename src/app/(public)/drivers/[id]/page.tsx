import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Award, Car, Hash, Palette, Calendar, Users, Star } from "lucide-react";
import { getPublicUser, getUserRatings, type PublicUser, type PublicRating } from "@/lib/api/users";
import { extractError } from "@/lib/api/client";
import { BackButton, Container, DriverAvatar, RatingStars, VerifiedBadge } from "@/components/ui";

export const revalidate = 300;

interface Props {
  params: { id: string };
}

async function fetchData(id: string): Promise<{ user: PublicUser; ratings: PublicRating[] } | null> {
  try {
    const [user, ratings] = await Promise.all([
      getPublicUser(id),
      getUserRatings(id, undefined, 10).catch(() => ({ data: [], nextCursor: null })),
    ]);
    return { user, ratings: ratings.data };
  } catch (e) {
    if (extractError(e).code === "NOT_FOUND") return null;
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations("drivers");
  const d = await fetchData(params.id);
  if (!d) return { title: t("not_found_title"), robots: { index: false } };
  const { user } = d;
  const isDriver = (user.roles ?? []).includes("driver");
  const rating = user.rating ?? 0;
  const ratingCount = user.ratingCount ?? 0;
  const roleLabel = isDriver ? t("driver_role") : t("passenger_role");
  const title = `${user.name} — ${roleLabel} Tappjet`;
  const desc = `${user.name}${ratingCount >= 3 ? ` · ${rating.toFixed(1)}★ (${ratingCount} ${t("ratings_count")})` : ` · ${t("new_role", { role: roleLabel })}`} · попутчик Kyrgyzstan`;
  return {
    title,
    description: desc,
    alternates: { canonical: `/drivers/${params.id}` },
    openGraph: { title, description: desc, type: "profile" },
  };
}

const TIER_COLORS: Record<string, string> = {
  traveler: "bg-blue-50 text-blue-700 border-blue-200",
  expert: "bg-purple-50 text-purple-700 border-purple-200",
  elite: "bg-amber-50 text-amber-700 border-amber-200",
};

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border-[0.5px] border-gray-200 bg-white p-4 text-center">
      <Icon className="h-5 w-5 text-teal-500" aria-hidden="true" />
      <span className="text-[22px] font-extrabold leading-none text-gray-900">{value}</span>
      <span className="text-[11px] font-semibold text-gray-500">{label}</span>
    </div>
  );
}

export default async function UserProfilePage({ params }: Props) {
  const t = await getTranslations("drivers");
  const d = await fetchData(params.id);
  if (!d) notFound();
  const { user, ratings } = d;

  const isDriver = (user.roles ?? []).includes("driver");
  const car = user.driverCar ?? null;
  const rating = user.rating ?? null;
  const ratingCount = user.ratingCount ?? 0;
  const loyaltyTier = user.loyaltyTier && user.loyaltyTier !== "novice" ? user.loyaltyTier : null;
  const joinYear = user.createdAt ? new Date(user.createdAt).getFullYear() : null;

  return (
    <Container className="py-6 lg:py-10">
      <BackButton />
      {/* Hero */}
      <div className="mb-5 flex flex-col items-center gap-4 rounded-2xl border-[0.5px] border-gray-200 bg-white p-6 sm:flex-row sm:items-start sm:text-left">
        <DriverAvatar name={user.name ?? "?"} src={user.avatarUrl ?? null} size="lg" />
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h1 className="text-[22px] font-extrabold text-gray-900">{user.name}</h1>
            {isDriver && <VerifiedBadge />}
            {loyaltyTier && (
              <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${TIER_COLORS[loyaltyTier] ?? ""}`}>
                <Award className="h-3 w-3" aria-hidden="true" />
                {loyaltyTier}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            {rating !== null && ratingCount >= 3 ? (
              <RatingStars value={rating} size={15} showValue />
            ) : (
              <span className="text-[13px] text-gray-500">
                {t("new_role", { role: isDriver ? t("driver_role") : t("passenger_role") })}
              </span>
            )}
            {ratingCount > 0 && (
              <span className="text-[12px] text-gray-500">· {ratingCount} {t("ratings_count")}</span>
            )}
            {joinYear && (
              <span className="text-[12px] text-gray-400">· {t("since", { year: joinYear })}</span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${isDriver ? "border-teal-200 bg-teal-50 text-teal-700" : "border-gray-200 bg-gray-50 text-gray-600"}`}>
              {isDriver ? `🚗 ${t("driver_badge")}` : `👤 ${t("passenger_badge")}`}
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className={`mb-5 grid gap-3 ${isDriver ? "grid-cols-3" : "grid-cols-2"}`}>
        <StatCard icon={Star} label={t("rating_label")} value={rating !== null ? rating.toFixed(1) : "—"} />
        <StatCard icon={Users} label={t("ratings_label")} value={String(ratingCount)} />
        {isDriver && car && (
          <StatCard icon={Car} label={t("trips_label")} value={String(car.totalTrips)} />
        )}
      </div>

      {/* Car section — driver only */}
      {isDriver && car && (
        <div className="mb-5 overflow-hidden rounded-2xl border-[0.5px] border-gray-200 bg-white">
          {/* Car photo */}
          {car.carPhotoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={car.carPhotoUrl}
              alt={`${car.make} ${car.model}`}
              className="h-52 w-full object-cover sm:h-64"
            />
          )}

          <div className="p-5">
            <h2 className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-gray-900">
              <Car className="h-4 w-4 text-teal-600" aria-hidden="true" />
              {t("car_section")}
            </h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("car_make_model")}</p>
                <p className="mt-0.5 text-[14px] font-bold text-gray-900">{car.make} {car.model}</p>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-400" aria-hidden="true" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("car_year")}</p>
                </div>
                <p className="mt-0.5 text-[14px] font-bold text-gray-900">{car.year}</p>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <Palette className="h-3 w-3 text-gray-400" aria-hidden="true" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("car_color")}</p>
                </div>
                <p className="mt-0.5 text-[14px] font-bold text-gray-900">{car.color}</p>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <Hash className="h-3 w-3 text-gray-400" aria-hidden="true" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("car_plate")}</p>
                </div>
                <p className="mt-0.5 font-mono text-[15px] font-extrabold tracking-wider text-teal-700">{car.plate}</p>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-gray-400" aria-hidden="true" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t("car_seats")}</p>
                </div>
                <p className="mt-0.5 text-[14px] font-bold text-gray-900">{car.seats}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews */}
      <section>
        <h2 className="mb-3 text-[17px] font-extrabold text-gray-900">
          {t("reviews_title")} {ratingCount > 0 && <span className="text-gray-400">({ratingCount})</span>}
        </h2>
        {ratings.length === 0 ? (
          <div className="rounded-2xl border-[0.5px] border-gray-200 bg-white p-8 text-center">
            <p className="text-[14px] font-semibold text-gray-500">{t("no_reviews")}</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {ratings.map((r) => (
              <li key={r.id} className="rounded-2xl border-[0.5px] border-gray-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <DriverAvatar name={r.rater?.name ?? "?"} src={r.rater?.avatarUrl ?? null} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[14px] font-bold text-gray-900">{r.rater?.name}</span>
                      <span className="inline-flex items-center gap-1 text-[12px] font-bold text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-amber-500 stroke-amber-500" aria-hidden="true" />
                        {r.score}
                      </span>
                    </div>
                    {r.comment && <p className="mt-1 text-[13px] leading-relaxed text-gray-700">{r.comment}</p>}
                    {r.tags && r.tags.length > 0 && (
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {r.tags.map((tag) => (
                          <li key={tag} className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800">
                            {tag}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}
