import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { CashFlowPoint } from "@/features/analytics/types";

type Props = {
  data: CashFlowPoint[];
};

export function CashFlowChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">Немає даних за обраний період.</p>;
  }

  const chartData = data.map((p) => ({
    ...p,
    label: p.dateFrom === p.dateTo ? p.dateFrom : `${p.dateFrom} → ${p.dateTo}`,
  }));

  return (
    <div className="h-[400px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-35} textAnchor="end" height={70} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(v) => (typeof v === "number" ? v.toFixed(2) : String(v ?? ""))}
            labelFormatter={(_, payload) => {
              const p = payload?.[0]?.payload as CashFlowPoint | undefined;
              return p ? `${p.dateFrom} — ${p.dateTo}` : "";
            }}
          />
          <Legend />
          <Bar dataKey="income" name="Income" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Expense" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
