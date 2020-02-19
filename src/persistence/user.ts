import { Serializer } from "./serializable";
import { immerable } from "immer";

export class User {
  [immerable] = true;

  constructor(
    readonly id: number,
    readonly lastName: string,
    readonly firstName: string,
    readonly note?: string
  ) {}
}

export class UserSerializer implements Serializer<User> {
  public serialize(target: User): string {
    return JSON.stringify({
      id: target.id,
      lastName: target.lastName,
      firstName: target.firstName,
      note: target.note
    });
  }

  public deserialize(serializedString: string): User {
    const parsedJson = JSON.parse(serializedString);
    return new User(
      parsedJson.id,
      parsedJson.lastName,
      parsedJson.firstName,
      parsedJson.note
    );
  }
}
