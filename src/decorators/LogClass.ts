export function LogClass<T extends { new (...args: any[]): object }>(
  constructor: T
): T {
  const className = constructor.name;
  const Wrapped = class extends constructor {
    constructor(...args: any[]) {
      console.log(
        `Создан экземпляр класса ${className} с аргументами: ${JSON.stringify(args)}`
      );
      super(...args);
    }
  };
  Object.defineProperty(Wrapped, 'name', { value: className });
  return Wrapped;
}
