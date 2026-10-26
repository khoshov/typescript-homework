import {
  IAccount,
  IAccountManager,
  ISummary,
  ITransaction,
  TransactionType,
} from './types';

export class Transaction implements ITransaction {
  public id: number;
  public amount: number;
  public type: TransactionType;
  public date: string;
  public description: string;

  constructor(
    id: number,
    amount: number,
    type: TransactionType,
    date: string,
    description: string
  ) {
    this.id = id;
    this.amount = amount;
    this.type = type;
    this.date = date;
    this.description = description;
  }

  public toString(): string {
    const typeLabel = this.type === 'income' ? 'INCOME' : 'EXPENSE';
    const shortDate = this.date.split('T')[0];
    return `Транзакция #${this.id}: [${typeLabel}] ${this.amount} ₽, Дата: ${shortDate}, Описание: ${this.description}`;
  }
}

export class Account implements IAccount, ISummary {
  public id: number;
  public name: string;
  public transactions: Transaction[] = [];

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  public get income(): number {
    return this.transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  public get expenses(): number {
    return this.transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  public get balance(): number {
    return this.income - this.expenses;
  }

  public addTransaction(transaction: Transaction): void {
    this.transactions.push(transaction);
  }

  public removeTransactionById(transactionId: number): boolean {
    const index = this.transactions.findIndex((t) => t.id === transactionId);
    if (index === -1) {
      return false;
    }
    this.transactions.splice(index, 1);
    return true;
  }

  public getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  public getSummary(): ISummary {
    return {
      income: this.income,
      expenses: this.expenses,
      balance: this.balance,
    };
  }

  public getSummaryString(): string {
    return `Счёт "${this.name}" (ID: ${this.id}) | Баланс: ${this.balance} ₽ (Доходы: ${this.income} ₽, Расходы: ${this.expenses} ₽) | Транзакций: ${this.transactions.length}`;
  }

  public toString(): string {
    const header = `${this.id}) ${this.name} (Баланс: ${this.balance} ₽)`;
    if (this.transactions.length === 0) {
      return `${header}\nСписок транзакций пуст.`;
    }
    const txLines = this.transactions
      .map((t) => `  - ${t.toString()}`)
      .join('\n');
    return `${header}\nСписок транзакций:\n${txLines}`;
  }
}

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
