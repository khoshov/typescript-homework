/// <reference path="../interfaces/ITransaction.ts" />

namespace BudgetTracker {
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
}
