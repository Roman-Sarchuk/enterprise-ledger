import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { Category, CategoryType } from "@/features/categories/types";
import { categoryTypes } from "@/features/categories/types";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  type CategoryCreateValues,
  type CategoryUpdateValues,
} from "@/features/categories/schemas";
import { useCreateCategory, useUpdateCategory } from "@/features/categories/hooks";
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
      category: Category;
    };

export function CategoryUpsertDialog(props: Props) {
  const isEdit = props.mode === "edit";
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const defaultValues = useMemo(() => {
    if (!isEdit) return { name: "", type: "expense" as CategoryType, icon: "🍔" };
    return { name: props.category.name, type: props.category.type, icon: props.category.icon };
  }, [isEdit, props]);

  const form = useForm<CategoryCreateValues | CategoryUpdateValues>({
    resolver: zodResolver(isEdit ? categoryUpdateSchema : categoryCreateSchema),
    defaultValues,
  });

  useEffect(() => {
    if (props.open) form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open, defaultValues]);

  const pending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(values: CategoryCreateValues | CategoryUpdateValues) {
    try {
      if (!isEdit) {
        const v = values as CategoryCreateValues;
        await createMutation.mutateAsync({ name: v.name, type: v.type, icon: v.icon });
        toast.success("Category created");
      } else {
        const v = values as CategoryUpdateValues;
        await updateMutation.mutateAsync({
          id: props.category.id,
          name: v.name,
          type: v.type,
          icon: v.icon,
        });
        toast.success("Category updated");
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
          <DialogTitle>{isEdit ? "Edit category" : "New category"}</DialogTitle>
        </DialogHeader>

        <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-3">
            <Label htmlFor="category-name">Name</Label>
            <Input id="category-name" {...form.register("name")} aria-invalid={!!form.formState.errors.name} />
            {form.formState.errors.name?.message ? (
              <p className="text-xs text-destructive">{String(form.formState.errors.name.message)}</p>
            ) : null}
          </div>

          <div className="grid gap-3">
            <Label>Type</Label>
            <Select
              value={form.watch("type")}
              onValueChange={(v) => form.setValue("type", v as CategoryType, { shouldValidate: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {categoryTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.type?.message ? (
              <p className="text-xs text-destructive">{String(form.formState.errors.type.message)}</p>
            ) : null}
          </div>

          <div className="grid gap-3">
            <Label htmlFor="category-icon">Icon (emoji)</Label>
            <Input id="category-icon" maxLength={8} {...form.register("icon")} aria-invalid={!!form.formState.errors.icon} />
            {form.formState.errors.icon?.message ? (
              <p className="text-xs text-destructive">{String(form.formState.errors.icon.message)}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Backend expects a valid emoji.</p>
            )}
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

