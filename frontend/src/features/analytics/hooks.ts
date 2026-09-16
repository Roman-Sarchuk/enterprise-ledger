import { useQuery } from "@tanstack/react-query";
import {
  getCashFlowReportApi,
  getCategoriesSummaryReportApi,
  getLiquidityCurveReportApi,
} from "@/features/analytics/api";
import type { CategoriesReportParams, CurveReportParams } from "@/features/analytics/schemas";

export const analyticsKeys = {
  all: ["analytics"] as const,
  categories: (p: CategoriesReportParams) => [...analyticsKeys.all, "categories", p] as const,
  liquidity: (p: CurveReportParams) => [...analyticsKeys.all, "liquidity", p] as const,
  cashFlow: (p: CurveReportParams) => [...analyticsKeys.all, "cashFlow", p] as const,
};

const idleCategoriesKey = ["analytics", "categories", "idle"] as const;
const idleLiquidityKey = ["analytics", "liquidity", "idle"] as const;
const idleCashFlowKey = ["analytics", "cashFlow", "idle"] as const;

export function useCategoriesReport(params: CategoriesReportParams | null, enabled: boolean) {
  return useQuery({
    queryKey: params ? analyticsKeys.categories(params) : idleCategoriesKey,
    queryFn: () => getCategoriesSummaryReportApi(params!),
    enabled: enabled && !!params,
  });
}

export function useLiquidityReport(params: CurveReportParams | null, enabled: boolean) {
  return useQuery({
    queryKey: params ? analyticsKeys.liquidity(params) : idleLiquidityKey,
    queryFn: () => getLiquidityCurveReportApi(params!),
    enabled: enabled && !!params,
  });
}

export function useCashFlowReport(params: CurveReportParams | null, enabled: boolean) {
  return useQuery({
    queryKey: params ? analyticsKeys.cashFlow(params) : idleCashFlowKey,
    queryFn: () => getCashFlowReportApi(params!),
    enabled: enabled && !!params,
  });
}
