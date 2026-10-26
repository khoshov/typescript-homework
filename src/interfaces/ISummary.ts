import { TransactionType } from '../types';

/**
 * Статистика по конкретной категории транзакций.
 */
export interface ICategoryBreakdown {
  readonly category: string;
  readonly type: TransactionType;
  readonly totalAmount: number;
  readonly count: number;
  readonly percentage: number;
}

/**
 * Сводная информация (баланс, доходы, расходы) по счёту или всем счетам.
 */
export interface ISummary {
  readonly balance: number;
  readonly totalIncome: number;
  readonly totalExpense: number;
  readonly transactionsCount: number;
  readonly incomeCount: number;
  readonly expenseCount: number;
  readonly averageIncome: number;
  readonly averageExpense: number;
  readonly categoryBreakdown: readonly ICategoryBreakdown[];
}
