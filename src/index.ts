import { IAccount, IAccountManager, ISummary, ITransaction } from './types';

const accountManager: IAccountManager & { accounts: IAccount[] } = {
  accounts: [],
  addAccount(account: IAccount): void {
    this.accounts.push(account);
  },
  removeAccountById(accountId: number): boolean {
    const index = this.accounts.findIndex((acc) => acc.id === accountId);
    if (index === -1) {
      return false;
    }
    this.accounts.splice(index, 1);
    return true;
  },
  getAccounts(): IAccount[] {
    return [...this.accounts];
  },
  getAccountById(id: number): IAccount | undefined {
    return this.accounts.find((acc) => acc.id === id);
  },
  getSummary(accountId: number): ISummary {
    const foundAccount = this.getAccountById(accountId);
    if (!foundAccount) {
      return { income: 0, expenses: 0, balance: 0 };
    }

    const transactions = foundAccount.getTransactions();
    let income = 0;
    let expenses = 0;

    for (const tx of transactions) {
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        expenses += tx.amount;
      }
    }

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  },
};

const account: IAccount & { transactions: ITransaction[] } = {
  id: 1,
  name: 'Личный бюджет',
  transactions: [],
  addTransaction(transaction: ITransaction): void {
    this.transactions.push(transaction);
  },
  removeTransactionById(transactionId: number): boolean {
    const index = this.transactions.findIndex((tx) => tx.id === transactionId);
    if (index === -1) {
      return false;
    }
    this.transactions.splice(index, 1);
    return true;
  },
  getTransactions(): ITransaction[] {
    return [...this.transactions];
  },
};

account.addTransaction({
  id: 1,
  amount: 1000,
  type: 'income',
  date: '2023-01-01T00:00:00Z',
  description: 'Зарплата за январь',
});

account.addTransaction({
  id: 2,
  amount: 200,
  type: 'expense',
  date: '2023-01-05T00:00:00Z',
  description: 'Покупка продуктов',
});

account.addTransaction({
  id: 3,
  amount: 150,
  type: 'expense',
  date: '2023-01-10T00:00:00Z',
  description: 'Оплата коммунальных услуг',
});

accountManager.addAccount(account);
console.log('Список всех бюджетов:', accountManager.getAccounts());
console.log('Сводная информация о бюджете:', accountManager.getSummary(1));
accountManager.removeAccountById(account.id);
console.log('Список всех бюджетов после удаления:', accountManager.getAccounts());
