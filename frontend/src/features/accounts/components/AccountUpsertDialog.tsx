import { zodResolver } from "@hookform/resolvers/zod";
import { Controller } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Account, Currency } from "@/features/accounts/types";
import { currencies } from "@/features/accounts/types";
import { accountCreateSchema, accountUpdateSchema, type AccountCreateValues, type AccountUpdateValues } from "@/features/accounts/schemas";
import { useCreateAccount, useUpdateAccount } from "@/features/accounts/hooks";
import { getApiErrorMessage } from "@/shared/api/errors";

type Props =
  | {
      mode: "create";
      open: boolean;
      onOpenChange: (open: boolean) => void;
    }
  | {
      mode: "edit";
      open: boolean;
      onOpenChange: (open: boolean) => void;
      account: Account;
    };

export function AccountUpsertDialog(props: Props) {
  const isEdit = props.mode === "edit";
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();

  const editName = isEdit ? props.account.name : "";
  const editCurrency = isEdit ? props.account.currency : ("UAH" as Currency);

  const defaultValues = useMemo(() => {
    if (!isEdit) return { name: "", currency: "UAH" as Currency };
    return { name: editName, currency: editCurrency };
  }, [isEdit, editName, editCurrency]);

  const form = useForm<AccountCreateValues | AccountUpdateValues>({
    resolver: zodResolver(isEdit ? accountUpdateSchema : accountCreateSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!props.open) return;
    form.reset(defaultValues);
  }, [props.open, defaultValues, form]);

  const pending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(values: AccountCreateValues | AccountUpdateValues) {
    try {
      if (!isEdit) {
        const v = values as AccountCreateValues;
        await createMutation.mutateAsync({ name: v.name, currency: v.currency });
        toast.success("Account created");
      } else {
        const v = values as AccountUpdateValues;
        await updateMutation.mutateAsync({ id: props.account.id, name: v.name, currency: v.currency });
        toast.success("Account updated");
      }
      props.onOpenChange(false);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit account" : "New account"}</DialogTitle>
        </DialogHeader>

        <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-3">
            <Label htmlFor="account-name">Name</Label>
            <Input id="account-name" {...form.register("name")} aria-invalid={!!form.formState.errors.name} />
            {form.formState.errors.name?.message ? (
              <p className="text-xs text-destructive">{String(form.formState.errors.name.message)}</p>
            ) : null}
          </div>

          <div className="grid gap-3">
            <Label>Currency</Label>
            <Controller
              control={form.control}
              name="currency"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(v) => field.onChange(v as Currency)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.currency?.message ? (
              <p className="text-xs text-destructive">{String(form.formState.errors.currency.message)}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => props.onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

