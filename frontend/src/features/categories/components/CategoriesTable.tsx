import { useMemo, useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { Category } from "@/features/categories/types";
import { CategoryUpsertDialog } from "@/features/categories/components/CategoryUpsertDialog";
import { useDeleteCategory } from "@/features/categories/hooks";
import { getApiErrorMessage } from "@/shared/api/errors";

type Props = {
  categories: Category[];
  isLoading: boolean;
  limit: number;
  onAddNew: () => void;
};

export function CategoriesTable({ categories, isLoading, limit, onAddNew }: Props) {
  const deleteMutation = useDeleteCategory();

  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const rows = useMemo(() => categories ?? [], [categories]);
  const hasData = rows.length > 0;

  async function onDelete(category: Category) {
    if (category.isSystem) {
      toast.error("Типові категорії не можна видаляти");
      return;
    }
    const ok = window.confirm(`Видалити категорію "${category.name}"?`);
    if (!ok) return;
    try {
      await deleteMutation.mutateAsync(category.id);
      toast.success("Категорію видалено");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  }

  return (
    <div className="grid gap-3">
      <Button variant="outline" className="justify-start border-dashed" onClick={onAddNew}>
        + Додати нову категорію
      </Button>

      <div className="surface overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-0">Іконка</TableHead>
              <TableHead>Назва</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead className="w-0 text-right">Дії</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  Завантаження…
                </TableCell>
              </TableRow>
            ) : !hasData ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  Категорій ще немає.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="text-base">{c.icon}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {c.name}
                      {c.isSystem ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          <Lock className="size-3" /> системна
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{c.type === "income" ? "Дохід" : "Витрата"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label="Open actions">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => {
                            if (c.isSystem) {
                              toast.error("Default categories cannot be edited");
                              return;
                            }
                            setEditCategory(c);
                            setEditOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 size-4" />
                          Редагувати
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => {
                            void onDelete(c);
                          }}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Видалити
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Показано {rows.length} з {limit} на сторінці
      </p>

      {editCategory ? (
        <CategoryUpsertDialog
          mode="edit"
          open={editOpen}
          onOpenChange={setEditOpen}
          category={editCategory}
        />
      ) : null}
    </div>
  );
}

