import {
  IAccount,
  IAccountManager,
  ISummary,
  ITransaction,
} from '../interfaces';
import { createDemoAccounts, StorageService } from '../services';
import { generateUniqueId } from '../utils';
import { Account } from './Account';

/**
 * Класс управления коллекцией бюджетных счетов.
 * Отвечает за создание, поиск, переименование, удаление счетов,
 * агрегацию общей статистики и синхронизацию с файловым хранилищем.
 */
export class AccountManager implements IAccountManager {
  private accounts: IAccount[] = [];
  private readonly storageService?: StorageService;

  constructor(storageService?: StorageService, loadFromStorage: boolean = true) {
    this.storageService = storageService;
    if (this.storageService && loadFromStorage) {
      this.accounts = this.storageService.loadAccounts();
    }
  }

  /**
   * Возвращает неизменяемую копию списка всех счетов.
   */
  public getAccounts(): readonly IAccount[] {
    return [...this.accounts];
  }

  /**
   * Находит счёт по уникальному идентификатору.
   */
  public getAccountById(id: string): IAccount | undefined {
    return this.accounts.find((acc) => acc.id === id);
  }

  /**
   * Проверяет, существует ли уже счёт с таким названием (без учёта регистра).
   */
  public hasAccountWithName(name: string, excludeAccountId?: string): boolean {
    const normalized = name.trim().toLowerCase();
    return this.accounts.some(
      (acc) =>
        acc.id !== excludeAccountId && acc.name.trim().toLowerCase() === normalized
    );
  }

  /**
   * Добавляет готовый экземпляр счёта в коллекцию с проверкой уникальности ID.
   */
  public addAccount(account: IAccount): void {
    if (this.getAccountById(account.id)) {
      throw new Error(`Счёт с ID "${account.id}" уже существует.`);
    }
    this.accounts.push(account);
    this.save();
  }

  /**
   * Создаёт новый счёт с гарантированно уникальным ID и сохраняет его.
   */
  public createAccount(name: string): IAccount {
    const existingIds = new Set(this.accounts.map((acc) => acc.id));
    const uniqueId = generateUniqueId('acc', existingIds);
    const newAccount = new Account(name, uniqueId);
    this.accounts.push(newAccount);
    this.save();
    return newAccount;
  }

  /**
   * Переименовывает существующий счёт по его ID.
   */
  public renameAccount(accountId: string, newName: string): boolean {
    const account = this.getAccountById(accountId);
    if (!account) {
      return false;
    }
    account.name = newName.trim();
    this.save();
    return true;
  }

  /**
   * Удаляет счёт по ID вместе со всеми его транзакциями.
   */
  public removeAccount(accountId: string): boolean {
    const index = this.accounts.findIndex((acc) => acc.id === accountId);
    if (index === -1) {
      return false;
    }

    const account = this.accounts[index];
    account.clearTransactions();
    this.accounts.splice(index, 1);
    this.save();
    return true;
  }

  /**
   * Вычисляет общую статистику по всем счетам и транзакциям.
   */
  public getGlobalSummary(): ISummary {
    const allTransactions: ITransaction[] = [];
    for (const acc of this.accounts) {
      allTransactions.push(...acc.getTransactions());
    }
    return Account.computeSummaryFromTransactions(allTransactions);
  }

  /**
   * Сохраняет текущее состояние счетов в JSON-хранилище (если подключено).
   */
  public save(): void {
    if (this.storageService) {
      this.storageService.saveAccounts(this.accounts);
    }
  }

  /**
   * Сбрасывает счета к демонстрационному набору.
   */
  public resetToDemoAccounts(): void {
    this.accounts = createDemoAccounts();
    this.save();
  }
}
