export interface Identifiable {
  id: number;
}

export interface Describable {
  describe(): string;
}

function isDescribable(item: unknown): item is Describable {
  return (
    typeof item === 'object' &&
    item !== null &&
    'describe' in item &&
    typeof (item as Describable).describe === 'function'
  );
}

export class GenericStorage<T extends Identifiable> {
  private items: T[] = [];

  public add(item: T): void {
    this.items.push(item);
  }

  public removeById(id: number): boolean {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }
    this.items.splice(index, 1);
    return true;
  }

  public getById(id: number): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  public getAll(): T[] {
    return [...this.items];
  }

  public describeAll(): void {
    for (const item of this.items) {
      if (isDescribable(item)) {
        console.log(item.describe());
      } else {
        console.log(`Элемент id: ${item.id} не содержит описания.`);
      }
    }
  }
}

export class Product implements Identifiable, Describable {
  public id: number;
  public name: string;
  public price: number;

  constructor(id: number, name: string, price: number) {
    this.id = id;
    this.name = name;
    this.price = price;
  }

  public describe(): string {
    return `Product #${this.id}: ${this.name}, price: $${this.price}`;
  }
}

const productStorage = new GenericStorage<Product>();

productStorage.add(new Product(1, 'Ноутбук', 150000));
productStorage.add(new Product(2, 'Смартфон', 80000));
productStorage.add(new Product(3, 'Планшет', 50000));
productStorage.add({ id: 4 } as Product);

console.log('--- Описание всех продуктов ---');
productStorage.describeAll();
