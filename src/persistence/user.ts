import { Serializer } from "./serializable";

export class User {
  private id: number;
  private lastName: string;
  private firstName: string;
  private note: string;
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
