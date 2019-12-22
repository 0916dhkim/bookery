export interface Serializer<T> {
  serialize(target: T): string;
  deserialize(serializedString: string): T;
}
