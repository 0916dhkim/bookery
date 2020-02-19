import { Serializer } from "./serializable";
import { immerable } from "immer";

export class Book {
  [immerable] = true;

  constructor(
    readonly id: number,
    readonly title: string,
    readonly author: string,
    readonly isbn?: string
  ) {}
}

export class BookSerializer implements Serializer<Book> {
  public serialize(target: Book): string {
    return JSON.stringify({
      id: target.id,
      title: target.title,
      author: target.author,
      isbn: target.isbn
    });
  }

  public deserialize(serializedString: string): Book {
    const parsedJson = JSON.parse(serializedString);
    return new Book(
      parsedJson.id,
      parsedJson.title,
      parsedJson.author,
      parsedJson.isbn
    );
  }
}
