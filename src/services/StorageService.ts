import * as fs from 'fs';
import * as path from 'path';
import { Account } from '../classes/Account';
import { IAccount } from '../interfaces';
import { SerializedAccount } from '../types';
import { createDemoAccounts } from './demoData';

/**
 * Сервис сохранения и загрузки состояния счетов в локальный JSON-файл.
 */
export class StorageService {
  private readonly filePath: string;

  constructor(customFilePath?: string) {
    this.filePath =
      customFilePath ?? path.resolve(process.cwd(), 'data', 'accounts.json');
  }

  /**
   * Загружает счета из JSON-файла. Если файл ещё не создан, инициализирует демо-счета.
   */
  public loadAccounts(): Account[] {
    try {
      if (!fs.existsSync(this.filePath)) {
        const demoAccounts = createDemoAccounts();
        this.saveAccounts(demoAccounts);
        return demoAccounts;
      }

      const raw = fs.readFileSync(this.filePath, 'utf-8');
      const parsed: unknown = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        return createDemoAccounts();
      }

      return (parsed as SerializedAccount[]).map((item) =>
        Account.fromJSON(item)
      );
    } catch {
      return createDemoAccounts();
    }
  }

  /**
   * Сохраняет список счетов в JSON-файл.
   */
  public saveAccounts(accounts: readonly IAccount[]): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const serialized: SerializedAccount[] = accounts.map((acc) => acc.toJSON());
    fs.writeFileSync(
      this.filePath,
      JSON.stringify(serialized, null, 2) + '\n',
      'utf-8'
    );
  }
}
