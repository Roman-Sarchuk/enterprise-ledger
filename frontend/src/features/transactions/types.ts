export type Transaction = {
  id: string;
  categoryId: string;
  amount: number;
  description?: string | null;
  createdAt: string | Date;
};

export type TransactionsListResponse = {
  transactions: Transaction[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type TransactionResponse = {
  transaction: Transaction;
};

