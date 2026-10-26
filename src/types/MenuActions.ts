import { TransactionType } from './TransactionType';

/**
 * Действия главного меню приложения.
 */
export enum MainMenuAction {
  CREATE_ACCOUNT = 'CREATE_ACCOUNT',
  GLOBAL_STATS = 'GLOBAL_STATS',
  RESET_DEMO_DATA = 'RESET_DEMO_DATA',
  EXIT = 'EXIT',
}

/**
 * Действия меню выбранного счёта.
 */
export enum AccountMenuAction {
  ADD_TRANSACTION = 'ADD_TRANSACTION',
  EDIT_TRANSACTION = 'EDIT_TRANSACTION',
  REMOVE_TRANSACTION = 'REMOVE_TRANSACTION',
  FILTER_TRANSACTIONS = 'FILTER_TRANSACTIONS',
  ACCOUNT_STATS = 'ACCOUNT_STATS',
  EXPORT_CSV = 'EXPORT_CSV',
  RENAME_ACCOUNT = 'RENAME_ACCOUNT',
  REMOVE_ACCOUNT = 'REMOVE_ACCOUNT',
  BACK_TO_MAIN = 'BACK_TO_MAIN',
}

/**
 * Пользовательский тип для выбора в главном меню (действие или ID выбранного счёта).
 */
export type MainMenuChoiceValue = MainMenuAction | `account:${string}`;

/**
 * Параметры фильтрации и поиска транзакций.
 */
export type TransactionFilter = {
  readonly type?: TransactionType | 'ALL';
  readonly category?: string;
  readonly searchQuery?: string;
  readonly dateFrom?: string;
  readonly dateTo?: string;
  readonly minAmount?: number;
  readonly maxAmount?: number;
};

/**
 * Поля транзакции, доступные для редактирования.
 */
export type EditableTransactionFields = {
  amount?: number;
  type?: TransactionType;
  date?: string;
  description?: string;
  category?: string;
};

/**
 * Сериализованное представление транзакции для JSON-хранилища.
 */
export type SerializedTransaction = {
  readonly id: string;
  readonly amount: number;
  readonly type: TransactionType;
  readonly date: string;
  readonly description: string;
  readonly category: string;
};

/**
 * Сериализованное представление счёта для JSON-хранилища.
 */
export type SerializedAccount = {
  readonly id: string;
  readonly name: string;
  readonly transactions: SerializedTransaction[];
};
