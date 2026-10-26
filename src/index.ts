import { Account, AccountManager, Transaction } from './classes';

const personalAccount = new Account(1, 'Личный бюджет');
personalAccount.addTransaction(
  new Transaction(1, 1000, 'income', '2023-01-01T00:00:00Z', 'Зарплата')
);
personalAccount.addTransaction(
  new Transaction(2, 200, 'expense', '2023-01-05T00:00:00Z', 'Продукты')
);
personalAccount.addTransaction(
  new Transaction(
    3,
    150,
    'expense',
    '2023-01-10T00:00:00Z',
    'Коммунальные услуги'
  )
);

const manager = new AccountManager();
manager.addAccount(personalAccount);

console.log(String(personalAccount));
console.log(`Общий баланс всех бюджетов: ${manager.balance} ₽`);

console.log('\nТранзакции личного бюджета:');
personalAccount.getTransactions().forEach((t) => console.log(t.toString()));
