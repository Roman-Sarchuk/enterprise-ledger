import { api } from "@/shared/api/axios";
import type { AccountResponse, AccountsListResponse, Currency } from "@/features/accounts/types";

export async function getAccountsApi(params: { page: number; limit: number }): Promise<AccountsListResponse> {
  const { data } = await api.get<AccountsListResponse>("/accounts", { params });
  return data;
}

export async function getAccountApi(id: string): Promise<AccountResponse> {
  const { data } = await api.get<AccountResponse>(`/accounts/${id}`);
  return data;
}

export async function createAccountApi(payload: { name: string; currency: Currency }): Promise<AccountResponse> {
  const { data } = await api.post<AccountResponse>("/accounts", payload);
  return data;
}

export async function updateAccountApi(payload: {
  id: string;
  name?: string;
  currency?: Currency;
}): Promise<AccountResponse> {
  const { id, ...body } = payload;
  const { data } = await api.patch<AccountResponse>(`/accounts/${id}`, body);
  return data;
}

export async function deleteAccountApi(id: string): Promise<void> {
  await api.delete(`/accounts/${id}`);
}

