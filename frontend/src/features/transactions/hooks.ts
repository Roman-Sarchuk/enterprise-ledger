import { keepPreviousData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { accountKeys } from "@/features/accounts/hooks";
import type { TransactionsListResponse } from "@/features/transactions/types";

import { createTransactionApi, deleteTransactionApi, getTransactionsApi, updateTransactionApi } from "@/features/transactions/api";

export const transactionKeys = {
  all: ["transactions"] as const,
  list: (accountId?: string) => [...transactionKeys.all, "list", { accountId }] as const,
};

export function useTransactionsInfinite(params: { limit: number; accountId?: string | null }) {
  const accountId = params.accountId ?? undefined;

  return useInfiniteQuery({
    queryKey: transactionKeys.list(accountId),
    queryFn: ({ pageParam }) =>
      getTransactionsApi({
        limit: params.limit,
        nextCursor: (pageParam as string | null) ?? null,
        accountId,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: TransactionsListResponse) => lastPage.nextCursor,
    placeholderData: keepPreviousData,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTransactionApi,
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: transactionKeys.all }),
        qc.invalidateQueries({ queryKey: accountKeys.all }),
      ]);
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateTransactionApi,
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: transactionKeys.all }),
        qc.invalidateQueries({ queryKey: accountKeys.all }),
      ]);
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTransactionApi,
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: transactionKeys.all }),
        qc.invalidateQueries({ queryKey: accountKeys.all }),
      ]);
    },
  });
}

