import { Account } from '../classes/Account';
import { Transaction } from '../classes/Transaction';
import { TransactionType } from '../types';

/**
 * Создаёт набор предзаполненных демонстрационных счетов с реалистичными транзакциями.
 */
export function createDemoAccounts(): Account[] {
  const mainCard = new Account('Основная карта (Т-Банк)', 'acc-main-01');
  mainCard.addTransaction(
    new Transaction(
      145000,
      TransactionType.INCOME,
      '2026-10-05',
      'Зарплата за первую половину месяца и премия',
      'Зарплата',
      'tx-demo-101'
    )
  );
  mainCard.addTransaction(
    new Transaction(
      8450.5,
      TransactionType.EXPENSE,
      '2026-10-07',
      'Закупка продуктов на неделю в ВкусВилл',
      'Продукты и супермаркеты',
      'tx-demo-102'
    )
  );
  mainCard.addTransaction(
    new Transaction(
      42000,
      TransactionType.EXPENSE,
      '2026-10-10',
      'Оплата аренды квартиры и коммунальных услуг',
      'Жильё и ЖКХ',
      'tx-demo-103'
    )
  );
  mainCard.addTransaction(
    new Transaction(
      25000,
      TransactionType.INCOME,
      '2026-10-14',
      'Разработка веб-компонента на TypeScript',
      'Фриланс / Подработка',
      'tx-demo-104'
    )
  );
  mainCard.addTransaction(
    new Transaction(
      3200,
      TransactionType.EXPENSE,
      '2026-10-16',
      'Ужин с друзьями в пиццерии',
      'Кафе и рестораны',
      'tx-demo-105'
    )
  );

  const savingsAccount = new Account('Накопительный счёт', 'acc-save-02');
  savingsAccount.addTransaction(
    new Transaction(
      250000,
      TransactionType.INCOME,
      '2026-09-01',
      'Пополнение финансовой подушки безопасности',
      'Инвестиции и вклады',
      'tx-demo-201'
    )
  );
  savingsAccount.addTransaction(
    new Transaction(
      3750,
      TransactionType.INCOME,
      '2026-10-01',
      'Начисление процентов на остаток по счёту',
      'Инвестиции и вклады',
      'tx-demo-202'
    )
  );

  const travelAccount = new Account('Бюджет на отпуск', 'acc-trvl-03');
  travelAccount.addTransaction(
    new Transaction(
      90000,
      TransactionType.INCOME,
      '2026-10-02',
      'Перевод средств на предстоящую поездку',
      'Подарки и переводы',
      'tx-demo-301'
    )
  );
  travelAccount.addTransaction(
    new Transaction(
      34800,
      TransactionType.EXPENSE,
      '2026-10-12',
      'Покупка авиабилетов туда-обратно',
      'Транспорт и такси',
      'tx-demo-302'
    )
  );

  return [mainCard, savingsAccount, travelAccount];
}
