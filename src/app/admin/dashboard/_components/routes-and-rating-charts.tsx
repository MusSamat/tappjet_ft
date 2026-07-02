import {
  ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line,
} from "recharts";
import { ChartCard } from "./chart-card";

function fmtShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

interface RoutesProps {
  data: Array<{ route: string; count: number }>;
  loading: boolean;
  days: number;
}

export function RoutesChart({ data, loading, days }: RoutesProps) {
  return (
    <ChartCard title={`Топ-10 маршрутов (${days} дней)`} loading={loading}>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="route" tick={{ fontSize: 10 }} width={120} />
          <Tooltip formatter={((v: unknown) => [v, "Поездок"]) as unknown as undefined} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={`hsl(${170 + i * 8}, 60%, ${45 + i * 2}%)`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface RatingProps {
  data: Array<{ date: string; avg: number }>;
  loading: boolean;
  days: number;
}

export function RatingChart({ data, loading, days }: RatingProps) {
  return (
    <ChartCard title={`Средний рейтинг по дням (${days} дней)`} loading={loading}>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" />
          <XAxis dataKey="date" tickFormatter={fmtShortDate} tick={{ fontSize: 10 }} />
          <YAxis domain={[1, 5]} tick={{ fontSize: 10 }} />
          <Tooltip
            labelFormatter={fmtShortDate as unknown as undefined}
            formatter={((v: unknown) => [v, "Средний рейтинг"]) as unknown as undefined}
          />
          <Line type="monotone" dataKey="avg" stroke="#f59e0b" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
