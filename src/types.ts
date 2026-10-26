export type TransactionType = 'income' | 'expense';

export interface ITransaction {
  id: number;
  amount: number;
  type: TransactionType;
  date: string;
  description: string;
  toString(): string;
}

export interface ISummary {
  income: number;
  expenses: number;
  balance: number;
}

export interface IAccount {
  id: number;
  name: string;
  addTransaction(transaction: ITransaction): void;
  removeTransactionById(transactionId: number): boolean;
  getTransactions(): ITransaction[];
  getSummary(): ISummary;
  getSummaryString(): string;
  toString(): string;
}

export interface IAccountManager {
  addAccount(account: IAccount): void;
  removeAccountById(accountId: number): boolean;
  getAccounts(): IAccount[];
  getAllAccounts(): IAccount[];
  getAccountById(id: number): IAccount | undefined;
  getSummary(accountId?: number): ISummary;
  getSummaryString(): string;
  toString(): string;
}
