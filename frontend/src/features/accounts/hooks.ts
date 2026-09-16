import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAccountApi,
  deleteAccountApi,
  getAccountApi,
  getAccountsApi,
  updateAccountApi,
} from "@/features/accounts/api";

export const accountKeys = {
  all: ["accounts"] as const,
  list: (page: number, limit: number) => [...accountKeys.all, "list", { page, limit }] as const,
  byId: (id: string) => [...accountKeys.all, "byId", id] as const,
};

export function useAccounts(params: { page: number; limit: number }) {
  return useQuery({
    queryKey: accountKeys.list(params.page, params.limit),
    queryFn: () => getAccountsApi(params),
    placeholderData: keepPreviousData,
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: accountKeys.byId(id),
    queryFn: () => getAccountApi(id),
    enabled: !!id,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAccountApi,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateAccountApi,
    onSuccess: async (_, vars) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: accountKeys.all }),
        qc.invalidateQueries({ queryKey: accountKeys.byId(vars.id) }),
      ]);
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAccountApi,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}

