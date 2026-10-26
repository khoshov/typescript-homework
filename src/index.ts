import chalk from 'chalk';
import { Account, ApplicationController, Transaction } from './classes';
import { TransactionType } from './types';

/**
 * Заполняет контроллер начальными демонстрационными счетами, если хранилище пусто.
 */
export function setInitialState(controller: ApplicationController): void {
  if (controller.accountManager.getAccounts().length > 0) {
    return;
  }

  const personalAccount = new Account('Личный бюджет');
  personalAccount.addTransaction(
    new Transaction(
      1000,
      TransactionType.INCOME,
      '2026-10-01',
      'Зарплата',
      'Зарплата'
    )
  );
  personalAccount.addTransaction(
    new Transaction(
      200,
      TransactionType.EXPENSE,
      '2026-10-05',
      'Продукты',
      'Продукты и супермаркеты'
    )
  );
  personalAccount.addTransaction(
    new Transaction(
      150,
      TransactionType.EXPENSE,
      '2026-10-09',
      'Коммунальные услуги',
      'Жильё и ЖКХ'
    )
  );
  controller.accountManager.addAccount(personalAccount);

  const vacationAccount = new Account('Копилка на отпуск');
  vacationAccount.addTransaction(
    new Transaction(
      500,
      TransactionType.INCOME,
      '2026-10-02',
      'Премия',
      'Зарплата'
    )
  );
  vacationAccount.addTransaction(
    new Transaction(
      600,
      TransactionType.INCOME,
      '2026-10-03',
      'Возврат долга',
      'Подарки и переводы'
    )
  );
  vacationAccount.addTransaction(
    new Transaction(
      300,
      TransactionType.EXPENSE,
      '2026-10-06',
      'Билеты на самолёт',
      'Транспорт и такси'
    )
  );
  vacationAccount.addTransaction(
    new Transaction(
      200,
      TransactionType.EXPENSE,
      '2026-10-10',
      'Номер в отеле',
      'Развлечения и подписки'
    )
  );
  controller.accountManager.addAccount(vacationAccount);
}

/**
 * Точка входа в интерактивное CLI-приложение управления личными финансами.
 */
async function bootstrap(): Promise<void> {
  const controller = new ApplicationController();
  setInitialState(controller);
  await controller.start();
}

bootstrap().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : 'Неизвестная критическая ошибка';
  console.error(chalk.redBright(`\nКритическая ошибка приложения: ${message}`));
  process.exit(1);
});
