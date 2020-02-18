import { Serializer } from "./serializable";
import { immerable } from "immer";

export class User {
  [immerable] = true;

  private _lastName: string;
  get lastName(): string {
    return this._lastName;
  }
  set lastName(newLastName: string) {
    this._lastName = newLastName;
  }

  private _firstName: string;
  get firstName(): string {
    return this._firstName;
  }
  set firstName(newFirstName: string) {
    this._firstName = newFirstName;
  }

  private _note?: string;
  get note(): string | undefined {
    return this._note;
  }
  set note(newNote: string | undefined) {
    this._note = newNote;
  }

  constructor(
    readonly id: number,
    lastName: string,
    firstName: string,
    note?: string
  ) {
    this.lastName = lastName;
    this.firstName = firstName;
    this.note = note;
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
