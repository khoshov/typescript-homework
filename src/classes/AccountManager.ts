import { formatCurrency } from 'formatCurrency';
import { IAccountManager } from '../interfaces/IAccountManager';
import { ISummary } from '../interfaces/ISummary';
import { Account } from './Account';

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

  public removeAccountById(accountId: string): boolean {
    const index = this.accounts.findIndex((acc) => acc.id === accountId);
    if (index === -1) {
      return false;
    }
    this.accounts.splice(index, 1);
    return true;
  }

  public getAccountById(id: string): Account | undefined {
    return this.accounts.find((acc) => acc.id === id);
  }

  public getAccounts(): Account[] {
    return [...this.accounts];
  }

  public getAllAccounts(): Account[] {
    return [...this.accounts];
  }

  public getSummary(accountId?: string): ISummary {
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
    return `Всего счетов: ${this.accounts.length} | Общий баланс: ${formatCurrency(this.balance)} (Доходы: ${formatCurrency(this.income)}, Расходы: ${formatCurrency(this.expenses)})`;
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
