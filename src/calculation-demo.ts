const income: number = 120000;
const expenses: number = 65000;
const savings: number = 25000;

const netIncome: number = income - expenses;
const remaining: number = netIncome - savings;

console.log(`Общий доход за месяц (income): ${income} ₽`);
console.log(`Общий расход за месяц (expenses): ${expenses} ₽`);
console.log(`Отложенные сбережения (savings): ${savings} ₽`);
console.log(`Чистый доход (netIncome): ${netIncome} ₽`);
console.log(`Остаток после сбережений (remaining): ${remaining} ₽`);
