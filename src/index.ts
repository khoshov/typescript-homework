import 'reflect-metadata';
import { Account } from './classes/Account';
import { AccountManager } from './classes/AccountManager';
import { Transaction } from './classes/Transaction';

const personalAccount = new Account('Личный бюджет');
const transaction: Transaction = new Transaction(
  1000,
  'income',
  '2023-01-01T00:00:00Z',
  'Зарплата'
);

transaction.update({ amount: 1200 });
console.log('Обновлённая транзакция:');
console.log(transaction.toString());

personalAccount.addTransaction(transaction);
personalAccount.addTransaction(
  new Transaction(200, 'expense', '2023-01-05T00:00:00Z', 'Продукты')
);
personalAccount.addTransaction(
  new Transaction(150, 'expense', '2023-01-09T00:00:00Z', 'Коммунальные услуги')
);

// Попытка изменить свойство id, защищённое декоратором @ReadOnly
const originalId = personalAccount.id;
personalAccount.id = 'custom-hacked-id';
console.log('ID счёта после попытки перезаписи остался прежним:', personalAccount.id === originalId);

const manager = new AccountManager();
manager.addAccount(personalAccount);

console.log('\n' + String(personalAccount));
console.log(`Общий баланс всех бюджетов: ${manager.balance} ₽`);

console.log('\nИнформация о счёте (с чтением метаданных @Metadata):');
console.log(personalAccount.getSummaryString());

console.log('\nТранзакции основного счёта:');
personalAccount.getTransactions().forEach((t) => console.log(t.toString()));
