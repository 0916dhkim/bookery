import { Serializer } from "./serializable";
import { Book } from "./book";
import { User } from "./user";
import { View } from "./view";

export class AppData {
  private books: Book[];
  private users: User[];
  private views: View[];
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
