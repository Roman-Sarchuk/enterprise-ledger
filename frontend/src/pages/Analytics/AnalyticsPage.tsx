import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useAccounts } from "@/features/accounts/hooks";
import { CashFlowChart } from "@/features/analytics/components/CashFlowChart";
import { CategoriesPieCharts } from "@/features/analytics/components/CategoriesPieCharts";
import { LiquidityChart } from "@/features/analytics/components/LiquidityChart";
import {
  categoriesReportParamsSchema,
  curveReportParamsSchema,
  type CategoriesReportParams,
  type CurveReportParams,
} from "@/features/analytics/schemas";
import { useCashFlowReport, useCategoriesReport, useLiquidityReport } from "@/features/analytics/hooks";
import { getApiErrorMessage } from "@/shared/api/errors";

const ACCOUNT_PAGE_LIMIT = 100;

function defaultDateRange() {
  const now = new Date();
  const dateTo = now.toISOString().slice(0, 10);
  const dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  return { dateFrom, dateTo };
}

type ReportKind = "categories" | "liquidity" | "cashflow";

type Applied =
  | { kind: "categories"; params: CategoriesReportParams }
  | { kind: "liquidity"; params: CurveReportParams }
  | { kind: "cashflow"; params: CurveReportParams };

export function AnalyticsPage() {
  const [searchParams] = useSearchParams();
  const urlAccountId = searchParams.get("accountId");

  const accountsQuery = useAccounts({ page: 1, limit: ACCOUNT_PAGE_LIMIT });
  const accounts = accountsQuery.data?.accounts ?? [];

  const defaults = useMemo(() => defaultDateRange(), []);

  const [reportKind, setReportKind] = useState<ReportKind>("categories");
  const [accountId, setAccountId] = useState("");
  const [dateFrom, setDateFrom] = useState(defaults.dateFrom);
  const [dateTo, setDateTo] = useState(defaults.dateTo);
  const [pointLimit, setPointLimit] = useState(5);

  const [applied, setApplied] = useState<Applied | null>(null);

  const resolvedAccountId = accountId || urlAccountId || "";

  const categoriesParams: CategoriesReportParams | null =
    applied?.kind === "categories" ? applied.params : null;
  const liquidityParams: CurveReportParams | null =
    applied?.kind === "liquidity" ? applied.params : null;
  const cashFlowParams: CurveReportParams | null =
    applied?.kind === "cashflow" ? applied.params : null;

  const categoriesQ = useCategoriesReport(categoriesParams, applied?.kind === "categories");
  const liquidityQ = useLiquidityReport(liquidityParams, applied?.kind === "liquidity");
  const cashFlowQ = useCashFlowReport(cashFlowParams, applied?.kind === "cashflow");

  const activeQuery =
    applied?.kind === "categories"
      ? categoriesQ
      : applied?.kind === "liquidity"
        ? liquidityQ
        : applied?.kind === "cashflow"
          ? cashFlowQ
          : null;

  function onVisualize() {
    try {
      if (reportKind === "categories") {
        const parsed = categoriesReportParamsSchema.safeParse({
          accountId: resolvedAccountId,
          dateFrom,
          dateTo,
        });
        if (!parsed.success) {
          const msg = parsed.error.issues[0]?.message ?? "Перевірте параметри";
          toast.error(msg);
          return;
        }
        setApplied({ kind: "categories", params: parsed.data });
        return;
      }

      const parsed = curveReportParamsSchema.safeParse({
        accountId: resolvedAccountId,
        dateFrom,
        dateTo,
        pointLimit: Number(pointLimit),
      });
      if (!parsed.success) {
        const msg = parsed.error.issues[0]?.message ?? "Перевірте параметри";
        toast.error(msg);
        return;
      }

      if (reportKind === "liquidity") {
        setApplied({ kind: "liquidity", params: parsed.data });
      } else {
        setApplied({ kind: "cashflow", params: parsed.data });
      }
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  }

  return (
    <div className="page lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start">
      <Card className="lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>Select a report, account, and date range</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-3">
            <Label>Report type</Label>
            <Select
              value={reportKind}
              onValueChange={(v) => {
                setReportKind(v as ReportKind);
                setApplied(null);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="categories">By categories</SelectItem>
                <SelectItem value="liquidity">Liquidity (balance)</SelectItem>
                <SelectItem value="cashflow">Cash flow</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3">
            <Label>Account</Label>
            <Select
              value={resolvedAccountId || undefined}
              onValueChange={(id) => {
                setAccountId(id);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose an account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} ({a.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="dateFrom">From (date)</Label>
            <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="dateTo">To (date)</Label>
            <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>

          {reportKind !== "categories" ? (
            <div className="grid gap-3">
              <Label htmlFor="pointLimit">Number of points (2–365)</Label>
              <Input
                id="pointLimit"
                type="number"
                min={2}
                max={365}
                value={pointLimit}
                onChange={(e) => setPointLimit(Number(e.target.value))}
              />
            </div>
          ) : null}

          <Button type="button" onClick={onVisualize} disabled={!!activeQuery?.isFetching}>
            {activeQuery?.isFetching ? "Loading…" : "Visualize"}
          </Button>
        </CardContent>
      </Card>

      <div className="min-w-0">
        <Card>
          <CardHeader>
            <CardTitle>Charts</CardTitle>
            <CardDescription>
              Scroll the area on mobile if the chart is wider than the screen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="surface max-h-[min(70vh,720px)] overflow-auto rounded-xl">
              <div className="min-w-[min(100%,640px)] p-4">
                {!applied ? (
                  <p className="text-sm text-muted-foreground">
                    Click "Visualize" to see the data.
                  </p>
                ) : activeQuery?.isError ? (
                  <p className="text-sm text-destructive">{getApiErrorMessage(activeQuery.error)}</p>
                ) : activeQuery?.isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : applied.kind === "categories" && categoriesQ.data ? (
                  <CategoriesPieCharts
                    income={categoriesQ.data.income}
                    expense={categoriesQ.data.expense}
                  />
                ) : applied.kind === "liquidity" && liquidityQ.data ? (
                  <LiquidityChart data={liquidityQ.data.report} />
                ) : applied.kind === "cashflow" && cashFlowQ.data ? (
                  <CashFlowChart data={cashFlowQ.data.report} />
                ) : (
                  <p className="text-sm text-muted-foreground">No data available.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
