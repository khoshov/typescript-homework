/// <reference path="./ITransaction.ts" />
/// <reference path="./ISummary.ts" />

namespace BudgetTracker {
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
}
