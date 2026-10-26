import {
  EditableTransactionFields,
  SerializedAccount,
  TransactionFilter,
} from '../types';
import { ISummary } from './ISummary';
import { ITransaction } from './ITransaction';

/**
 * Интерфейс бюджетного счёта.
 */
export interface IAccount {
  readonly id: string;
  name: string;
  readonly balance: number;
  readonly totalIncome: number;
  readonly totalExpense: number;

  /**
   * Возвращает список всех транзакций счёта (копию для защиты инкапсуляции).
   */
  getTransactions(): readonly ITransaction[];

  /**
   * Находит транзакцию по её уникальному идентификатору.
   */
  getTransactionById(transactionId: string): ITransaction | undefined;

  /**
   * Добавляет новую транзакцию к счёту.
   */
  addTransaction(transaction: ITransaction): void;

  /**
   * Редактирует существующую транзакцию по ID.
   */
  editTransaction(
    transactionId: string,
    fields: EditableTransactionFields
  ): boolean;

  /**
   * Удаляет транзакцию по ID. Возвращает true, если транзакция была найдена и удалена.
   */
  removeTransaction(transactionId: string): boolean;

  /**
   * Очищает все транзакции счёта (используется при полном удалении счёта).
   */
  clearTransactions(): void;

  /**
   * Фильтрует и ищет транзакции по заданным критериям.
   */
  filterTransactions(filter: TransactionFilter): ITransaction[];

  /**
   * Вычисляет подробную сводку и статистику по счёту.
   */
  getSummary(): ISummary;

  /**
   * Возвращает строковое представление счёта.
   */
  toString(): string;

  /**
   * Формирует содержимое CSV-файла со всеми транзакциями счёта.
   */
  toCSVString(): string;

  /**
   * Экспортирует транзакции счёта в указанный CSV-файл на диске.
   */
  exportToCSV(filename: string): string;

  /**
   * Сериализует счёт в plain-объект для сохранения в JSON.
   */
  toJSON(): SerializedAccount;
}
