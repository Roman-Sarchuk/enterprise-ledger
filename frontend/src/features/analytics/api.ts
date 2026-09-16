import { api } from "@/shared/api/axios";
import type {
  CashFlowReportResponse,
  CategoriesSummaryReportResponse,
  LiquidityCurveReportResponse,
} from "@/features/analytics/types";

export async function getCategoriesSummaryReportApi(params: {
  accountId: string;
  dateFrom: string;
  dateTo: string;
}): Promise<CategoriesSummaryReportResponse> {
  const { data } = await api.get<CategoriesSummaryReportResponse>("/reports/summary/categories", {
    params,
  });
  return data;
}

export async function getLiquidityCurveReportApi(params: {
  accountId: string;
  dateFrom: string;
  dateTo: string;
  pointLimit: number;
}): Promise<LiquidityCurveReportResponse> {
  const { data } = await api.get<LiquidityCurveReportResponse>("/reports/liquidity-curve", {
    params,
  });
  return data;
}

export async function getCashFlowReportApi(params: {
  accountId: string;
  dateFrom: string;
  dateTo: string;
  pointLimit: number;
}): Promise<CashFlowReportResponse> {
  const { data } = await api.get<CashFlowReportResponse>("/reports/cash-flow", { params });
  return data;
}
