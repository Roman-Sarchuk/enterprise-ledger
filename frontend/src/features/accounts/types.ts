export const currencies = ["UAH", "USD", "EUR"] as const;
export type Currency = (typeof currencies)[number];

export type Account = {
  id: string;
  name: string;
  balance: number;
  currency: Currency;
};

export type AccountsListResponse = {
  accounts: Account[];
};

export type AccountResponse = {
  account: Account;
};

