import { Serializer } from "./serializable";

export class Book {
  private title: string;
  private author: string;
  private isbn: string;
}

export class BookSerializer implements Serializer<Book> {
  public serialize(target: Book): string {
    // TODO: Implement.
    return "";
  }

  public deserialize(serializedString: string): Book {
    // TODO: Implement.
    return undefined;
  }
}
