import { z } from "zod";

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const categoriesReportParamsSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  dateFrom: dateOnly,
  dateTo: dateOnly,
});

export const curveReportParamsSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  dateFrom: dateOnly,
  dateTo: dateOnly,
  pointLimit: z.number().int().min(2).max(365),
});

export type CategoriesReportParams = z.infer<typeof categoriesReportParamsSchema>;
export type CurveReportParams = z.infer<typeof curveReportParamsSchema>;
