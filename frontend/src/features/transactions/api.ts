import { api } from "@/shared/api/axios";
import type { TransactionsListResponse, TransactionResponse } from "@/features/transactions/types";
import type { TransactionCreateValues, TransactionUpdateValues } from "@/features/transactions/schemas";

export async function getTransactionsApi(params: {
  limit: number;
  nextCursor: string | null;
  accountId?: string;
}): Promise<TransactionsListResponse> {
  const { limit, nextCursor, accountId } = params;
  const query: Record<string, unknown> = { limit };
  if (nextCursor) query.nextCursor = nextCursor;
  if (accountId) query.accountId = accountId;

  const { data } = await api.get<TransactionsListResponse>("/transactions", { params: query });
  return data;
}

export async function createTransactionApi(payload: TransactionCreateValues): Promise<TransactionResponse> {
  const { data } = await api.post<TransactionResponse>("/transactions", {
    accountId: payload.accountId,
    categoryId: payload.categoryId,
    amount: Math.abs(payload.amount),
    description: payload.description?.trim() ? payload.description : undefined,
  });
  return data;
}

export async function updateTransactionApi(
  payload: { id: string } & TransactionUpdateValues,
): Promise<TransactionResponse> {
  const { id, categoryId, amount, description } = payload;
  const body: Record<string, unknown> = {
    categoryId,
    amount: Math.abs(amount),
  };

  if (description !== undefined) body.description = description.trim() ? description : undefined;

  const { data } = await api.patch<TransactionResponse>(`/transactions/${id}`, body);
  return data;
}

export async function deleteTransactionApi(id: string): Promise<void> {
  await api.delete(`/transactions/${id}`);
}

