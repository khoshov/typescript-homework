import chalk from 'chalk';
import { IAccount, ISummary, ITransaction } from '../interfaces';
import { TRANSACTION_TYPE_LABELS, TransactionType } from '../types';

/**
 * Форматирует денежную сумму в рублях (например: 125 000,00 ₽).
 */
export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} ₽`;
}

/**
 * Форматирует сумму с цветовым выделением (зелёный для дохода/плюса, красный для расхода/минуса).
 */
export function formatSignedCurrency(
  amount: number,
  type?: TransactionType
): string {
  if (type === TransactionType.INCOME) {
    return chalk.greenBright(`+${formatCurrency(amount)}`);
  }
  if (type === TransactionType.EXPENSE) {
    return chalk.redBright(`-${formatCurrency(amount)}`);
  }
  if (amount > 0) {
    return chalk.greenBright(`+${formatCurrency(amount)}`);
  }
  if (amount < 0) {
    return chalk.redBright(`-${formatCurrency(Math.abs(amount))}`);
  }
  return chalk.gray(formatCurrency(0));
}

/**
 * Форматирует баланс счёта с цветом в зависимости от знака.
 */
export function formatBalance(balance: number): string {
  if (balance > 0) {
    return chalk.bold.greenBright(formatCurrency(balance));
  }
  if (balance < 0) {
    return chalk.bold.redBright(formatCurrency(balance));
  }
  return chalk.bold.yellow(formatCurrency(0));
}

/**
 * Рисует красивый заголовок экрана в рамке.
 */
export function renderHeader(title: string, subtitle?: string): string {
  const width = 76;
  const topBorder = chalk.cyan('╔' + '═'.repeat(width) + '╗');
  const bottomBorder = chalk.cyan('╚' + '═'.repeat(width) + '╝');

  const padLine = (text: string, plainLength: number): string => {
    const padding = Math.max(0, width - plainLength - 2);
    return (
      chalk.cyan('║ ') +
      text +
      ' '.repeat(padding) +
      chalk.cyan(' ║')
    );
  };

  const lines: string[] = [topBorder, padLine(chalk.bold.white(title), title.length)];

  if (subtitle) {
    lines.push(padLine(chalk.gray(subtitle), subtitle.length));
  }

  lines.push(bottomBorder);
  return lines.join('\n');
}

/**
 * Строит визуальную полосу прогресса (например, для доли категории или соотношения доход/расход).
 */
export function renderProgressBar(
  percentage: number,
  barWidth: number = 20,
  colorFn: (str: string) => string = chalk.cyan
): string {
  const clamped = Math.max(0, Math.min(100, percentage));
  const filledCount = Math.round((clamped / 100) * barWidth);
  const emptyCount = Math.max(0, barWidth - filledCount);
  const filled = colorFn('█'.repeat(filledCount));
  const empty = chalk.gray('░'.repeat(emptyCount));
  return `${filled}${empty} ${clamped.toFixed(1)}%`;
}

/**
 * Выравнивает строку с учётом ANSI-кодов цвета.
 */
function padAnsi(text: string, visibleLength: number, targetWidth: number, align: 'left' | 'right' = 'left'): string {
  const padSize = Math.max(0, targetWidth - visibleLength);
  const spaces = ' '.repeat(padSize);
  return align === 'right' ? spaces + text : text + spaces;
}

/**
 * Обрезает строку до максимальной длины с многоточием.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 1) + '…';
}

/**
 * Отрисовывает сводную таблицу счетов для главного меню.
 */
export function renderAccountsTable(accounts: readonly IAccount[]): string {
  if (accounts.length === 0) {
    return chalk.yellow('  У вас пока нет ни одного бюджетного счёта. Создайте первый счёт в меню ниже!');
  }

  const colId = 15;
  const colName = 24;
  const colBalance = 16;
  const colTxCount = 12;

  const separator = chalk.gray(
    `  ┌─${'─'.repeat(colId)}─┬─${'─'.repeat(colName)}─┬─${'─'.repeat(colBalance)}─┬─${'─'.repeat(colTxCount)}─┐`
  );
  const midSeparator = chalk.gray(
    `  ├─${'─'.repeat(colId)}─┼─${'─'.repeat(colName)}─┼─${'─'.repeat(colBalance)}─┼─${'─'.repeat(colTxCount)}─┤`
  );
  const bottomSeparator = chalk.gray(
    `  └─${'─'.repeat(colId)}─┴─${'─'.repeat(colName)}─┴─${'─'.repeat(colBalance)}─┴─${'─'.repeat(colTxCount)}─┘`
  );

  const hId = 'ID счёта';
  const hName = 'Название счёта';
  const hBalance = 'Баланс';
  const hTx = 'Транзакций';

  const headerRow =
    chalk.gray('  │ ') +
    padAnsi(chalk.bold.cyan(hId), hId.length, colId) +
    chalk.gray(' │ ') +
    padAnsi(chalk.bold.cyan(hName), hName.length, colName) +
    chalk.gray(' │ ') +
    padAnsi(chalk.bold.cyan(hBalance), hBalance.length, colBalance, 'right') +
    chalk.gray(' │ ') +
    padAnsi(chalk.bold.cyan(hTx), hTx.length, colTxCount, 'right') +
    chalk.gray(' │');

  const rows = accounts.map((acc) => {
    const idStr = truncateText(acc.id, colId);
    const nameStr = truncateText(acc.name, colName);
    const plainBalance = formatCurrency(acc.balance);
    const coloredBalance = formatBalance(acc.balance);
    const txCountStr = String(acc.getTransactions().length);

    return (
      chalk.gray('  │ ') +
      padAnsi(chalk.dim(idStr), idStr.length, colId) +
      chalk.gray(' │ ') +
      padAnsi(chalk.white(nameStr), nameStr.length, colName) +
      chalk.gray(' │ ') +
      padAnsi(coloredBalance, plainBalance.length, colBalance, 'right') +
      chalk.gray(' │ ') +
      padAnsi(chalk.cyan(txCountStr), txCountStr.length, colTxCount, 'right') +
      chalk.gray(' │')
    );
  });

  return [separator, headerRow, midSeparator, ...rows, bottomSeparator].join('\n');
}

/**
 * Отрисовывает таблицу транзакций выбранного счёта.
 */
export function renderTransactionsTable(transactions: readonly ITransaction[]): string {
  if (transactions.length === 0) {
    return chalk.yellow('  Транзакции по данному счёту отсутствуют.');
  }

  const colDate = 10;
  const colType = 8;
  const colCategory = 20;
  const colAmount = 16;
  const colDesc = 24;

  const top = chalk.gray(
    `  ┌─${'─'.repeat(colDate)}─┬─${'─'.repeat(colType)}─┬─${'─'.repeat(colCategory)}─┬─${'─'.repeat(colAmount)}─┬─${'─'.repeat(colDesc)}─┐`
  );
  const mid = chalk.gray(
    `  ├─${'─'.repeat(colDate)}─┼─${'─'.repeat(colType)}─┼─${'─'.repeat(colCategory)}─┼─${'─'.repeat(colAmount)}─┼─${'─'.repeat(colDesc)}─┤`
  );
  const bottom = chalk.gray(
    `  └─${'─'.repeat(colDate)}─┴─${'─'.repeat(colType)}─┴─${'─'.repeat(colCategory)}─┴─${'─'.repeat(colAmount)}─┴─${'─'.repeat(colDesc)}─┘`
  );

  const hDate = 'Дата';
  const hType = 'Тип';
  const hCat = 'Категория';
  const hAmt = 'Сумма';
  const hDesc = 'Описание';

  const headerRow =
    chalk.gray('  │ ') +
    padAnsi(chalk.bold.cyan(hDate), hDate.length, colDate) +
    chalk.gray(' │ ') +
    padAnsi(chalk.bold.cyan(hType), hType.length, colType) +
    chalk.gray(' │ ') +
    padAnsi(chalk.bold.cyan(hCat), hCat.length, colCategory) +
    chalk.gray(' │ ') +
    padAnsi(chalk.bold.cyan(hAmt), hAmt.length, colAmount, 'right') +
    chalk.gray(' │ ') +
    padAnsi(chalk.bold.cyan(hDesc), hDesc.length, colDesc) +
    chalk.gray(' │');

  const rows = transactions.map((tx) => {
    const dateStr = truncateText(tx.date, colDate);
    const typeLabel = TRANSACTION_TYPE_LABELS[tx.type];
    const coloredType =
      tx.type === TransactionType.INCOME
        ? chalk.green(typeLabel)
        : chalk.red(typeLabel);
    const catStr = truncateText(tx.category, colCategory);
    const sign = tx.type === TransactionType.INCOME ? '+' : '-';
    const plainAmount = `${sign}${formatCurrency(tx.amount)}`;
    const coloredAmount = formatSignedCurrency(tx.amount, tx.type);
    const descStr = truncateText(tx.description, colDesc);

    return (
      chalk.gray('  │ ') +
      padAnsi(chalk.white(dateStr), dateStr.length, colDate) +
      chalk.gray(' │ ') +
      padAnsi(coloredType, typeLabel.length, colType) +
      chalk.gray(' │ ') +
      padAnsi(chalk.cyan(catStr), catStr.length, colCategory) +
      chalk.gray(' │ ') +
      padAnsi(coloredAmount, plainAmount.length, colAmount, 'right') +
      chalk.gray(' │ ') +
      padAnsi(chalk.gray(descStr), descStr.length, colDesc) +
      chalk.gray(' │')
    );
  });

  return [top, headerRow, mid, ...rows, bottom].join('\n');
}

/**
 * Отрисовывает блок подробной статистики по счёту или всем счетам.
 */
export function renderDetailedSummary(title: string, summary: ISummary): string {
  const lines: string[] = [];
  lines.push(chalk.bold.underline.cyan(`\n  📊 ${title}`));
  lines.push(`  • Текущий баланс:      ${formatBalance(summary.balance)}`);
  lines.push(
    `  • Всего доходов:       ${chalk.greenBright('+' + formatCurrency(summary.totalIncome))} (${summary.incomeCount} шт., средн.: ${formatCurrency(summary.averageIncome)})`
  );
  lines.push(
    `  • Всего расходов:      ${chalk.redBright('-' + formatCurrency(summary.totalExpense))} (${summary.expenseCount} шт., средн.: ${formatCurrency(summary.averageExpense)})`
  );
  lines.push(`  • Всего транзакций:    ${chalk.bold.white(String(summary.transactionsCount))}`);

  const totalVolume = summary.totalIncome + summary.totalExpense;
  if (totalVolume > 0) {
    const incomeShare = (summary.totalIncome / totalVolume) * 100;
    const expenseShare = (summary.totalExpense / totalVolume) * 100;
    lines.push('');
    lines.push(chalk.bold('  Соотношение доходов и расходов:'));
    lines.push(
      `    Доходы:  ${renderProgressBar(incomeShare, 24, chalk.greenBright)}`
    );
    lines.push(
      `    Расходы: ${renderProgressBar(expenseShare, 24, chalk.redBright)}`
    );
  }

  if (summary.categoryBreakdown.length > 0) {
    const incomeCats = summary.categoryBreakdown.filter(
      (c) => c.type === TransactionType.INCOME
    );
    const expenseCats = summary.categoryBreakdown.filter(
      (c) => c.type === TransactionType.EXPENSE
    );

    if (expenseCats.length > 0) {
      lines.push('');
      lines.push(chalk.bold.redBright('  Структура расходов по категориям:'));
      for (const item of expenseCats) {
        const catLabel = truncateText(item.category, 24).padEnd(24, ' ');
        const bar = renderProgressBar(item.percentage, 16, chalk.red);
        lines.push(
          `    ${chalk.white(catLabel)} ${bar.padEnd(26, ' ')} ${chalk.redBright('-' + formatCurrency(item.totalAmount))} (${item.count} оп.)`
        );
      }
    }

    if (incomeCats.length > 0) {
      lines.push('');
      lines.push(chalk.bold.greenBright('  Структура доходов по категориям:'));
      for (const item of incomeCats) {
        const catLabel = truncateText(item.category, 24).padEnd(24, ' ');
        const bar = renderProgressBar(item.percentage, 16, chalk.green);
        lines.push(
          `    ${chalk.white(catLabel)} ${bar.padEnd(26, ' ')} ${chalk.greenBright('+' + formatCurrency(item.totalAmount))} (${item.count} оп.)`
        );
      }
    }
  }

  return lines.join('\n');
}

/**
 * Экранирует поле для корректной записи в CSV-файл по стандарту RFC 4180.
 */
export function escapeCsvField(value: string | number): string {
  const str = String(value);
  if (/[",;\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
