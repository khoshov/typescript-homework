import { IAccount } from './IAccount';
import { ISummary } from './ISummary';

/**
 * Интерфейс менеджера управления бюджетными счетами.
 */
export interface IAccountManager {
  /**
   * Возвращает список всех счетов.
   */
  getAccounts(): readonly IAccount[];

  /**
   * Находит счёт по его уникальному ID.
   */
  getAccountById(id: string): IAccount | undefined;

  /**
   * Добавляет готовый экземпляр счёта в менеджер.
   */
  addAccount(account: IAccount): void;

  /**
   * Создаёт новый счёт с уникальным ID и указанным именем.
   */
  createAccount(name: string): IAccount;

  /**
   * Переименовывает счёт по ID.
   */
  renameAccount(accountId: string, newName: string): boolean;

  /**
   * Удаляет счёт по ID вместе со всеми его транзакциями.
   */
  removeAccount(accountId: string): boolean;

  /**
   * Проверяет, существует ли уже счёт с таким названием (без учёта регистра).
   */
  hasAccountWithName(name: string, excludeAccountId?: string): boolean;

  /**
   * Возвращает агрегированную статистику по всем счетам пользователя.
   */
  getGlobalSummary(): ISummary;

  /**
   * Сохраняет текущее состояние всех счетов в постоянное хранилище.
   */
  save(): void;

  /**
   * Восстанавливает демонстрационные счета.
   */
  resetToDemoAccounts(): void;
}
