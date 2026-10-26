/// <reference path="../interfaces/IAccount.ts" />
/// <reference path="./Transaction.ts" />

namespace BudgetTracker {
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
}
