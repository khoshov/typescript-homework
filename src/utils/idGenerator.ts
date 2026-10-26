import { randomUUID } from 'crypto';

/**
 * Генерирует уникальный идентификатор заданного префикса.
 * Гарантирует отсутствие коллизий с переданным набором существующих ID.
 */
export function generateUniqueId(
  prefix: 'acc' | 'tx' = 'acc',
  existingIds: ReadonlySet<string> = new Set()
): string {
  let candidateId: string;
  do {
    const shortUuid = randomUUID().split('-')[0];
    const timestampPart = Date.now().toString(36).slice(-4);
    candidateId = `${prefix}-${timestampPart}-${shortUuid}`;
  } while (existingIds.has(candidateId));

  return candidateId;
}
