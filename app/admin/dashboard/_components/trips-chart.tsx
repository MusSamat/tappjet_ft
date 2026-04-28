import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { ChartCard } from "./chart-card";

function fmtShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

type TripPoint = { date: string; active: number; completed: number; cancelled: number };

interface Props {
  data: TripPoint[];
  loading: boolean;
  days: number;
}

export function TripsChart({ data, loading, days }: Props) {
  return (
    <ChartCard title={`Поездки за ${days} дней`} loading={loading}>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tickFormatter={fmtShortDate} tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip labelFormatter={fmtShortDate as unknown as undefined} />
          <Area type="monotone" dataKey="completed" stackId="1" stroke="#0D9488" fill="#ccfbf1" strokeWidth={2} name="Завершены" />
          <Area type="monotone" dataKey="active" stackId="1" stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} name="Активны" />
          <Area type="monotone" dataKey="cancelled" stackId="1" stroke="#ef4444" fill="#fee2e2" strokeWidth={2} name="Отменены" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
