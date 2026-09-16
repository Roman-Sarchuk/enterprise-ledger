import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BarChart3, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { Account } from "@/features/accounts/types";
import { AccountUpsertDialog } from "@/features/accounts/components/AccountUpsertDialog";
import { useDeleteAccount } from "@/features/accounts/hooks";
import { getApiErrorMessage } from "@/shared/api/errors";

type Props = {
  accounts: Account[];
  isLoading: boolean;
  limit: number;
  onAddNew: () => void;
};

export function AccountsTable({ accounts, isLoading, limit, onAddNew }: Props) {
  const navigate = useNavigate();
  const deleteMutation = useDeleteAccount();

  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const rows = useMemo(() => accounts ?? [], [accounts]);
  const hasData = rows.length > 0;

  async function onDelete(account: Account) {
    const ok = window.confirm(`Delete account "${account.name}"? This will also delete related transactions.`);
    if (!ok) return;
    try {
      await deleteMutation.mutateAsync(account.id);
      toast.success("Account deleted");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  }

  return (
    <div className="grid gap-3">
      <Button
        variant="outline"
        className="justify-start border-dashed"
        onClick={onAddNew}
      >
        + Add new account
      </Button>

      <div className="surface overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead className="w-0 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : !hasData ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No accounts yet. Create your first one.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((a) => (
                <TableRow
                  key={a.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/transactions?accountId=${encodeURIComponent(a.id)}`)}
                >
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell>{a.balance}</TableCell>
                  <TableCell>{a.currency}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Open actions"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem
                          onSelect={() => {
                            setEditAccount(a);
                            setEditOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            navigate(`/analytics?accountId=${encodeURIComponent(a.id)}`);
                          }}
                        >
                          <BarChart3 className="mr-2 size-4" />
                          Analytics
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => {
                            void onDelete(a);
                          }}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete
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
        Showing {rows.length} of {limit} per page
      </p>

      {editAccount ? (
        <AccountUpsertDialog
          mode="edit"
          open={editOpen}
          onOpenChange={setEditOpen}
          account={editAccount}
        />
      ) : null}
    </div>
  );
}

