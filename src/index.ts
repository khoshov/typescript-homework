import { formatCurrency } from 'formatCurrency';
import { Account } from './classes/Account';
import { AccountManager } from './classes/AccountManager';
import { Transaction } from './classes/Transaction';

const personalAccount = new Account('Личный бюджет');
personalAccount.addTransaction(
  new Transaction(1000, 'income', '2023-01-01T00:00:00Z', 'Зарплата')
);
personalAccount.addTransaction(
  new Transaction(200, 'expense', '2023-01-05T00:00:00Z', 'Продукты')
);
personalAccount.addTransaction(
  new Transaction(150, 'expense', '2023-01-10T00:00:00Z', 'Коммунальные услуги')
);

const manager = new AccountManager();
manager.addAccount(personalAccount);

console.log(String(personalAccount));
console.log(`Общий баланс всех бюджетов: ${formatCurrency(manager.balance)}`);

console.log('\nТранзакции личного бюджета:');
personalAccount.getTransactions().forEach((t) => console.log(t.toString()));
