import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategoryApi,
  deleteCategoryApi,
  getCategoriesApi,
  getCategoryApi,
  updateCategoryApi,
} from "@/features/categories/api";

export const categoryKeys = {
  all: ["categories"] as const,
  list: (page: number, limit: number) => [...categoryKeys.all, "list", { page, limit }] as const,
  byId: (id: string) => [...categoryKeys.all, "byId", id] as const,
};

export function useCategories(params: { page: number; limit: number }) {
  return useQuery({
    queryKey: categoryKeys.list(params.page, params.limit),
    queryFn: () => getCategoriesApi(params),
    placeholderData: keepPreviousData,
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.byId(id),
    queryFn: () => getCategoryApi(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCategoryApi,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateCategoryApi,
    onSuccess: async (_, vars) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: categoryKeys.all }),
        qc.invalidateQueries({ queryKey: categoryKeys.byId(vars.id) }),
      ]);
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCategoryApi,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

