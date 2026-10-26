export function calculateTotal(values: number[]): number {
  let sum: number = 0;
  for (const val of values) {
    sum += val;
  }
  return sum;
}

export function calculateAverage(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return calculateTotal(values) / values.length;
}

export function formatCurrency(amount: number, symbol: string): string {
  return `${amount} ${symbol}`;
}

export function getTopValues(values: number[], count: number): number[] {
  return [...values].sort((a: number, b: number) => b - a).slice(0, count);
}

export function printSummary(values: number[]): void {
  const total: number = calculateTotal(values);
  const average: number = calculateAverage(values);
  console.log(`Всего записей: ${values.length}`);
  console.log(`Сумма: ${total}`);
  console.log(`Среднее: ${average}`);
}

const sampleValues: number[] = [1000, 2000, 3000];
console.log("calculateTotal:", calculateTotal(sampleValues));
console.log("calculateAverage:", calculateAverage(sampleValues));
console.log("calculateAverage (пустой массив):", calculateAverage([]));
console.log("formatCurrency:", formatCurrency(1000, "₽"));
console.log("getTopValues:", getTopValues([100, 500, 200, 800], 2));

console.log("\nВызов printSummary:");
printSummary([100, 500, 1000, 2000, 800]);
