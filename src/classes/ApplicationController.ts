import chalk from 'chalk';
import inquirer from 'inquirer';
import { IAccount, IAccountManager } from '../interfaces';
import { StorageService } from '../services';
import {
  AccountMenuAction,
  DEFAULT_CATEGORIES,
  MainMenuAction,
  MainMenuChoiceValue,
  TRANSACTION_TYPE_LABELS,
  TransactionFilter,
  TransactionType,
} from '../types';
import {
  formatBalance,
  formatCurrency,
  formatSignedCurrency,
  generateUniqueId,
  getTodayDateString,
  parseAmountInput,
  renderAccountsTable,
  renderDetailedSummary,
  renderHeader,
  renderTransactionsTable,
  validateAccountName,
  validateAmount,
  validateCsvFilename,
  validateDate,
  validateNonEmptyText,
  validateOptionalAmount,
  validateOptionalDate,
} from '../utils';
import { AccountManager } from './AccountManager';
import { Transaction } from './Transaction';

const CUSTOM_CATEGORY_VALUE = '__CUSTOM_CATEGORY__';
const CANCEL_SELECTION_VALUE = '__CANCEL__';

type MenuChoice<TValue> =
  | { readonly name: string; readonly value: TValue }
  | InstanceType<typeof inquirer.Separator>;

/**
 * Интерактивный CLI-контроллер приложения для управления личными финансами.
 * Координирует работу пользовательского интерфейса на базе inquirer и бизнес-логики AccountManager.
 */
export class ApplicationController {
  public readonly accountManager: IAccountManager;

  constructor(accountManager?: IAccountManager) {
    this.accountManager =
      accountManager ?? new AccountManager(new StorageService(), true);
  }

  /**
   * Запускает главный цикл интерактивного приложения.
   */
  public async start(): Promise<void> {
    let isRunning = true;

    while (isRunning) {
      console.clear();
      this.printMainScreenHeader();

      const accounts = this.accountManager.getAccounts();
      const choices: MenuChoice<MainMenuChoiceValue>[] = [];

      if (accounts.length > 0) {
        choices.push(
          new inquirer.Separator(chalk.bold.cyan('─── Доступные бюджетные счета ───'))
        );

        for (const acc of accounts) {
          choices.push({
            name: `💼 ${acc.toString()}`,
            value: `account:${acc.id}`,
          });
        }
      }

      choices.push(
        new inquirer.Separator(chalk.bold.cyan('─── Управление и действия ───')),
        {
          name: chalk.greenBright('➕ Создать новый счёт'),
          value: MainMenuAction.CREATE_ACCOUNT,
        },
        {
          name: chalk.cyanBright('📊 Сводная статистика по всем счетам'),
          value: MainMenuAction.GLOBAL_STATS,
        },
        {
          name: chalk.yellow('🔄 Восстановить демонстрационные счета'),
          value: MainMenuAction.RESET_DEMO_DATA,
        },
        new inquirer.Separator(),
        {
          name: chalk.redBright('🚪 Выход из приложения'),
          value: MainMenuAction.EXIT,
        }
      );

      try {
        const { selectedOption } = await inquirer.prompt<{
          selectedOption: MainMenuChoiceValue;
        }>([
          {
            type: 'list',
            name: 'selectedOption',
            message: 'Выберите счёт для просмотра или действие:',
            pageSize: 15,
            choices,
          },
        ]);

        if (selectedOption === MainMenuAction.EXIT) {
          isRunning = false;
          console.clear();
          console.log(
            renderHeader(
              'До свидания! Ваши финансовые данные сохранены.',
              'Спасибо за использование CLI-контроллера личных финансов.'
            )
          );
          break;
        }

        if (selectedOption === MainMenuAction.CREATE_ACCOUNT) {
          await this.createAccount();
        } else if (selectedOption === MainMenuAction.GLOBAL_STATS) {
          await this.showGlobalStatistics();
        } else if (selectedOption === MainMenuAction.RESET_DEMO_DATA) {
          await this.handleResetDemoData();
        } else if (selectedOption.startsWith('account:')) {
          const accountId = selectedOption.replace('account:', '');
          const account = this.accountManager.getAccountById(accountId);
          if (account) {
            await this.watchAccount(account);
          } else {
            await this.pauseWithMessage(
              chalk.red('Ошибка: выбранный счёт не найден.')
            );
          }
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Неизвестная ошибка';
        await this.pauseWithMessage(
          chalk.red(`Произошла ошибка в главном меню: ${message}`)
        );
      }
    }
  }

  /**
   * Отображает шапку главного меню, общую сводку и таблицу счетов.
   */
  private printMainScreenHeader(): void {
    const accounts = this.accountManager.getAccounts();
    const globalSummary = this.accountManager.getGlobalSummary();

    console.log(
      renderHeader(
        '💰 УПРАВЛЕНИЕ ЛИЧНЫМИ ФИНАНСАМИ — ГЛАВНОЕ МЕНЮ',
        'Интерактивный CLI-контроллер бюджетных счетов и транзакций (TypeScript)'
      )
    );
    console.log('');
    console.log(renderAccountsTable(accounts));
    console.log('');
    console.log(
      `  ${chalk.bold('Общий баланс всех счетов:')} ${formatBalance(globalSummary.balance)}   ` +
        `${chalk.gray('|')}   ${chalk.green('Доходы: +' + formatCurrency(globalSummary.totalIncome))}   ` +
        `${chalk.gray('|')}   ${chalk.red('Расходы: -' + formatCurrency(globalSummary.totalExpense))}`
    );
    console.log('');
  }

  /**
   * Сценарий создания нового счёта с уникальным ID и опциональным начальным балансом.
   */
  public async createAccount(): Promise<void> {
    console.clear();
    console.log(
      renderHeader(
        '➕ СОЗДАНИЕ НОВОГО БЮДЖЕТНОГО СЧЁТА',
        'Укажите название счёта и при желании начальный остаток'
      )
    );
    console.log('');

    try {
      const answers = await inquirer.prompt<{
        accountName: string;
        withInitialDeposit: boolean;
        initialAmount?: string;
      }>([
        {
          type: 'input',
          name: 'accountName',
          message: 'Введите название нового счёта:',
          validate: (input: string) =>
            validateAccountName(input, (name) =>
              this.accountManager.hasAccountWithName(name)
            ),
        },
        {
          type: 'confirm',
          name: 'withInitialDeposit',
          message: 'Хотите сразу внести начальный баланс (первую доходную транзакцию)?',
          default: false,
        },
        {
          type: 'input',
          name: 'initialAmount',
          message: 'Введите сумму начального баланса (₽):',
          when: (currentAnswers) => Boolean(currentAnswers.withInitialDeposit),
          validate: validateAmount,
        },
      ]);

      const newAccount = this.accountManager.createAccount(
        answers.accountName.trim()
      );

      if (answers.withInitialDeposit && answers.initialAmount) {
        const amount = parseAmountInput(answers.initialAmount);
        const existingTxIds = new Set(
          newAccount.getTransactions().map((t) => t.id)
        );
        const initialTransaction = new Transaction(
          amount,
          TransactionType.INCOME,
          getTodayDateString(),
          'Начальный остаток при открытии счёта',
          'Прочие доходы',
          generateUniqueId('tx', existingTxIds)
        );
        newAccount.addTransaction(initialTransaction);
        this.accountManager.save();
      }

      console.log('');
      console.log(
        chalk.greenBright(
          `✅ Счёт «${newAccount.name}» успешно создан! Уникальный ID: ${chalk.bold(newAccount.id)}`
        )
      );

      await this.pauseWithMessage();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Неизвестная ошибка';
      await this.pauseWithMessage(
        chalk.red(`Не удалось создать счёт: ${message}`)
      );
    }
  }

  /**
   * Сценарий просмотра выбранного счёта и управления его транзакциями.
   */
  public async watchAccount(account: IAccount): Promise<void> {
    let stayInAccount = true;

    while (stayInAccount) {
      console.clear();
      this.printAccountScreenHeader(account);

      const hasTransactions = account.getTransactions().length > 0;

      const choices: MenuChoice<AccountMenuAction>[] = [
        new inquirer.Separator(chalk.bold.cyan('─── Операции с транзакциями ───')),
        {
          name: chalk.greenBright('➕ Добавить новую транзакцию'),
          value: AccountMenuAction.ADD_TRANSACTION,
        },
      ];

      if (hasTransactions) {
        choices.push(
          {
            name: chalk.blueBright('✏️  Редактировать транзакцию'),
            value: AccountMenuAction.EDIT_TRANSACTION,
          },
          {
            name: chalk.yellow('🗑️  Удалить транзакцию'),
            value: AccountMenuAction.REMOVE_TRANSACTION,
          },
          {
            name: chalk.magentaBright('🔍 Поиск и фильтрация транзакций'),
            value: AccountMenuAction.FILTER_TRANSACTIONS,
          },
          {
            name: chalk.cyanBright('📊 Подробная статистика по счёту'),
            value: AccountMenuAction.ACCOUNT_STATS,
          }
        );
      }

      choices.push(
        new inquirer.Separator(chalk.bold.cyan('─── Управление счётом ───')),
        {
          name: chalk.white('📁 Экспортировать транзакции счёта в CSV-файл'),
          value: AccountMenuAction.EXPORT_CSV,
        },
        {
          name: chalk.white('🏷️  Переименовать счёт'),
          value: AccountMenuAction.RENAME_ACCOUNT,
        },
        {
          name: chalk.redBright('❌ Удалить счёт (со всеми транзакциями)'),
          value: AccountMenuAction.REMOVE_ACCOUNT,
        },
        new inquirer.Separator(),
        {
          name: chalk.gray('⬅️  Вернуться в главное меню'),
          value: AccountMenuAction.BACK_TO_MAIN,
        }
      );

      const { action } = await inquirer.prompt<{ action: AccountMenuAction }>([
        {
          type: 'list',
          name: 'action',
          message: `Действие для счёта «${account.name}»:`,
          pageSize: 14,
          choices,
        },
      ]);

      switch (action) {
        case AccountMenuAction.ADD_TRANSACTION:
          await this.addTransaction(account);
          break;
        case AccountMenuAction.EDIT_TRANSACTION:
          await this.editTransaction(account);
          break;
        case AccountMenuAction.REMOVE_TRANSACTION:
          await this.removeTransaction(account);
          break;
        case AccountMenuAction.FILTER_TRANSACTIONS:
          await this.filterAndSearchTransactions(account);
          break;
        case AccountMenuAction.ACCOUNT_STATS:
          await this.showAccountStatistics(account);
          break;
        case AccountMenuAction.EXPORT_CSV:
          await this.exportTransactionsToCSV(account);
          break;
        case AccountMenuAction.RENAME_ACCOUNT:
          await this.renameAccount(account);
          break;
        case AccountMenuAction.REMOVE_ACCOUNT: {
          const wasDeleted = await this.removeAccount(account);
          if (wasDeleted) {
            stayInAccount = false;
          }
          break;
        }
        case AccountMenuAction.BACK_TO_MAIN:
          stayInAccount = false;
          break;
      }
    }
  }

  /**
   * Отрисовывает заголовок выбранного счёта, его баланс и список транзакций.
   */
  private printAccountScreenHeader(account: IAccount): void {
    const transactions = account.getTransactions();

    console.log(
      renderHeader(
        `💼 СЧЁТ: ${account.name}`,
        `Уникальный ID счёта: ${account.id} | Всего операций: ${transactions.length}`
      )
    );
    console.log('');
    console.log(
      `  ${chalk.bold('Текущий баланс:')} ${formatBalance(account.balance)}   ` +
        `${chalk.gray('|')}   ${chalk.greenBright('Доходы: +' + formatCurrency(account.totalIncome))}   ` +
        `${chalk.gray('|')}   ${chalk.redBright('Расходы: -' + formatCurrency(account.totalExpense))}`
    );
    console.log('');
    console.log(chalk.bold.cyan('  Список транзакций счёта:'));
    console.log(renderTransactionsTable(transactions));
    console.log('');
  }

  /**
   * Сценарий интерактивного добавления новой транзакции с валидацией ввода.
   */
  public async addTransaction(account: IAccount): Promise<void> {
    console.clear();
    console.log(
      renderHeader(
        `➕ ДОБАВЛЕНИЕ ТРАНЗАКЦИИ — ${account.name}`,
        `Текущий баланс: ${formatCurrency(account.balance)}`
      )
    );
    console.log('');

    try {
      const baseAnswers = await inquirer.prompt<{
        type: TransactionType;
        amount: string;
        categorySelection: string;
        customCategory?: string;
        date: string;
        description: string;
      }>([
        {
          type: 'list',
          name: 'type',
          message: 'Выберите тип транзакции:',
          choices: [
            {
              name: chalk.greenBright('📈 Доход (пополнение счёта)'),
              value: TransactionType.INCOME,
            },
            {
              name: chalk.redBright('📉 Расход (списание со счёта)'),
              value: TransactionType.EXPENSE,
            },
          ],
        },
        {
          type: 'input',
          name: 'amount',
          message: 'Введите сумму транзакции (в рублях, например 1500 или 349.50):',
          validate: validateAmount,
        },
        {
          type: 'list',
          name: 'categorySelection',
          message: 'Выберите категорию транзакции:',
          choices: (answers) => {
            const presetCategories = DEFAULT_CATEGORIES[answers.type] ?? [];
            return [
              ...presetCategories.map((cat) => ({ name: cat, value: cat })),
              new inquirer.Separator(),
              {
                name: chalk.cyan('✏️  Ввести собственную категорию...'),
                value: CUSTOM_CATEGORY_VALUE,
              },
            ];
          },
        },
        {
          type: 'input',
          name: 'customCategory',
          message: 'Введите название вашей категории:',
          when: (answers) => answers.categorySelection === CUSTOM_CATEGORY_VALUE,
          validate: (input: string) =>
            validateNonEmptyText(input, 'Название категории', 40),
        },
        {
          type: 'input',
          name: 'date',
          message: 'Введите дату транзакции в формате ГГГГ-ММ-ДД:',
          default: getTodayDateString(),
          validate: validateDate,
        },
        {
          type: 'input',
          name: 'description',
          message: 'Введите описание (комментарий) транзакции:',
          validate: (input: string) =>
            validateNonEmptyText(input, 'Описание транзакции', 100),
        },
      ]);

      const amount = parseAmountInput(baseAnswers.amount);
      const category =
        baseAnswers.categorySelection === CUSTOM_CATEGORY_VALUE
          ? (baseAnswers.customCategory ?? 'Общее').trim()
          : baseAnswers.categorySelection;

      const existingIds = new Set(
        account.getTransactions().map((tx) => tx.id)
      );
      const uniqueTxId = generateUniqueId('tx', existingIds);

      const transaction = new Transaction(
        amount,
        baseAnswers.type,
        baseAnswers.date.trim(),
        baseAnswers.description.trim(),
        category,
        uniqueTxId
      );

      account.addTransaction(transaction);
      this.accountManager.save();

      console.log('');
      console.log(
        chalk.greenBright(
          `✅ Транзакция успешно добавлена: ${transaction.toString()}`
        )
      );
      await this.pauseWithMessage();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Неизвестная ошибка';
      await this.pauseWithMessage(
        chalk.red(`Ошибка при добавлении транзакции: ${message}`)
      );
    }
  }

  /**
   * Сценарий редактирования существующей транзакции (дополнительная функция).
   */
  public async editTransaction(account: IAccount): Promise<void> {
    console.clear();
    console.log(
      renderHeader(
        `✏️  РЕДАКТИРОВАНИЕ ТРАНЗАКЦИИ — ${account.name}`,
        'Выберите транзакцию из списка и укажите обновлённые значения'
      )
    );
    console.log('');

    const transactions = account.getTransactions();
    if (transactions.length === 0) {
      await this.pauseWithMessage(
        chalk.yellow('На этом счёте пока нет транзакций для редактирования.')
      );
      return;
    }

    try {
      const { transactionId } = await inquirer.prompt<{ transactionId: string }>([
        {
          type: 'list',
          name: 'transactionId',
          message: 'Выберите транзакцию для редактирования:',
          pageSize: 12,
          choices: [
            ...transactions.map((tx) => ({
              name: tx.toString(),
              value: tx.id,
            })),
            new inquirer.Separator(),
            {
              name: chalk.gray('⬅️  Отмена (вернуться к счёту)'),
              value: CANCEL_SELECTION_VALUE,
            },
          ],
        },
      ]);

      if (transactionId === CANCEL_SELECTION_VALUE) {
        return;
      }

      const targetTx = account.getTransactionById(transactionId);
      if (!targetTx) {
        await this.pauseWithMessage(chalk.red('Транзакция не найдена.'));
        return;
      }

      const updated = await inquirer.prompt<{
        type: TransactionType;
        amount: string;
        category: string;
        date: string;
        description: string;
      }>([
        {
          type: 'list',
          name: 'type',
          message: 'Тип транзакции:',
          default: targetTx.type,
          choices: [
            {
              name: chalk.greenBright('📈 Доход'),
              value: TransactionType.INCOME,
            },
            {
              name: chalk.redBright('📉 Расход'),
              value: TransactionType.EXPENSE,
            },
          ],
        },
        {
          type: 'input',
          name: 'amount',
          message: 'Сумма транзакции (₽):',
          default: String(targetTx.amount),
          validate: validateAmount,
        },
        {
          type: 'input',
          name: 'category',
          message: 'Категория транзакции:',
          default: targetTx.category,
          validate: (input: string) =>
            validateNonEmptyText(input, 'Категория', 40),
        },
        {
          type: 'input',
          name: 'date',
          message: 'Дата транзакции (ГГГГ-ММ-ДД):',
          default: targetTx.date,
          validate: validateDate,
        },
        {
          type: 'input',
          name: 'description',
          message: 'Описание транзакции:',
          default: targetTx.description,
          validate: (input: string) =>
            validateNonEmptyText(input, 'Описание транзакции', 100),
        },
      ]);

      account.editTransaction(targetTx.id, {
        type: updated.type,
        amount: parseAmountInput(updated.amount),
        category: updated.category.trim(),
        date: updated.date.trim(),
        description: updated.description.trim(),
      });
      this.accountManager.save();

      console.log('');
      console.log(
        chalk.greenBright(`✅ Транзакция успешно обновлена: ${targetTx.toString()}`)
      );
      await this.pauseWithMessage();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Неизвестная ошибка';
      await this.pauseWithMessage(
        chalk.red(`Ошибка при редактировании транзакции: ${message}`)
      );
    }
  }

  /**
   * Сценарий удаления транзакции с выбором из списка и подтверждением.
   */
  public async removeTransaction(account: IAccount): Promise<void> {
    console.clear();
    console.log(
      renderHeader(
        `🗑️  УДАЛЕНИЕ ТРАНЗАКЦИИ — ${account.name}`,
        'Выберите транзакцию и подтвердите её удаление'
      )
    );
    console.log('');

    const transactions = account.getTransactions();
    if (transactions.length === 0) {
      await this.pauseWithMessage(
        chalk.yellow('На данном счёте нет транзакций для удаления.')
      );
      return;
    }

    try {
      const { transactionId } = await inquirer.prompt<{ transactionId: string }>([
        {
          type: 'list',
          name: 'transactionId',
          message: 'Выберите транзакцию, которую хотите удалить:',
          pageSize: 12,
          choices: [
            ...transactions.map((tx) => ({
              name: tx.toString(),
              value: tx.id,
            })),
            new inquirer.Separator(),
            {
              name: chalk.gray('⬅️  Отмена (вернуться к счёту)'),
              value: CANCEL_SELECTION_VALUE,
            },
          ],
        },
      ]);

      if (transactionId === CANCEL_SELECTION_VALUE) {
        return;
      }

      const targetTx = account.getTransactionById(transactionId);
      if (!targetTx) {
        await this.pauseWithMessage(chalk.red('Транзакция не найдена.'));
        return;
      }

      const { confirmed } = await inquirer.prompt<{ confirmed: boolean }>([
        {
          type: 'confirm',
          name: 'confirmed',
          message: `Вы действительно хотите удалить транзакцию «${targetTx.description}» на сумму ${formatSignedCurrency(targetTx.amount, targetTx.type)}?`,
          default: false,
        },
      ]);

      if (!confirmed) {
        await this.pauseWithMessage(chalk.yellow('Удаление транзакции отменено.'));
        return;
      }

      const removed = account.removeTransaction(transactionId);
      if (removed) {
        this.accountManager.save();
        console.log('');
        console.log(chalk.greenBright('✅ Транзакция успешно удалена.'));
      } else {
        console.log(chalk.red('Не удалось удалить транзакцию.'));
      }

      await this.pauseWithMessage();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Неизвестная ошибка';
      await this.pauseWithMessage(
        chalk.red(`Ошибка при удалении транзакции: ${message}`)
      );
    }
  }

  /**
   * Сценарий переименования выбранного счёта (дополнительная функция).
   */
  public async renameAccount(account: IAccount): Promise<void> {
    console.clear();
    console.log(
      renderHeader(
        `🏷️  ПЕРЕИМЕНОВАНИЕ СЧЁТА — ${account.name}`,
        `ID счёта: ${account.id}`
      )
    );
    console.log('');

    try {
      const { newName } = await inquirer.prompt<{ newName: string }>([
        {
          type: 'input',
          name: 'newName',
          message: 'Введите новое название счёта:',
          default: account.name,
          validate: (input: string) =>
            validateAccountName(input, (candidate) =>
              this.accountManager.hasAccountWithName(candidate, account.id)
            ),
        },
      ]);

      const oldName = account.name;
      this.accountManager.renameAccount(account.id, newName);

      console.log('');
      console.log(
        chalk.greenBright(
          `✅ Счёт «${oldName}» успешно переименован в «${account.name}».`
        )
      );
      await this.pauseWithMessage();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Неизвестная ошибка';
      await this.pauseWithMessage(
        chalk.red(`Ошибка при переименовании счёта: ${message}`)
      );
    }
  }

  /**
   * Сценарий удаления счёта с подтверждением и удалением всех его транзакций.
   * Возвращает true, если счёт был удалён.
   */
  public async removeAccount(account: IAccount): Promise<boolean> {
    console.clear();
    console.log(
      renderHeader(
        `❌ УДАЛЕНИЕ СЧЁТА — ${account.name}`,
        `Внимание! Вместе со счётом будут удалены все его транзакции (${account.getTransactions().length} шт.)`
      )
    );
    console.log('');

    try {
      const { confirmed } = await inquirer.prompt<{ confirmed: boolean }>([
        {
          type: 'confirm',
          name: 'confirmed',
          message: chalk.redBright(
            `Вы уверены, что хотите безвозвратно удалить счёт «${account.name}» [ID: ${account.id}] и все его транзакции (${account.getTransactions().length} шт.)?`
          ),
          default: false,
        },
      ]);

      if (!confirmed) {
        await this.pauseWithMessage(chalk.yellow('Удаление счёта отменено.'));
        return false;
      }

      const accountName = account.name;
      const deleted = this.accountManager.removeAccount(account.id);

      if (deleted) {
        console.log('');
        console.log(
          chalk.greenBright(
            `✅ Счёт «${accountName}» и все связанные с ним транзакции успешно удалены.`
          )
        );
        await this.pauseWithMessage();
        return true;
      }

      await this.pauseWithMessage(chalk.red('Не удалось удалить счёт.'));
      return false;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Неизвестная ошибка';
      await this.pauseWithMessage(
        chalk.red(`Ошибка при удалении счёта: ${message}`)
      );
      return false;
    }
  }

  /**
   * Сценарий экспорта транзакций счёта в CSV-файл.
   */
  public async exportTransactionsToCSV(account: IAccount): Promise<void> {
    console.clear();
    console.log(
      renderHeader(
        `📁 ЭКСПОРТ ДАННЫХ СЧЁТА В CSV — ${account.name}`,
        `Будет экспортировано транзакций: ${account.getTransactions().length}`
      )
    );
    console.log('');

    try {
      const defaultFileName = `exports/${account.id}-transactions.csv`;
      const { filename } = await inquirer.prompt<{ filename: string }>([
        {
          type: 'input',
          name: 'filename',
          message:
            'Введите имя CSV-файла (или относительный путь, расширение .csv добавится автоматически):',
          default: defaultFileName,
          validate: validateCsvFilename,
        },
      ]);

      const fullPath = account.exportToCSV(filename);

      console.log('');
      console.log(
        chalk.greenBright(
          `✅ Данные счёта «${account.name}» успешно экспортированы в CSV-файл!`
        )
      );
      console.log(`📄 Путь к файлу: ${chalk.bold.underline.cyan(fullPath)}`);
      await this.pauseWithMessage();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Неизвестная ошибка';
      await this.pauseWithMessage(
        chalk.red(`Ошибка при экспорте в CSV: ${message}`)
      );
    }
  }

  /**
   * Сценарий поиска и фильтрации транзакций по типу, тексту, дате и сумме (дополнительная функция).
   */
  public async filterAndSearchTransactions(account: IAccount): Promise<void> {
    console.clear();
    console.log(
      renderHeader(
        `🔍 ПОИСК И ФИЛЬТРАЦИЯ ТРАНЗАКЦИЙ — ${account.name}`,
        'Оставьте необязательные поля пустыми (Enter), чтобы не ограничивать фильтр'
      )
    );
    console.log('');

    try {
      const filterAnswers = await inquirer.prompt<{
        type: TransactionType | 'ALL';
        searchQuery: string;
        dateFrom: string;
        dateTo: string;
        minAmount: string;
        maxAmount: string;
      }>([
        {
          type: 'list',
          name: 'type',
          message: 'Фильтр по типу транзакций:',
          choices: [
            { name: 'Все транзакции (доходы и расходы)', value: 'ALL' },
            {
              name: `Только ${TRANSACTION_TYPE_LABELS[TransactionType.INCOME]}`,
              value: TransactionType.INCOME,
            },
            {
              name: `Только ${TRANSACTION_TYPE_LABELS[TransactionType.EXPENSE]}`,
              value: TransactionType.EXPENSE,
            },
          ],
        },
        {
          type: 'input',
          name: 'searchQuery',
          message: 'Поиск по описанию или категории (Enter — пропустить):',
        },
        {
          type: 'input',
          name: 'dateFrom',
          message: 'Дата С в формате ГГГГ-ММ-ДД (Enter — без ограничения):',
          validate: validateOptionalDate,
        },
        {
          type: 'input',
          name: 'dateTo',
          message: 'Дата ПО в формате ГГГГ-ММ-ДД (Enter — без ограничения):',
          validate: validateOptionalDate,
        },
        {
          type: 'input',
          name: 'minAmount',
          message: 'Минимальная сумма транзакции (Enter — без ограничения):',
          validate: validateOptionalAmount,
        },
        {
          type: 'input',
          name: 'maxAmount',
          message: 'Максимальная сумма транзакции (Enter — без ограничения):',
          validate: validateOptionalAmount,
        },
      ]);

      const filter: TransactionFilter = {
        type: filterAnswers.type,
        searchQuery: filterAnswers.searchQuery.trim() || undefined,
        dateFrom: filterAnswers.dateFrom.trim() || undefined,
        dateTo: filterAnswers.dateTo.trim() || undefined,
        minAmount: filterAnswers.minAmount.trim()
          ? parseAmountInput(filterAnswers.minAmount)
          : undefined,
        maxAmount: filterAnswers.maxAmount.trim()
          ? parseAmountInput(filterAnswers.maxAmount)
          : undefined,
      };

      const filtered = account.filterTransactions(filter);

      console.clear();
      console.log(
        renderHeader(
          `🔍 РЕЗУЛЬТАТЫ ПОИСКА — ${account.name}`,
          `Найдено транзакций: ${filtered.length} из ${account.getTransactions().length}`
        )
      );
      console.log('');
      console.log(renderTransactionsTable(filtered));
      console.log('');

      await this.pauseWithMessage();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Неизвестная ошибка';
      await this.pauseWithMessage(
        chalk.red(`Ошибка при фильтрации транзакций: ${message}`)
      );
    }
  }

  /**
   * Отображает подробную статистику и аналитику по конкретному счёту.
   */
  public async showAccountStatistics(account: IAccount): Promise<void> {
    console.clear();
    console.log(
      renderHeader(
        `📊 РАСШИРЕННАЯ СТАТИСТИКА СЧЁТА — ${account.name}`,
        `ID счёта: ${account.id}`
      )
    );
    console.log(
      renderDetailedSummary(`Аналитика по счёту «${account.name}»`, account.getSummary())
    );
    console.log('');
    await this.pauseWithMessage();
  }

  /**
   * Отображает глобальную аналитику по всем счетам пользователя.
   */
  public async showGlobalStatistics(): Promise<void> {
    console.clear();
    console.log(
      renderHeader(
        '📊 СВОДНАЯ АНАЛИТИКА ПО ВСЕМ БЮДЖЕТНЫМ СЧЕТАМ',
        `Всего активных счетов: ${this.accountManager.getAccounts().length}`
      )
    );
    console.log(
      renderDetailedSummary(
        'Консолидированная статистика по всем счетам',
        this.accountManager.getGlobalSummary()
      )
    );
    console.log('');
    await this.pauseWithMessage();
  }

  /**
   * Сценарий сброса данных к демонстрационным счетам с подтверждением через inquirer.
   */
  private async handleResetDemoData(): Promise<void> {
    console.clear();
    console.log(
      renderHeader(
        '🔄 ВОССТАНОВЛЕНИЕ ДЕМОНСТРАЦИОННЫХ ДАННЫХ',
        'Текущие счета будут заменены стандартным демонстрационным набором'
      )
    );
    console.log('');

    const { confirmed } = await inquirer.prompt<{ confirmed: boolean }>([
      {
        type: 'confirm',
        name: 'confirmed',
        message:
          'Вы уверены, что хотите сбросить текущие данные и восстановить демо-счета?',
        default: false,
      },
    ]);

    if (!confirmed) {
      await this.pauseWithMessage(chalk.yellow('Сброс данных отменён.'));
      return;
    }

    this.accountManager.resetToDemoAccounts();
    await this.pauseWithMessage(
      chalk.greenBright('✅ Демонстрационные счета и транзакции успешно восстановлены!')
    );
  }

  /**
   * Универсальная пауза с ожиданием подтверждения пользователя через inquirer.
   */
  private async pauseWithMessage(message?: string): Promise<void> {
    if (message) {
      console.log(`\n${message}`);
    }
    console.log('');
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: chalk.gray('Нажмите Enter, чтобы продолжить...'),
      },
    ]);
  }
}
