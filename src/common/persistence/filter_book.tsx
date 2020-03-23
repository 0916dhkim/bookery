import { Book } from "./book";
import { FunctionalIterable } from "./functional_iterable";
import { matchPattern } from "./match_pattern";
import { AppData } from "./app_data";

export function filterBook(appData: AppData, query: string): Iterable<Book> {
  const filtered = new FunctionalIterable(appData.books.values()).filter(book =>
    matchPattern(query, ["title", "author", "isbn"], book)
  );
  return Array.from(filtered).reverse();
}
