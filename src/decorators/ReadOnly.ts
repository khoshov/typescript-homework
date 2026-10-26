export function ReadOnly(target: object, propertyKey: string | symbol): void {
  const privateStore = new WeakMap<object, unknown>();

  Object.defineProperty(target, propertyKey, {
    get(this: object): unknown {
      return privateStore.get(this);
    },
    set(this: object, newValue: unknown): void {
      if (privateStore.has(this)) {
        console.warn(
          `[ReadOnly] Попытка изменить свойство "${String(propertyKey)}" отклонена: свойство доступно только для чтения.`
        );
        return;
      }
      privateStore.set(this, newValue);
    },
    enumerable: true,
    configurable: false,
  });
}
