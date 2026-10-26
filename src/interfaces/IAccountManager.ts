import { IAccount } from './IAccount';
import { ISummary } from './ISummary';

export interface IAccountManager {
  addAccount(account: IAccount): void;
  removeAccountById(accountId: string): boolean;
  getAccounts(): IAccount[];
  getAllAccounts(): IAccount[];
  getAccountById(id: string): IAccount | undefined;
  getSummary(accountId?: string): ISummary;
  getSummaryString(): string;
  toString(): string;
}
