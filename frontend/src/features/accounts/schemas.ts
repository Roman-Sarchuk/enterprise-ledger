import { z } from "zod";
import { currencies } from "@/features/accounts/types";

export const accountCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  currency: z.enum(currencies),
});

export type AccountCreateValues = z.infer<typeof accountCreateSchema>;

export const accountUpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  currency: z.enum(currencies),
});

export type AccountUpdateValues = z.infer<typeof accountUpdateSchema>;

