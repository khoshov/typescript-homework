/**
 * Результат валидации для библиотеки inquirer:
 * true — если ввод корректен, либо строка с понятным описанием ошибки.
 */
export type ValidationResult = boolean | string;

/**
 * Преобразует строку суммы (с поддержкой точки и запятой) в число.
 */
export function parseAmountInput(rawInput: string | number): number {
  if (typeof rawInput === 'number') {
    return rawInput;
  }
  const normalized = rawInput.trim().replace(/\s+/g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return NaN;
  }
  return Number(normalized);
}

/**
 * Валидация суммы транзакции.
 */
export function validateAmount(input: string): ValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return 'Пожалуйста, введите сумму транзакции.';
  }

  const parsed = parseAmountInput(trimmed);
  if (Number.isNaN(parsed)) {
    return 'Некорректный формат суммы. Введите положительное число (например: 1500 или 499.90).';
  }

  if (parsed <= 0) {
    return 'Сумма транзакции должна быть строго больше нуля.';
  }

  if (parsed > 1_000_000_000) {
    return 'Сумма слишком велика (максимум 1 000 000 000).';
  }

  return true;
}

/**
 * Валидация необязательной суммы (для фильтрации транзакций).
 */
export function validateOptionalAmount(input: string): ValidationResult {
  if (!input.trim()) {
    return true;
  }
  return validateAmount(input);
}

/**
 * Проверка корректности календарной даты в формате ГГГГ-ММ-ДД.
 */
export function validateDate(input: string): ValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return 'Пожалуйста, введите дату транзакции в формате ГГГГ-ММ-ДД.';
  }

  const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = dateRegex.exec(trimmed);
  if (!match) {
    return 'Неверный формат даты. Используйте формат ГГГГ-ММ-ДД (например, 2026-10-19).';
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < 1970 || year > 2100) {
    return 'Год должен быть в диапазоне от 1970 до 2100.';
  }

  if (month < 1 || month > 12) {
    return 'Месяц должен быть от 01 до 12.';
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return `Некорректный день для указанного месяца (максимум дней: ${daysInMonth}).`;
  }

  return true;
}

/**
 * Валидация необязательной даты (для фильтрации по периоду).
 */
export function validateOptionalDate(input: string): ValidationResult {
  if (!input.trim()) {
    return true;
  }
  return validateDate(input);
}

/**
 * Валидация названия счёта.
 */
export function validateAccountName(
  input: string,
  isDuplicate?: (name: string) => boolean
): ValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return 'Название счёта не может быть пустым.';
  }
  if (trimmed.length < 2) {
    return 'Название счёта должно содержать минимум 2 символа.';
  }
  if (trimmed.length > 50) {
    return 'Название счёта не должно превышать 50 символов.';
  }
  if (isDuplicate && isDuplicate(trimmed)) {
    return `Счёт с названием «${trimmed}» уже существует. Выберите другое название.`;
  }
  return true;
}

/**
 * Валидация описания или пользовательской категории транзакции.
 */
export function validateNonEmptyText(
  input: string,
  fieldName: string = 'Поле',
  maxLength: number = 100
): ValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return `${fieldName} не может быть пустым.`;
  }
  if (trimmed.length < 2) {
    return `${fieldName} должно содержать минимум 2 символа.`;
  }
  if (trimmed.length > maxLength) {
    return `${fieldName} не должно превышать ${maxLength} символов.`;
  }
  return true;
}

/**
 * Валидация имени файла (или относительного пути) для экспорта в CSV.
 */
export function validateCsvFilename(input: string): ValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return 'Имя файла не может быть пустым.';
  }

  const invalidCharsRegex = /[<>:"|?*\x00-\x1F]/;
  if (invalidCharsRegex.test(trimmed)) {
    return 'Имя файла содержит недопустимые символы (< > : " | ? *).';
  }

  if (trimmed === '.' || trimmed === '..' || trimmed.includes('..')) {
    return 'Некорректное имя файла.';
  }

  return true;
}

/**
 * Возвращает текущую дату в формате ГГГГ-ММ-ДД.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
