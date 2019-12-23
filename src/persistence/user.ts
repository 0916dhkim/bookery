import { Serializer } from "./serializable";

export class User {
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
    // TODO: Implement.
    return "";
  }

  public deserialize(serializedString: string): User {
    // TODO: Implement.
    return undefined;
  }
}
