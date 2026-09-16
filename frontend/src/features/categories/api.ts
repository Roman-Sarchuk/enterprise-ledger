import { api } from "@/shared/api/axios";
import type { CategoriesListResponse, CategoryResponse, CategoryType } from "@/features/categories/types";

export async function getCategoriesApi(params: { page: number; limit: number }): Promise<CategoriesListResponse> {
  const { data } = await api.get<CategoriesListResponse>("/categories", { params });
  return data;
}

export async function getCategoryApi(id: string): Promise<CategoryResponse> {
  const { data } = await api.get<CategoryResponse>(`/categories/${id}`);
  return data;
}

export async function createCategoryApi(payload: { name: string; type: CategoryType; icon: string }): Promise<CategoryResponse> {
  const { data } = await api.post<CategoryResponse>("/categories", payload);
  return data;
}

export async function updateCategoryApi(payload: {
  id: string;
  name?: string;
  type?: CategoryType;
  icon?: string;
}): Promise<CategoryResponse> {
  const { id, ...body } = payload;
  const { data } = await api.patch<CategoryResponse>(`/categories/${id}`, body);
  return data;
}

export async function deleteCategoryApi(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}

