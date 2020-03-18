import { Filter } from "./filter";
import { Book } from "./book";
import * as Fuse from "fuse.js";

const bookFuseOptions: Fuse.FuseOptions<Book> = {
  shouldSort: true,
  includeMatches: false,
  includeScore: false,
  keys: ["title", "author", "isbn"]
};

export class BookFilter implements Filter<Book> {
  private books: Array<Book>;
  private fuse: Fuse<Book, Fuse.FuseOptions<Book>>;
  constructor(data: Iterable<Book>) {
    this.books = Array.from(data);
    this.books.sort((a, b) => b.id - a.id);
    this.fuse = new Fuse(this.books, bookFuseOptions);
  }

  filter(query: string): Iterable<Book> {
    if (query === "") {
      return this.books;
    }
    return this.fuse.search(query) as Array<Book>;
  }
}
