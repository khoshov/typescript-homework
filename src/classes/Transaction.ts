import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { formatCurrency } from 'formatCurrency';
import { ITransaction } from '../interfaces/ITransaction';
import { TransactionType } from '../interfaces/TransactionType';
import { TransactionUpdate } from '../interfaces/utility-types';

export class Transaction implements ITransaction {
  public readonly id: string;
  public amount: number;
  public type: TransactionType;
  public date: string;
  public description: string;

  constructor(
    amount: number,
    type: TransactionType,
    date: string,
    description: string
  ) {
    this.id = uuidv4();
    this.amount = amount;
    this.type = type;
    this.date = date;
    this.description = description;
  }

  public update(update: TransactionUpdate): void {
    if (update.amount !== undefined) {
      this.amount = update.amount;
    }
    if (update.type !== undefined) {
      this.type = update.type;
    }
    if (update.date !== undefined) {
      this.date = update.date;
    }
    if (update.description !== undefined) {
      this.description = update.description;
    }
  }

  public toString(): string {
    const typeLabel = this.type === 'income' ? 'INCOME' : 'EXPENSE';
    const formattedDate = moment(new Date(this.date)).format('LL');
    return `Транзакция #${this.id.slice(0, 8)}: [${typeLabel}] ${formatCurrency(this.amount)}, Дата: ${formattedDate}, Описание: ${this.description}`;
  }
}
