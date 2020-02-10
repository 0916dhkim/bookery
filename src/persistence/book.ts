import { Serializer } from "./serializable";
import { Queryable } from "./queryable";

export class Book implements Queryable {
  private _title: string;
  get title(): string {
    return this._title;
  }
  set title(newTitle: string) {
    this._title = newTitle;
  }

  private _author: string;
  get author(): string {
    return this._author;
  }
  set author(newAuthor: string) {
    this._author = newAuthor;
  }

  private _isbn?: string;
  get isbn(): string | undefined {
    return this._isbn;
  }
  set isbn(newIsbn: string | undefined) {
    this._isbn = newIsbn;
  }

  constructor(
    readonly id: number,
    title: string,
    author: string,
    isbn?: string
  ) {
    this.title = title;
    this.author = author;
    this.isbn = isbn;
  }

  query(queryString: string): number {
    // TODO: Implement.
    return -1;
  }
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
