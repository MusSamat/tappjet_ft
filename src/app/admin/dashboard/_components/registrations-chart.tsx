import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { ChartCard } from "./chart-card";

function fmtShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

interface Props {
  data: Array<{ date: string; count: number }>;
  loading: boolean;
  days: number;
}

export function RegistrationsChart({ data, loading, days }: Props) {
  return (
    <ChartCard title={`Регистрации за ${days} дней`} loading={loading}>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" />
          <XAxis dataKey="date" tickFormatter={fmtShortDate} tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            labelFormatter={fmtShortDate as unknown as undefined}
            formatter={((v: unknown) => [v, "Регистраций"]) as unknown as undefined}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#0D9488"
            fill="url(#regGrad)"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
