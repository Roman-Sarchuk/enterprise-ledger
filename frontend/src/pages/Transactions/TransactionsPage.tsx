import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronUp, Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { TransactionUpsertDialog } from "@/features/transactions/components/TransactionUpsertDialog";
import { useDeleteTransaction, useTransactionsInfinite } from "@/features/transactions/hooks";
import { useCategories } from "@/features/categories/hooks";
import { useAccount } from "@/features/accounts/hooks";
import { getApiErrorMessage } from "@/shared/api/errors";

import type { Transaction } from "@/features/transactions/types";

const PAGE_LIMIT = 10;

function formatDate(value: string | Date) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });
}

export function TransactionsPage() {
  const [sp] = useSearchParams();
  const accountId = sp.get("accountId");
  const accountQuery = useAccount(accountId ?? "");

  const [createOpen, setCreateOpen] = useState(false);

  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const deleteMutation = useDeleteTransaction();

  const categoriesQuery = useCategories({ page: 1, limit: 100 });
  const categories = useMemo(() => categoriesQuery.data?.categories ?? [], [categoriesQuery.data]);
  const categoriesById = useMemo(() => {
    const map = new Map<string, (typeof categories)[number]>();
    for (const c of categories) map.set(c.id, c);
    return map;
  }, [categories]);

  const txQuery = useTransactionsInfinite({ limit: PAGE_LIMIT, accountId });

  const allTransactions = useMemo(() => txQuery.data?.pages.flatMap((p) => p.transactions) ?? [], [txQuery.data]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    if (!txQuery.hasNextPage) return;
    if (txQuery.isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          void txQuery.fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [txQuery, allTransactions.length]);

  const [showBackToTop, setShowBackToTop] = useState(false);
  useEffect(() => {
    function onScroll() {
      setShowBackToTop(window.scrollY > 600);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function onDelete(tx: Transaction) {
    const ok = window.confirm(`Delete transaction?`);
    if (!ok) return;

    try {
      await deleteMutation.mutateAsync(tx.id);
      toast.success("Transaction deleted");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  }

  function getSignedAmount(amount: number, categoryType: "income" | "expense" | undefined) {
    if (categoryType === "expense") return -Math.abs(amount);
    return Math.abs(amount);
  }

  return (
    <div className="page">
      <div className="page-header items-start">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">
            {accountId
              ? accountQuery.data?.account.name ?? "Selected account"
              : "All transactions"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-dashed"
            onClick={() => {
              setCreateOpen(true);
            }}
          >
            <Plus className="mr-2 size-4" />
            Add transaction
          </Button>
        </div>
      </div>

      <div className="surface md:hidden">
        {txQuery.isLoading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : allTransactions.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">No transactions yet.</div>
        ) : (
          <div className="divide-y divide-border/70">
            {allTransactions.map((tx) => {
              const cat = categoriesById.get(tx.categoryId);
              const signedAmount = getSignedAmount(tx.amount, cat?.type);
              return (
                <article key={tx.id} className="grid gap-3 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {cat ? `${cat.icon} ${cat.name}` : tx.categoryId}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                      {signedAmount.toFixed(2)}
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground">{tx.description || "No description"}</p>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setEditTx(tx);
                        setEditOpen(true);
                      }}
                      aria-label="Edit transaction"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => void onDelete(tx)}
                      aria-label="Delete transaction"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <div className="surface hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-0">Date</TableHead>
              <TableHead className="w-[1%]">Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[1%] text-right">Amount</TableHead>
              <TableHead className="w-0 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {txQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : allTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No transactions yet.
                </TableCell>
              </TableRow>
            ) : (
              allTransactions.map((tx) => {
                const cat = categoriesById.get(tx.categoryId);
                const signedAmount = getSignedAmount(tx.amount, cat?.type);
                return (
                  <TableRow key={tx.id}>
                    <TableCell>{formatDate(tx.createdAt)}</TableCell>
                    <TableCell>
                      {cat ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-flex size-7 items-center justify-center rounded-md bg-muted">
                            {cat.icon}
                          </span>
                          <span>{cat.name}</span>
                        </span>
                      ) : (
                        tx.categoryId
                      )}
                    </TableCell>
                    <TableCell className="max-w-90">
                      {tx.description ? tx.description : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {signedAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setEditTx(tx);
                            setEditOpen(true);
                          }}
                          aria-label="Edit transaction"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => void onDelete(tx)}
                          aria-label="Delete transaction"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}

            <tr>
              <td colSpan={5} className="p-0">
                <div ref={sentinelRef} />
              </td>
            </tr>
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-center">
        {txQuery.hasNextPage ? (
          <Button
            variant="outline"
            onClick={() => void txQuery.fetchNextPage()}
            disabled={txQuery.isFetchingNextPage}
          >
            {txQuery.isFetchingNextPage ? "Loading…" : "Load more"}
          </Button>
        ) : txQuery.data ? (
          <span className="text-sm text-muted-foreground">End of list</span>
        ) : null}
      </div>

      {showBackToTop ? (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 rounded-full bg-card/90 shadow-lg backdrop-blur"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
        >
          <ChevronUp className="size-4" />
        </Button>
      ) : null}

      <TransactionUpsertDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        initialAccountId={accountId}
      />

      {editTx ? (
        <TransactionUpsertDialog
          mode="edit"
          open={editOpen}
          onOpenChange={setEditOpen}
          transaction={editTx}
          fixedAccountId={accountId}
        />
      ) : null}
    </div>
  );
}

