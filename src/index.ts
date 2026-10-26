import { Account } from './classes/Account';
import { AccountManager } from './classes/AccountManager';
import { Transaction } from './classes/Transaction';

async function main(): Promise<void> {
  const personalAccount = new Account('Личный бюджет');
  personalAccount.addTransaction(
    new Transaction(1000, 'income', '2023-01-01T00:00:00Z', 'Зарплата')
  );
  personalAccount.addTransaction(
    new Transaction(
      200,
      'expense',
      '2023-01-05T00:00:00Z',
      'Продукты, супермаркет "ВкусВилл"'
    )
  );
  personalAccount.addTransaction(
    new Transaction(
      150,
      'expense',
      '2023-01-09T00:00:00Z',
      'Коммунальные услуги'
    )
  );

  const manager = new AccountManager();
  manager.addAccount(personalAccount);

  console.log(String(personalAccount));
  console.log(`Общий баланс всех бюджетов: ${manager.balance} ₽`);

  try {
    await personalAccount.exportTransactionsToCSV('main_account.csv');
    console.log('\nТранзакции успешно экспортированы в файл main_account.csv');
  } catch (error: unknown) {
    console.log('В процессе записи произошла ошибка', (error as Error).message);
  }
}

main();
