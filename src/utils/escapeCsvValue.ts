export function escapeCsvValue(value: string | number): string {
  const stringValue = String(value);
  if (/[",'\r\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}
