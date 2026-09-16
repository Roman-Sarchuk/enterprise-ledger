import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { AccountUpsertDialog } from "@/features/accounts/components/AccountUpsertDialog";
import { AccountsTable } from "@/features/accounts/components/AccountsTable";
import { useAccounts } from "@/features/accounts/hooks";

const PAGE_LIMIT = 10;

export function AccountsPage() {
  const [sp, setSp] = useSearchParams();
  const page = Math.max(1, Number(sp.get("page") ?? "1") || 1);
  const limit = PAGE_LIMIT;

  const accountsQuery = useAccounts({ page, limit });
  const accounts = useMemo(() => accountsQuery.data?.accounts ?? [], [accountsQuery.data?.accounts]);

  const [createOpen, setCreateOpen] = useState(false);

  const canPrev = page > 1;
  const canNext = accounts.length === limit;

  function setPage(nextPage: number) {
    setSp((prev) => {
      const p = new URLSearchParams(prev);
      p.set("page", String(nextPage));
      return p;
    });
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts</h1>
          <p className="page-subtitle">Your money containers and balances</p>
        </div>

        <div className="surface flex items-center gap-2 px-2 py-1.5">
          <Button variant="outline" disabled={!canPrev} onClick={() => setPage(page - 1)}>
            Prev
          </Button>
          <div className="min-w-14 text-center text-sm text-muted-foreground">Page {page}</div>
          <Button variant="outline" disabled={!canNext} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      </div>

      <AccountsTable
        accounts={accounts}
        isLoading={accountsQuery.isLoading}
        limit={limit}
        onAddNew={() => setCreateOpen(true)}
      />

      {createOpen ? <AccountUpsertDialog mode="create" open={createOpen} onOpenChange={setCreateOpen} /> : null}
    </div>
  );
}

