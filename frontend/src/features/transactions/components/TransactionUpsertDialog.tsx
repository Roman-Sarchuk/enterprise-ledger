import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useAccounts } from "@/features/accounts/hooks";
import { useCategories } from "@/features/categories/hooks";
import type { Account } from "@/features/accounts/types";
import type { Category } from "@/features/categories/types";

import type { Transaction } from "@/features/transactions/types";
import {
  transactionUpsertFormSchema,
  type TransactionUpsertFormValues,
} from "@/features/transactions/schemas";
import { useCreateTransaction, useUpdateTransaction } from "@/features/transactions/hooks";
import { getApiErrorMessage } from "@/shared/api/errors";

const SELECT_LIMIT = 100;

type BaseProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type CreateProps = BaseProps & {
  mode: "create";
  initialAccountId?: string | null;
};

type EditProps = BaseProps & {
  mode: "edit";
  transaction: Transaction;
  fixedAccountId?: string | null;
};

type Props = CreateProps | EditProps;

function getSignedAmount(amount: number, categoryType: Category["type"] | undefined) {
  // Backend stores positive amounts; reports infer sign by category type.
  if (categoryType === "expense") return -Math.abs(amount);
  return Math.abs(amount);
}

export function TransactionUpsertDialog(props: Props) {
  const isEdit = props.mode === "edit";
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const accountsQuery = useAccounts({ page: 1, limit: SELECT_LIMIT });
  const categoriesQuery = useCategories({ page: 1, limit: SELECT_LIMIT });

  const categories = useMemo(() => categoriesQuery.data?.categories ?? [], [categoriesQuery.data]);
  const categoriesById = useMemo(() => {
    const map = new Map<string, Category>();
    for (const c of categories) map.set(c.id, c);
    return map;
  }, [categories]);

  const initialCategoryId = isEdit ? props.transaction.categoryId : "";

  const form = useForm<TransactionUpsertFormValues>({
    resolver: zodResolver(transactionUpsertFormSchema),
    defaultValues: {
      accountId: props.mode === "create" ? props.initialAccountId ?? "" : props.fixedAccountId ?? "",
      categoryId: initialCategoryId,
      amount: isEdit ? props.transaction.amount : 0,
      description: isEdit ? props.transaction.description ?? "" : "",
    },
  });

  // Hydrate defaults once data is available (category type affects amount sign).
  useEffect(() => {
    if (!props.open) return;

    if (isEdit) {
      const categoryType = categoriesById.get(props.transaction.categoryId)?.type;
      form.reset({
        accountId: props.fixedAccountId ?? "",
        categoryId: props.transaction.categoryId,
        amount: getSignedAmount(props.transaction.amount, categoryType),
        description: props.transaction.description ?? "",
      });
      return;
    }

    // Create mode defaults.
    const defaultAccountId = props.initialAccountId ?? "";
    const firstCategoryId = categories[0]?.id ?? "";
    form.reset({
      accountId: defaultAccountId,
      categoryId: firstCategoryId,
      amount: 0,
      description: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open, isEdit, categoriesById, categories]);

  // If create dialog opens with accountId from URL but it isn't set (not in form state yet),
  // keep it in sync.
  useEffect(() => {
    if (!props.open) return;
    if (props.mode !== "create") return;
    if (!props.initialAccountId) return;
    const current = form.getValues("accountId");
    if (!current) form.setValue("accountId", props.initialAccountId);
  }, [props.open, props, form]);

  const pending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(values: TransactionUpsertFormValues) {
    try {
      if (!isEdit) {
        if (!values.accountId) {
          form.setError("accountId", { message: "Account is required" });
          return;
        }

        await createMutation.mutateAsync({
          accountId: values.accountId,
          categoryId: values.categoryId,
          amount: values.amount,
          description: values.description,
        });
        toast.success("Transaction created");
      } else {
        await updateMutation.mutateAsync({
          id: props.transaction.id,
          categoryId: values.categoryId,
          amount: values.amount,
          description: values.description,
        });
        toast.success("Transaction updated");
      }

      props.onOpenChange(false);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  }

  const submitLabel = isEdit ? "Save" : "Create";

  const amountHint = isEdit
    ? "Enter amount (negative ok; expense is derived by category type)."
    : "Amount sign is UI-only; backend stores positive amounts.";

  const accounts = accountsQuery.data?.accounts ?? [];

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit transaction" : "New transaction"}</DialogTitle>
        </DialogHeader>

        <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-3">
            <Label>Account</Label>
            <Select
              value={form.watch("accountId") ?? ""}
              onValueChange={(v) => form.setValue("accountId", v, { shouldValidate: true })}
              disabled={isEdit || accountsQuery.isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a: Account) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} ({a.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.accountId?.message ? (
              <p className="text-xs text-destructive">{String(form.formState.errors.accountId.message)}</p>
            ) : null}
          </div>

          <div className="grid gap-3">
            <Label>Category</Label>
            <Select
              value={form.watch("categoryId") ?? ""}
              onValueChange={(v) => form.setValue("categoryId", v, { shouldValidate: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.categoryId?.message ? (
              <p className="text-xs text-destructive">{String(form.formState.errors.categoryId.message)}</p>
            ) : null}
          </div>

          <div className="grid gap-3">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              inputMode="decimal"
              type="number"
              step="0.01"
              {...form.register("amount", { valueAsNumber: true })}
              aria-invalid={!!form.formState.errors.amount}
            />
            {form.formState.errors.amount?.message ? (
              <p className="text-xs text-destructive">{String(form.formState.errors.amount.message)}</p>
            ) : (
              <p className="text-xs text-muted-foreground">{amountHint}</p>
            )}
          </div>

          <div className="grid gap-3">
            <Label htmlFor="description">Description (optional)</Label>
            <Input id="description" {...form.register("description")} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

