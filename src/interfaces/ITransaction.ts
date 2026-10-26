import {
  EditableTransactionFields,
  SerializedTransaction,
  TransactionType,
} from '../types';

/**
 * Интерфейс финансовой транзакции.
 */
export interface ITransaction {
  readonly id: string;
  amount: number;
  type: TransactionType;
  date: string;
  description: string;
  category: string;

  /**
   * Обновляет поля транзакции.
   */
  update(fields: EditableTransactionFields): void;

  /**
   * Возвращает строковое представление транзакции.
   */
  toString(): string;

  /**
   * Возвращает строку для экспорта в CSV.
   */
  toCSVRow(): string;

  /**
   * Сериализует транзакцию в plain-объект для сохранения в JSON.
   */
  toJSON(): SerializedTransaction;
}
