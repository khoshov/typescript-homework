export function LogMethod(
  _target: object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalMethod = descriptor.value;
  const methodName = String(propertyKey);

  descriptor.value = function (...args: unknown[]): unknown {
    console.log(
      `Вызов метода ${methodName} с аргументами: ${JSON.stringify(args)}`
    );
    const result = originalMethod.apply(this, args);
    console.log(`Метод ${methodName} вернул: ${JSON.stringify(result)}`);
    return result;
  };

  return descriptor;
}
