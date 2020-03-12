import * as React from "react";
import { AppDataContext } from "../app_data_context";
import { Menu } from "semantic-ui-react";
import { Book } from "../../common/persistence/book";
import * as Fuse from "fuse.js";

export interface BooksListProps {
  filterQuery: string;
  onSelect: (book: Book) => void;
}

export function BooksList({
  filterQuery,
  onSelect
}: BooksListProps): React.ReactElement {
  const { appData } = React.useContext(AppDataContext);
  /**
   * Filtered array of books by search term.
   * When there is no search term input by user, no filter is applied.
   */
  const filteredBooks = React.useMemo<ReadonlyArray<Book>>((): ReadonlyArray<
    Book
  > => {
    if (filterQuery.length === 0) {
      return Array.from(appData.books.values());
    }
    const fuseOptions: Fuse.FuseOptions<Book> = {
      shouldSort: true,
      includeMatches: false,
      includeScore: false,
      keys: ["title", "author", "isbn"]
    };
    const filterFuse: Fuse<Book, Fuse.FuseOptions<Book>> = new Fuse(
      Array.from(appData.books.values()),
      fuseOptions
    );
    return filterFuse.search(filterQuery) as Book[];
  }, [filterQuery, appData]);

  return (
    <Menu data-testid="suggestions-list" fluid vertical>
      {filteredBooks.map(book => (
        <Menu.Item key={book.id.toString()} onClick={onSelect.bind(null, book)}>
          {book.title} by {book.author}
        </Menu.Item>
      ))}
    </Menu>
  );
}
