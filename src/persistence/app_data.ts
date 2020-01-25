import { Serializer } from "./serializable";
import { Book } from "./book";
import { User } from "./user";
import { View } from "./view";

export class AppData {
  private _books: Book[];
  get books(): Book[] {
    return this._books;
  }

  private _users: User[];
  get users(): User[] {
    return this._users;
  }

  private _views: View[];
  get views(): View[] {
    return this._views;
  }
}

export class AppDataSerializer implements Serializer<AppData> {
  public serialize(target: AppData): string {
    // TODO: Implement.
    return "";
  }

  public deserialize(serializedString: string): AppData {
    // TODO: Implement.
    return undefined;
  }
}
