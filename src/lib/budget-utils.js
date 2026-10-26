export function formatCurrency(amount, symbol = "₽") {
  return amount.toFixed(2) + " " + symbol;
}

export function parseDate(dateStr) {
  return new Date(dateStr);
}
