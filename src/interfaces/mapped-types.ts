import { ITransaction } from './ITransaction';

/**
 * 1. Условный тип TransactionFieldType<TField>:
 * возвращает тип значения поля ITransaction[TField],
 * а если TField не является ключом ITransaction — возвращает never.
 */
export type TransactionFieldType<TField> = TField extends keyof ITransaction
  ? ITransaction[TField]
  : never;

/**
 * 2. Mapped type OptionalTransaction<TFields>:
 * делает указанные поля TFields опциональными (?), а остальные — обязательными.
 */
export type OptionalTransaction<TFields extends keyof ITransaction> = {
  [K in Exclude<keyof ITransaction, TFields>]-?: ITransaction[K];
} & {
  [K in TFields]?: ITransaction[K];
};

/**
 * 3. Mapped type ReadonlyTransactionFields<TFields>:
 * делает указанные поля TFields доступными только для чтения (readonly), остальные — без изменений.
 */
export type ReadonlyTransactionFields<TFields extends keyof ITransaction> = {
  readonly [K in TFields]: ITransaction[K];
} & {
  [K in Exclude<keyof ITransaction, TFields>]: ITransaction[K];
};

/**
 * 4. Условный тип IsIncome<T>:
 * возвращает true, если T расширяет { type: 'income' }, иначе — false.
 */
export type IsIncome<T> = T extends { type: 'income' } ? true : false;

// Примеры производных типов
export type AmountType = TransactionFieldType<'amount'>; // number
export type UnknownType = TransactionFieldType<'unknown'>; // never

export type TransactionWithOptionalDescAndDate = OptionalTransaction<
  'description' | 'date' | 'toString'
>;
export type TransactionReadonlyIdAndType = ReadonlyTransactionFields<
  'id' | 'type'
>;

export type CheckIncome1 = IsIncome<{ type: 'income'; amount: number }>; // true
export type CheckIncome2 = IsIncome<{ type: 'expense'; amount: number }>; // false
export type CheckIncome3 = IsIncome<ITransaction>; // false
