import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { CategorySideSummary } from "@/features/analytics/types";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

type Slice = { name: string; value: number };

function toSlices(side: CategorySideSummary): Slice[] {
  return side.byCategories.map((row) => ({
    name: row.category.name,
    value: row.amount,
  }));
}

function PieBlock({ title, side }: { title: string; side: CategorySideSummary }) {
  const data = toSlices(side);
  if (data.length === 0) {
    return (
      <div className="flex min-h-[280px] flex-col gap-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">Немає даних за обраний період.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[320px] flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <span className="tabular-nums text-sm text-muted-foreground">Σ {side.total.toFixed(2)}</span>
      </div>
      <div className="h-[280px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => (typeof v === "number" ? v.toFixed(2) : String(v ?? ""))} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

type Props = {
  income: CategorySideSummary;
  expense: CategorySideSummary;
};

export function CategoriesPieCharts({ income, expense }: Props) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <PieBlock title="Income" side={income} />
      <PieBlock title="Expense" side={expense} />
    </div>
  );
}
