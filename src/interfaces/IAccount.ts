import { ISummary } from './ISummary';
import { ITransaction } from './ITransaction';

export interface IAccount {
  readonly id: string;
  name: string;
  addTransaction(transaction: ITransaction): void;
  removeTransactionById(transactionId: string): boolean;
  getTransactions(): ITransaction[];
  getSummary(): ISummary;
  getSummaryString(): string;
  exportTransactionsToCSV(filename: string): Promise<void>;
  toString(): string;
}
