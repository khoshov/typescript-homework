import { Account } from './classes/Account';
import { AccountManager } from './classes/AccountManager';
import { Transaction } from './classes/Transaction';
import {
  AmountType,
  CheckIncome1,
  CheckIncome2,
  CheckIncome3,
  TransactionReadonlyIdAndType,
  TransactionWithOptionalDescAndDate,
} from './interfaces/mapped-types';

const sampleAmount: AmountType = 2500;
const draftTransaction: TransactionWithOptionalDescAndDate = {
  id: 'draft-1',
  amount: sampleAmount,
  type: 'income',
};

const lockedTransaction: TransactionReadonlyIdAndType = new Transaction(
  1500,
  'income',
  '2023-01-01T00:00:00Z',
  'Зарплата'
);

const isIncomeCheck1: CheckIncome1 = true;
const isIncomeCheck2: CheckIncome2 = false;
const isIncomeCheck3: CheckIncome3 = false;

console.log('Черновик транзакции (OptionalTransaction):', draftTransaction);
console.log('Транзакция с readonly полями:', lockedTransaction.toString());
console.log(
  'Проверка IsIncome:',
  isIncomeCheck1,
  isIncomeCheck2,
  isIncomeCheck3
);

const personalAccount = new Account('Личный бюджет');
personalAccount.addTransaction(
  new Transaction(1000, 'income', '2023-01-01T00:00:00Z', 'Зарплата')
);
personalAccount.addTransaction(
  new Transaction(200, 'expense', '2023-01-05T00:00:00Z', 'Продукты')
);

const manager = new AccountManager();
manager.addAccount(personalAccount);

console.log('\n' + String(personalAccount));
