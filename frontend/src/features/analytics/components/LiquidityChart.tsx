import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { LiquidityPoint } from "@/features/analytics/types";

type Props = {
  data: LiquidityPoint[];
};

export function LiquidityChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">Немає даних за обраний період.</p>;
  }

  const chartData = data.map((p) => ({ ...p, dateLabel: p.date }));

  return (
    <div className="h-[360px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(v) => (typeof v === "number" ? v.toFixed(2) : String(v ?? ""))}
            labelFormatter={(l) => String(l)}
          />
          <Area
            type="monotone"
            dataKey="total"
            name="Залишок"
            stroke="var(--chart-1)"
            fill="var(--chart-1)"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
