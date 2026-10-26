/// <reference path="../interfaces/IAccountManager.ts" />
/// <reference path="./Account.ts" />

namespace BudgetTracker {
  export class AccountManager implements IAccountManager, ISummary {
    public accounts: Account[] = [];

    public get income(): number {
      return this.accounts.reduce((sum, acc) => sum + acc.income, 0);
    }

    public get expenses(): number {
      return this.accounts.reduce((sum, acc) => sum + acc.expenses, 0);
    }

    public get balance(): number {
      return this.income - this.expenses;
    }

    public addAccount(account: Account): void {
      this.accounts.push(account);
    }

    public removeAccountById(accountId: number): boolean {
      const index = this.accounts.findIndex((acc) => acc.id === accountId);
      if (index === -1) {
        return false;
      }
      this.accounts.splice(index, 1);
      return true;
    }

    public getAccountById(id: number): Account | undefined {
      return this.accounts.find((acc) => acc.id === id);
    }

    public getAccounts(): Account[] {
      return [...this.accounts];
    }

    public getAllAccounts(): Account[] {
      return [...this.accounts];
    }

    public getSummary(accountId?: number): ISummary {
      if (accountId !== undefined) {
        const account = this.getAccountById(accountId);
        if (!account) {
          return { income: 0, expenses: 0, balance: 0 };
        }
        return account.getSummary();
      }
      return {
        income: this.income,
        expenses: this.expenses,
        balance: this.balance,
      };
    }

    public getSummaryString(): string {
      return `Всего счетов: ${this.accounts.length} | Общий баланс: ${this.balance} ₽ (Доходы: ${this.income} ₽, Расходы: ${this.expenses} ₽)`;
    }

    public toString(): string {
      if (this.accounts.length === 0) {
        return 'Список счетов пуст.';
      }
      return [
        this.getSummaryString(),
        ...this.accounts.map((acc) => acc.toString()),
      ].join('\n\n');
    }
  }
}
