import { z } from "zod";

export const transactionCreateSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  categoryId: z.string().min(1, "Category is required"),
  // Backend requires positive amount; we support negative input in UI and convert to abs on submit.
  amount: z.number().refine((v) => Math.abs(v) > 0, "Amount is required"),
  description: z.string().optional(),
});

export type TransactionCreateValues = z.infer<typeof transactionCreateSchema>;

export const transactionUpsertFormSchema = z.object({
  accountId: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  // Backend requires positive amount; we support negative input in UI and convert to abs on submit.
  amount: z.number().refine((v) => Math.abs(v) > 0, "Amount is required"),
  description: z.string().optional(),
});

export type TransactionUpsertFormValues = z.infer<typeof transactionUpsertFormSchema>;

export const transactionUpdateSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z.number().refine((v) => Math.abs(v) > 0, "Amount is required"),
  description: z.string().optional(),
});

export type TransactionUpdateValues = z.infer<typeof transactionUpdateSchema>;

