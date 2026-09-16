import { z } from "zod";
import { categoryTypes } from "@/features/categories/types";

export const categoryCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(categoryTypes),
  icon: z.string().min(1, "Icon is required (emoji)"),
});

export type CategoryCreateValues = z.infer<typeof categoryCreateSchema>;

export const categoryUpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(categoryTypes),
  icon: z.string().min(1, "Icon is required (emoji)"),
});

export type CategoryUpdateValues = z.infer<typeof categoryUpdateSchema>;

