import { Serializer } from "./serializable";
import produce, { immerable } from "immer";

export class User {
  [immerable] = true;

  constructor(
    readonly id: number,
    readonly lastName: string,
    readonly firstName: string,
    readonly note?: string
  ) {}

  setLastName(lastName: string): User {
    return produce(this, draft => {
      draft.lastName = lastName;
    });
  }

  setFirstName(firstName: string): User {
    return produce(this, draft => {
      draft.firstName = firstName;
    });
  }

  setNote(note?: string): User {
    return produce(this, draft => {
      draft.note = note;
    });
  }

  equals(other: User): boolean {
    return (
      this.id === other.id &&
      this.lastName === other.lastName &&
      this.firstName === other.firstName &&
      this.note === other.note
    );
  }
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
