import * as fs from 'fs';
import * as path from 'path';
import {
  IAccount,
  ICategoryBreakdown,
  ISummary,
  ITransaction,
} from '../interfaces';
import {
  EditableTransactionFields,
  SerializedAccount,
  TransactionFilter,
  TransactionType,
} from '../types';
import {
  formatBalance,
  formatCurrency,
  generateUniqueId,
} from '../utils';
import { Transaction } from './Transaction';

/**
 * Класс бюджетного счёта пользователя.
 * Инкапсулирует список транзакций, расчёт баланса, статистики, фильтрацию и экспорт в CSV.
 */
export class Account implements IAccount {
  public readonly id: string;
  private _name: string;
  private transactions: ITransaction[] = [];

  constructor(
    name: string,
    id?: string,
    initialTransactions: ITransaction[] = []
  ) {
    if (!name || !name.trim()) {
      throw new Error('Название счёта не может быть пустым.');
    }

    this.id = id && id.trim() ? id.trim() : generateUniqueId('acc');
    this._name = name.trim();
    this.transactions = [...initialTransactions];
  }

  public get name(): string {
    return this._name;
  }

  public set name(value: string) {
    if (!value || !value.trim()) {
      throw new Error('Название счёта не может быть пустым.');
    }
    this._name = value.trim();
  }

  /**
   * Суммарный доход по счёту.
   */
  public get totalIncome(): number {
    const sum = this.transactions
      .filter((tx) => tx.type === TransactionType.INCOME)
      .reduce((acc, tx) => acc + tx.amount, 0);
    return Math.round(sum * 100) / 100;
  }

  /**
   * Суммарный расход по счёту.
   */
  public get totalExpense(): number {
    const sum = this.transactions
      .filter((tx) => tx.type === TransactionType.EXPENSE)
      .reduce((acc, tx) => acc + tx.amount, 0);
    return Math.round(sum * 100) / 100;
  }

  /**
   * Текущий баланс счёта (доходы минус расходы).
   */
  public get balance(): number {
    return Math.round((this.totalIncome - this.totalExpense) * 100) / 100;
  }

  /**
   * Возвращает неизменяемую копию списка транзакций, отсортированную по дате (от новых к старым).
   */
  public getTransactions(): readonly ITransaction[] {
    return [...this.transactions].sort((a, b) => b.date.localeCompare(a.date));
  }

  /**
   * Ищет транзакцию по её уникальному ID.
   */
  public getTransactionById(transactionId: string): ITransaction | undefined {
    return this.transactions.find((tx) => tx.id === transactionId);
  }

  /**
   * Добавляет новую транзакцию к счёту.
   */
  public addTransaction(transaction: ITransaction): void {
    const exists = this.transactions.some((tx) => tx.id === transaction.id);
    if (exists) {
      throw new Error(`Транзакция с ID "${transaction.id}" уже существует на данном счёте.`);
    }
    this.transactions.push(transaction);
  }

  /**
   * Обновляет данные существующей транзакции по ID.
   */
  public editTransaction(
    transactionId: string,
    fields: EditableTransactionFields
  ): boolean {
    const transaction = this.getTransactionById(transactionId);
    if (!transaction) {
      return false;
    }
    transaction.update(fields);
    return true;
  }

  /**
   * Удаляет транзакцию по её ID.
   */
  public removeTransaction(transactionId: string): boolean {
    const index = this.transactions.findIndex((tx) => tx.id === transactionId);
    if (index === -1) {
      return false;
    }
    this.transactions.splice(index, 1);
    return true;
  }

  /**
   * Полностью очищает все транзакции счёта (вызывается при удалении счёта).
   */
  public clearTransactions(): void {
    this.transactions = [];
  }

  /**
   * Фильтрует транзакции по типу, категории, поисковому запросу, диапазону дат и сумм.
   */
  public filterTransactions(filter: TransactionFilter): ITransaction[] {
    return this.getTransactions().filter((tx) => {
      if (filter.type && filter.type !== 'ALL' && tx.type !== filter.type) {
        return false;
      }

      if (
        filter.category &&
        filter.category !== 'ALL' &&
        tx.category.toLowerCase() !== filter.category.toLowerCase()
      ) {
        return false;
      }

      if (filter.searchQuery && filter.searchQuery.trim() !== '') {
        const query = filter.searchQuery.trim().toLowerCase();
        const matchesDesc = tx.description.toLowerCase().includes(query);
        const matchesCat = tx.category.toLowerCase().includes(query);
        const matchesDate = tx.date.toLowerCase().includes(query);
        if (!matchesDesc && !matchesCat && !matchesDate) {
          return false;
        }
      }

      if (filter.dateFrom && tx.date < filter.dateFrom) {
        return false;
      }

      if (filter.dateTo && tx.date > filter.dateTo) {
        return false;
      }

      if (filter.minAmount !== undefined && tx.amount < filter.minAmount) {
        return false;
      }

      if (filter.maxAmount !== undefined && tx.amount > filter.maxAmount) {
        return false;
      }

      return true;
    });
  }

  /**
   * Рассчитывает расширенную сводку и разбивку по категориям.
   */
  public getSummary(): ISummary {
    return Account.computeSummaryFromTransactions(this.transactions);
  }

  /**
   * Статический метод для расчёта статистики по произвольному набору транзакций.
   */
  public static computeSummaryFromTransactions(
    transactions: readonly ITransaction[]
  ): ISummary {
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    const categoryMap = new Map<
      string,
      { category: string; type: TransactionType; totalAmount: number; count: number }
    >();

    for (const tx of transactions) {
      if (tx.type === TransactionType.INCOME) {
        totalIncome += tx.amount;
        incomeCount += 1;
      } else {
        totalExpense += tx.amount;
        expenseCount += 1;
      }

      const key = `${tx.type}::${tx.category}`;
      const existing = categoryMap.get(key);
      if (existing) {
        existing.totalAmount = Math.round((existing.totalAmount + tx.amount) * 100) / 100;
        existing.count += 1;
      } else {
        categoryMap.set(key, {
          category: tx.category,
          type: tx.type,
          totalAmount: Math.round(tx.amount * 100) / 100,
          count: 1,
        });
      }
    }

    totalIncome = Math.round(totalIncome * 100) / 100;
    totalExpense = Math.round(totalExpense * 100) / 100;
    const balance = Math.round((totalIncome - totalExpense) * 100) / 100;

    const categoryBreakdown: ICategoryBreakdown[] = Array.from(
      categoryMap.values()
    )
      .map((entry) => {
        const typeTotal =
          entry.type === TransactionType.INCOME ? totalIncome : totalExpense;
        const percentage =
          typeTotal > 0 ? Math.round((entry.totalAmount / typeTotal) * 1000) / 10 : 0;
        return {
          category: entry.category,
          type: entry.type,
          totalAmount: entry.totalAmount,
          count: entry.count,
          percentage,
        };
      })
      .sort((a, b) => b.totalAmount - a.totalAmount);

    return {
      balance,
      totalIncome,
      totalExpense,
      transactionsCount: transactions.length,
      incomeCount,
      expenseCount,
      averageIncome:
        incomeCount > 0 ? Math.round((totalIncome / incomeCount) * 100) / 100 : 0,
      averageExpense:
        expenseCount > 0 ? Math.round((totalExpense / expenseCount) * 100) / 100 : 0,
      categoryBreakdown,
    };
  }

  /**
   * Строковое представление счёта для меню выбора.
   */
  public toString(): string {
    return `${this._name} [ID: ${this.id}] — Баланс: ${formatBalance(this.balance)} (Доходы: +${formatCurrency(this.totalIncome)}, Расходы: -${formatCurrency(this.totalExpense)}, Оп.: ${this.transactions.length})`;
  }

  /**
   * Формирует строку CSV со всеми транзакциями счёта.
   */
  public toCSVString(): string {
    const header = [
      'ID транзакции',
      'Дата',
      'Код типа',
      'Тип операции',
      'Категория',
      'Сумма',
      'Сумма со знаком',
      'Описание',
    ].join(',');

    const rows = this.getTransactions().map((tx) => tx.toCSVRow());
    return [header, ...rows].join('\n');
  }

  /**
   * Экспортирует транзакции счёта в CSV-файл (с UTF-8 BOM для корректного открытия в Excel).
   * Возвращает полный путь к созданному файлу.
   */
  public exportToCSV(filename: string): string {
    const trimmed = filename.trim();
    if (!trimmed) {
      throw new Error('Имя файла для экспорта не может быть пустым.');
    }

    const normalizedFilename = trimmed.toLowerCase().endsWith('.csv')
      ? trimmed
      : `${trimmed}.csv`;

    const targetPath = path.isAbsolute(normalizedFilename)
      ? normalizedFilename
      : path.resolve(process.cwd(), normalizedFilename);

    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const utf8Bom = '\uFEFF';
    const csvContent = utf8Bom + this.toCSVString() + '\n';
    fs.writeFileSync(targetPath, csvContent, { encoding: 'utf-8' });

    return targetPath;
  }

  /**
   * Сериализует счёт в JSON-структуру.
   */
  public toJSON(): SerializedAccount {
    return {
      id: this.id,
      name: this._name,
      transactions: this.transactions.map((tx) => tx.toJSON()),
    };
  }

  /**
   * Восстанавливает экземпляр Account из JSON-структуры.
   */
  public static fromJSON(data: SerializedAccount): Account {
    const restoredTransactions = (data.transactions ?? []).map((txData) =>
      Transaction.fromJSON(txData)
    );
    return new Account(data.name, data.id, restoredTransactions);
  }
}
