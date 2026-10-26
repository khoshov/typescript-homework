/**
 * Перечисление типов транзакций: доход (income) или расход (expense).
 */
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

/**
 * Человекочитаемые названия типов транзакций на русском языке.
 */
export const TRANSACTION_TYPE_LABELS: Readonly<Record<TransactionType, string>> = {
  [TransactionType.INCOME]: 'Доход',
  [TransactionType.EXPENSE]: 'Расход',
};

/**
 * Стандартные категории для доходов и расходов.
 */
export const DEFAULT_CATEGORIES: Readonly<Record<TransactionType, readonly string[]>> = {
  [TransactionType.INCOME]: [
    'Зарплата',
    'Фриланс / Подработка',
    'Инвестиции и вклады',
    'Подарки и переводы',
    'Кэшбэк и бонусы',
    'Прочие доходы',
  ],
  [TransactionType.EXPENSE]: [
    'Продукты и супермаркеты',
    'Жильё и ЖКХ',
    'Транспорт и такси',
    'Кафе и рестораны',
    'Здоровье и спорт',
    'Развлечения и подписки',
    'Одежда и покупки',
    'Образование',
    'Прочие расходы',
  ],
};
