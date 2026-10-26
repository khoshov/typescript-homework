import { ITransaction } from '../interfaces';
import {
  EditableTransactionFields,
  SerializedTransaction,
  TRANSACTION_TYPE_LABELS,
  TransactionType,
} from '../types';
import {
  escapeCsvField,
  formatSignedCurrency,
  generateUniqueId,
} from '../utils';

/**
 * Класс финансовой транзакции (доход или расход).
 */
export class Transaction implements ITransaction {
  public readonly id: string;
  private _amount: number;
  private _type: TransactionType;
  private _date: string;
  private _description: string;
  private _category: string;

  constructor(
    amount: number,
    type: TransactionType,
    date: string,
    description: string,
    category: string = 'Общее',
    id?: string
  ) {
    if (amount <= 0 || Number.isNaN(amount)) {
      throw new Error('Сумма транзакции должна быть положительным числом.');
    }

    this.id = id && id.trim() ? id.trim() : generateUniqueId('tx');
    this._amount = Math.round(amount * 100) / 100;
    this._type = type;
    this._date = date.trim();
    this._description = description.trim();
    this._category = category.trim() || 'Общее';
  }

  public get amount(): number {
    return this._amount;
  }

  public set amount(value: number) {
    if (value <= 0 || Number.isNaN(value)) {
      throw new Error('Сумма транзакции должна быть больше нуля.');
    }
    this._amount = Math.round(value * 100) / 100;
  }

  public get type(): TransactionType {
    return this._type;
  }

  public set type(value: TransactionType) {
    this._type = value;
  }

  public get date(): string {
    return this._date;
  }

  public set date(value: string) {
    if (!value.trim()) {
      throw new Error('Дата транзакции не может быть пустой.');
    }
    this._date = value.trim();
  }

  public get description(): string {
    return this._description;
  }

  public set description(value: string) {
    if (!value.trim()) {
      throw new Error('Описание транзакции не может быть пустым.');
    }
    this._description = value.trim();
  }

  public get category(): string {
    return this._category;
  }

  public set category(value: string) {
    this._category = value.trim() || 'Общее';
  }

  /**
   * Обновляет указанные поля транзакции с сохранением инкапсуляции и проверок.
   */
  public update(fields: EditableTransactionFields): void {
    if (fields.amount !== undefined) {
      this.amount = fields.amount;
    }
    if (fields.type !== undefined) {
      this.type = fields.type;
    }
    if (fields.date !== undefined) {
      this.date = fields.date;
    }
    if (fields.description !== undefined) {
      this.description = fields.description;
    }
    if (fields.category !== undefined) {
      this.category = fields.category;
    }
  }

  /**
   * Возвращает форматированное строковое представление транзакции для CLI.
   */
  public toString(): string {
    const typeLabel = TRANSACTION_TYPE_LABELS[this._type];
    const signedAmount = formatSignedCurrency(this._amount, this._type);
    return `[${this._date}] ${ signedAmount } | ${typeLabel} (${this._category}) — ${this._description} [ID: ${this.id}]`;
  }

  /**
   * Формирует строку CSV для экспорта.
   */
  public toCSVRow(): string {
    const typeLabel = TRANSACTION_TYPE_LABELS[this._type];
    const signedNumeric =
      this._type === TransactionType.INCOME ? this._amount : -this._amount;

    const fields: Array<string | number> = [
      this.id,
      this._date,
      this._type,
      typeLabel,
      this._category,
      this._amount.toFixed(2),
      signedNumeric.toFixed(2),
      this._description,
    ];

    return fields.map(escapeCsvField).join(',');
  }

  /**
   * Сериализует транзакцию для сохранения в JSON.
   */
  public toJSON(): SerializedTransaction {
    return {
      id: this.id,
      amount: this._amount,
      type: this._type,
      date: this._date,
      description: this._description,
      category: this._category,
    };
  }

  /**
   * Восстанавливает экземпляр Transaction из сериализованного объекта.
   */
  public static fromJSON(data: SerializedTransaction): Transaction {
    return new Transaction(
      data.amount,
      data.type,
      data.date,
      data.description,
      data.category,
      data.id
    );
  }
}
