import { writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { formatCurrency } from 'formatCurrency';
import { IAccount } from '../interfaces/IAccount';
import { ISummary } from '../interfaces/ISummary';
import { AccountUpdate } from '../interfaces/utility-types';
import { escapeCsvValue } from '../utils/escapeCsvValue';
import { Transaction } from './Transaction';

export class Account implements IAccount, ISummary {
  public readonly id: string;
  public name: string;
  public transactions: Transaction[] = [];

  constructor(name: string) {
    this.id = uuidv4();
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

  public update(update: AccountUpdate): void {
    if (update.name !== undefined) {
      this.name = update.name;
    }
  }

  public addTransaction(transaction: Transaction): void {
    this.transactions.push(transaction);
  }

  public removeTransactionById(transactionId: string): boolean {
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
    return `Счёт "${this.name}" (ID: ${this.id.slice(0, 8)}) | Баланс: ${formatCurrency(this.balance)} (Доходы: ${formatCurrency(this.income)}, Расходы: ${formatCurrency(this.expenses)}) | Транзакций: ${this.transactions.length}`;
  }

  public async exportTransactionsToCSV(filename: string): Promise<void> {
    if (!filename || !filename.trim()) {
      throw new Error('Имя файла для экспорта не может быть пустым.');
    }

    const normalizedName = filename.trim().endsWith('.csv')
      ? filename.trim()
      : `${filename.trim()}.csv`;

    const header = 'id,amount,type,date,description';
    const rows = this.transactions.map((t) =>
      [
        escapeCsvValue(t.id),
        escapeCsvValue(t.amount),
        escapeCsvValue(t.type),
        escapeCsvValue(t.date),
        escapeCsvValue(t.description),
      ].join(',')
    );

    const csvContent = [header, ...rows].join('\n');

    try {
      await writeFile(normalizedName, csvContent, 'utf-8');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Не удалось экспортировать транзакции в файл "${normalizedName}": ${msg}`
      );
    }
  }

  public toString(): string {
    const header = `${this.name} [ID: ${this.id.slice(0, 8)}] (Баланс: ${formatCurrency(this.balance)})`;
    if (this.transactions.length === 0) {
      return `${header}\nСписок транзакций пуст.`;
    }
    const txLines = this.transactions
      .map((t) => `  - ${t.toString()}`)
      .join('\n');
    return `${header}\nСписок транзакций:\n${txLines}`;
  }
}
