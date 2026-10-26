/// <reference path="./IAccount.ts" />
/// <reference path="./ISummary.ts" />

namespace BudgetTracker {
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
}
