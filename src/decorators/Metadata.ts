import 'reflect-metadata';

export function Metadata(key: string, value: unknown): PropertyDecorator {
  return function (target: object, propertyKey: string | symbol): void {
    Reflect.defineMetadata(key, value, target, propertyKey);
  };
}
