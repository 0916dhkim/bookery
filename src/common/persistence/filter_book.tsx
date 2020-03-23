import { Book } from "./book";
import { FunctionalIterable } from "./functional_iterable";
import { matchPattern } from "./match_pattern";
import { AppData } from "./app_data";
import { matchTag } from "./filter_tag";

export function filterBook(appData: AppData, query: string): Iterable<Book> {
  // Separate tag query from regular query.
  const queryWords = query.split(/\s+/);
  const tagQueries: Array<string> = [];
  const regularQueries: Array<string> = [];
  for (const word of queryWords) {
    if (word.startsWith("#")) {
      tagQueries.push(word.slice(1));
    } else {
      regularQueries.push(word);
    }
  }
  let filtered = new FunctionalIterable(appData.books.values());
  // Iterate through tag queries.
  for (const tagQuery of tagQueries) {
    filtered = filtered.filter(book => {
      const tagSet = appData.bookTags.get(book.id); // this book's tags.
      if (!tagSet) {
        // There is no tag associated with this book.
        return false;
      }
      for (const tagId of tagSet) {
        const tag = appData.tags.get(tagId);
        if (tag && matchTag(tag, tagQuery)) {
          // Found a matching tag.
          return true;
        }
      }
      // Matching tag not found.
      return false;
    });
  }
  // Filter by regular query.
  filtered = filtered.filter(book =>
    matchPattern(regularQueries.join(""), ["title", "author", "isbn"], book)
  );
  return Array.from(filtered).reverse();
}
