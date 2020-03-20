import { Filter } from "./filter";
import { Book } from "./book";
import { FunctionalIterable } from "./functional_iterable";
import { matchPattern } from "./match_pattern";

export class BookFilter implements Filter<Book> {
  private books: Array<Book>;
  constructor(data: Iterable<Book>) {
    this.books = Array.from(data);
    this.books.sort((a, b) => b.id - a.id);
  }

  filter(query: string): Iterable<Book> {
    return new FunctionalIterable(this.books).filter(book =>
      matchPattern(query, ["title", "author", "isbn"], book)
    );
  }
}
