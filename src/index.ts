import { Account } from './classes/Account';
import { AccountManager } from './classes/AccountManager';
import { Transaction } from './classes/Transaction';
import {
  AccountInfo,
  CategoryLimits,
  TransactionConstructorParams,
  TransactionInstance,
  TransactionPreview,
} from './interfaces/utility-types';

const limits: CategoryLimits = {
  income: 10000,
  expense: 5000,
};

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

personalAccount.update({ name: 'Основной счёт' });
console.log('Обновлённый счёт:');
const accountInfo: AccountInfo = {
  id: personalAccount.id,
  name: personalAccount.name,
};
console.log(accountInfo);

const manager = new AccountManager();
manager.addAccount(personalAccount);

console.log(String(personalAccount));
console.log(`Общий баланс всех бюджетов: ${manager.balance} ₽`);

console.log('\nТранзакции основного счёта:');
personalAccount.getTransactions().forEach((t) => console.log(t.toString()));

console.log('Лимит пополнений:', limits.income);
console.log('Лимит трат:', limits.expense);

const transactionParams: TransactionConstructorParams = [
  500,
  'expense',
  '2023-02-01T00:00:00Z',
  'Покупка',
];
const newTransaction: TransactionInstance = new Transaction(
  ...transactionParams
);
const preview: TransactionPreview = {
  id: newTransaction.id,
  amount: newTransaction.amount,
  type: newTransaction.type,
  date: newTransaction.date,
};
console.log('Превью новой транзакции:', preview);
console.log(newTransaction.toString());
