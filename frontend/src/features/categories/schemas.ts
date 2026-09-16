import { z } from "zod";
import { categoryTypes } from "@/features/categories/types";

export const categoryCreateSchema = z.object({
  name: z.string().min(1, "Назва є обов’язковою"),
  type: z.enum(categoryTypes),
  icon: z.string().min(1, "Іконка є обов’язковою (емодзі)"),
});

export type CategoryCreateValues = z.infer<typeof categoryCreateSchema>;

export const categoryUpdateSchema = z.object({
  name: z.string().min(1, "Назва є обов’язковою"),
  type: z.enum(categoryTypes),
  icon: z.string().min(1, "Іконка є обов’язковою (емодзі)"),
});

export type CategoryUpdateValues = z.infer<typeof categoryUpdateSchema>;

