"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getAdminKpi, getAdminChart, type KpiCards } from "@/lib/api/admin";
import {
  Users, Car, CheckCircle2, ShieldAlert, MessageSquareWarning,
  TrendingUp, Star, UserCheck, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { KpiCard, KpiSkeleton } from "./_components/kpi-card";
import { ActivityHeatmap } from "./_components/activity-heatmap";
import { ChartCard } from "./_components/chart-card";
import { RegistrationsChart } from "./_components/registrations-chart";
import { TripsChart } from "./_components/trips-chart";
import { RoutesChart, RatingChart } from "./_components/routes-and-rating-charts";
import { FunnelChart } from "./_components/funnel-chart";

type TripRaw = { date: string; status: string; count: number };
function pivotTrips(raw: TripRaw[]) {
  const map = new Map<string, { date: string; active: number; completed: number; cancelled: number }>();
  for (const row of raw) {
    const p = map.get(row.date) ?? { date: row.date, active: 0, completed: 0, cancelled: 0 };
    if (row.status === "active" || row.status === "completed" || row.status === "cancelled")
      (p as Record<string, unknown>)[row.status] = row.count;
    map.set(row.date, p);
  }
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

const RANGE_OPTIONS = [
  { label: "7 дней", value: 7 },
  { label: "30 дней", value: 30 },
  { label: "90 дней", value: 90 },
] as const;

type Days = 7 | 30 | 90;

export default function AdminDashboard() {
  const [days, setDays] = useState<Days>(30);

  const kpi = useQuery<KpiCards>({
    queryKey: ["admin", "kpi"],
    queryFn: getAdminKpi,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
  const regChart = useQuery({ queryKey: ["admin", "chart", "registrations_by_day", days], queryFn: () => getAdminChart("registrations_by_day", days), staleTime: 5 * 60 * 1000 });
  const tripsChart = useQuery({ queryKey: ["admin", "chart", "trips_by_day", days], queryFn: () => getAdminChart("trips_by_day", days), staleTime: 5 * 60 * 1000 });
  const routesChart = useQuery({ queryKey: ["admin", "chart", "top_routes", days], queryFn: () => getAdminChart("top_routes", days), staleTime: 5 * 60 * 1000 });
  const heatmapChart = useQuery({ queryKey: ["admin", "chart", "activity_heatmap", days], queryFn: () => getAdminChart("activity_heatmap", days), staleTime: 5 * 60 * 1000 });
  const ratingChart = useQuery({ queryKey: ["admin", "chart", "rating_by_day", days], queryFn: () => getAdminChart("rating_by_day", days), staleTime: 5 * 60 * 1000 });
  const funnelChart = useQuery({ queryKey: ["admin", "chart", "onboarding_funnel"], queryFn: () => getAdminChart("onboarding_funnel"), staleTime: 5 * 60 * 1000 });

  const k = kpi.data;

  const regData = (regChart.data?.data ?? []) as Array<{ date: string; count: number }>;
  const tripsData = pivotTrips((tripsChart.data?.data ?? []) as TripRaw[]);
  const routesData = ((routesChart.data?.data ?? []) as Array<{ from: string; to: string; count: number }>)
    .map((r) => ({ route: `${r.from} → ${r.to}`, count: r.count }));
  const heatmapRaw = (heatmapChart.data?.data ?? []) as Array<{ dow: number; hour: number; count: number }>;
  const ratingData = (ratingChart.data?.data ?? []) as Array<{ date: string; avg: number }>;
  const funnelRaw = (funnelChart.data?.data ?? []) as Array<{ stage: string; count: number }>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold text-slate-900">Дашборд</h1>
          <p className="text-[13px] text-slate-500">
            {new Date().toLocaleDateString("ru-RU", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-sm">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDays(opt.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors",
                days === opt.value
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpi.isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiCard label="Пользователи" value={k?.users.total ?? 0} sub={`+${k?.users.last_7d ?? 0} за 7 дней`} icon={Users} />
            <KpiCard label="Активные водители" value={k?.activeDrivers7d ?? 0} sub="за последние 7 дней" icon={UserCheck} />
            <KpiCard label="Активные поездки" value={k?.publishedTripsNow ?? 0} sub="прямо сейчас" icon={Car} />
            <KpiCard label="Завершено поездок" value={k?.completedTrips.last_7d ?? 0} sub={`${k?.completedTrips.last_30d ?? 0} за 30 дней`} icon={CheckCircle2} accent="text-teal-600" />
            <KpiCard label="Принятие брони, %" value={k?.acceptanceRate7d != null ? `${k.acceptanceRate7d}%` : "—"} sub="за 7 дней" icon={TrendingUp} accent="text-blue-600" />
            <KpiCard label="Верификации" value={k?.pendingVerifications ?? 0} sub="ожидают проверки" icon={ShieldAlert} accent={k?.pendingVerifications ? "text-amber-600" : undefined} href="/admin/verifications" />
            <KpiCard label="Открытые жалобы" value={k?.openComplaints ?? 0} sub="требуют реакции" icon={MessageSquareWarning} accent={k?.openComplaints ? "text-red-600" : undefined} href="/admin/complaints" />
            <KpiCard label="Рейтинг водителей" value={k?.avgDriverRating != null ? k.avgDriverRating.toFixed(2) : "—"} sub="среднее (≥3 отзывов)" icon={Star} accent="text-amber-500" />
          </>
        )}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RegistrationsChart data={regData} loading={regChart.isLoading} days={days} />
        <TripsChart data={tripsData} loading={tripsChart.isLoading} days={days} />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RoutesChart data={routesData} loading={routesChart.isLoading} days={days} />
        <RatingChart data={ratingData} loading={ratingChart.isLoading} days={days} />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title={`Активность (${days} дней, по часам)`} loading={heatmapChart.isLoading}>
          <ActivityHeatmap data={heatmapRaw} />
        </ChartCard>
        <FunnelChart data={funnelRaw} loading={funnelChart.isLoading} />
      </div>

      {(k?.pendingVerifications ?? 0) + (k?.openComplaints ?? 0) > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(k?.pendingVerifications ?? 0) > 0 && (
            <Link href="/admin/verifications">
              <div className="flex items-center gap-4 rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 hover:bg-amber-100">
                <ShieldAlert className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="font-bold text-amber-900">{k!.pendingVerifications} верификаций ждут проверки</p>
                  <p className="text-[12px] text-amber-700">Перейти к очереди</p>
                </div>
              </div>
            </Link>
          )}
          {(k?.openComplaints ?? 0) > 0 && (
            <Link href="/admin/complaints">
              <div className="flex items-center gap-4 rounded-2xl border-2 border-red-200 bg-red-50 p-5 hover:bg-red-100">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="font-bold text-red-900">{k!.openComplaints} открытых жалоб</p>
                  <p className="text-[12px] text-red-700">Перейти к жалобам</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
