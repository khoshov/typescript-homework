import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { Account, AccountManager, Transaction } from '../classes';
import { StorageService } from '../services';
import { TransactionType } from '../types';
import {
  validateAccountName,
  validateAmount,
  validateCsvFilename,
  validateDate,
} from '../utils';

function runVerificationSuite(): void {
  console.log('Запуск автоматической проверки модулей и бизнес-логики...\n');

  // 1. Проверка валидаторов
  assert.strictEqual(validateAmount('1500.50'), true);
  assert.strictEqual(validateAmount('250,75'), true);
  assert.strictEqual(typeof validateAmount('-100'), 'string');
  assert.strictEqual(typeof validateAmount('0'), 'string');
  assert.strictEqual(typeof validateAmount('abc'), 'string');

  assert.strictEqual(validateDate('2026-10-19'), true);
  assert.strictEqual(typeof validateDate('2026-02-30'), 'string');
  assert.strictEqual(typeof validateDate('19-10-2026'), 'string');

  assert.strictEqual(validateAccountName('Основной счёт'), true);
  assert.strictEqual(typeof validateAccountName('А'), 'string');
  assert.strictEqual(validateCsvFilename('exports/my-account.csv'), true);
  assert.strictEqual(typeof validateCsvFilename('invalid:name?.csv'), 'string');
  console.log('✔ Валидаторы пользовательского ввода работают корректно.');

  // 2. Проверка класса Transaction
  const tx1 = new Transaction(
    50000,
    TransactionType.INCOME,
    '2026-10-10',
    'Аванс за октябрь',
    'Зарплата'
  );
  assert.strictEqual(tx1.amount, 50000);
  assert.strictEqual(tx1.type, TransactionType.INCOME);
  assert.ok(tx1.id.startsWith('tx-'));

  tx1.update({ amount: 55000, description: 'Аванс за октябрь (индексация)' });
  assert.strictEqual(tx1.amount, 55000);
  assert.strictEqual(tx1.description, 'Аванс за октябрь (индексация)');
  console.log('✔ Класс Transaction (создание, инкапсуляция, обновление, CSV/JSON) работает корректно.');

  // 3. Проверка класса Account
  const account = new Account('Тестовый счёт');
  account.addTransaction(tx1);
  const tx2 = new Transaction(
    15000,
    TransactionType.EXPENSE,
    '2026-10-12',
    'Покупка продуктов, рынок',
    'Продукты и супермаркеты'
  );
  account.addTransaction(tx2);

  assert.strictEqual(account.totalIncome, 55000);
  assert.strictEqual(account.totalExpense, 15000);
  assert.strictEqual(account.balance, 40000);
  assert.strictEqual(account.getTransactions().length, 2);

  // Фильтрация
  const filteredExpense = account.filterTransactions({
    type: TransactionType.EXPENSE,
  });
  assert.strictEqual(filteredExpense.length, 1);
  assert.strictEqual(filteredExpense[0].id, tx2.id);

  // Экспорт в CSV
  const tmpCsvPath = path.resolve(process.cwd(), 'exports', 'test-export.csv');
  const exportedPath = account.exportToCSV(tmpCsvPath);
  assert.strictEqual(exportedPath, tmpCsvPath);
  assert.ok(fs.existsSync(exportedPath));
  const csvContent = fs.readFileSync(exportedPath, 'utf-8');
  assert.ok(csvContent.includes('ID транзакции,Дата,Код типа'));
  assert.ok(csvContent.includes('"Покупка продуктов, рынок"'));
  fs.unlinkSync(exportedPath);

  // Удаление транзакции
  const removedTx = account.removeTransaction(tx2.id);
  assert.strictEqual(removedTx, true);
  assert.strictEqual(account.balance, 55000);
  console.log('✔ Класс Account (баланс, транзакции, фильтрация, статистика, CSV-экспорт) работает корректно.');

  // 4. Проверка AccountManager и StorageService
  const tmpStoragePath = path.resolve(
    process.cwd(),
    'data',
    'test-accounts.json'
  );
  if (fs.existsSync(tmpStoragePath)) {
    fs.unlinkSync(tmpStoragePath);
  }

  const storage = new StorageService(tmpStoragePath);
  const manager = new AccountManager(storage, true);
  const initialCount = manager.getAccounts().length;
  assert.ok(initialCount >= 3); // Предзаполненные демо-счета

  const createdAcc = manager.createAccount('Копилка на ноутбук');
  assert.strictEqual(manager.getAccounts().length, initialCount + 1);
  assert.strictEqual(manager.getAccountById(createdAcc.id)?.name, 'Копилка на ноутбук');

  manager.renameAccount(createdAcc.id, 'Копилка на MacBook');
  assert.strictEqual(manager.getAccountById(createdAcc.id)?.name, 'Копилка на MacBook');

  createdAcc.addTransaction(
    new Transaction(10000, TransactionType.INCOME, '2026-10-18', 'Взнос', 'Накопления')
  );
  const removedAcc = manager.removeAccount(createdAcc.id);
  assert.strictEqual(removedAcc, true);
  assert.strictEqual(createdAcc.getTransactions().length, 0);
  assert.strictEqual(manager.getAccountById(createdAcc.id), undefined);

  if (fs.existsSync(tmpStoragePath)) {
    fs.unlinkSync(tmpStoragePath);
  }

  // Инициализация основного файла data/accounts.json с демо-данными
  const prodStorage = new StorageService();
  prodStorage.loadAccounts();

  console.log('✔ Классы AccountManager и StorageService работают корректно.');
  console.log('\n🎉 Все проверки успешно пройдены!');
}

runVerificationSuite();
