export type CategorySummaryItem = {
  category: { id: string; name: string; icon?: string };
  amount: number;
  percent: number;
};

export type CategorySideSummary = {
  total: number;
  byCategories: CategorySummaryItem[];
};

export type CategoriesSummaryReportResponse = {
  income: CategorySideSummary;
  expense: CategorySideSummary;
};

export type LiquidityPoint = {
  date: string;
  total: number;
};

export type LiquidityCurveReportResponse = {
  report: LiquidityPoint[];
};

export type CashFlowPoint = {
  dateFrom: string;
  dateTo: string;
  income: number;
  expense: number;
  balanceAfter: number;
};

export type CashFlowReportResponse = {
  report: CashFlowPoint[];
};
