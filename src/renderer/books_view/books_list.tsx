import * as React from "react";
import { AppDataContext } from "../app_data_context";
import { Menu } from "semantic-ui-react";
import { Book } from "../../common/persistence/book";
import { Filter } from "../../common/persistence/filter";
import { BookFilter } from "../../common/persistence/book_filter";

export interface BooksListProps {
  filterQuery: string;
  onSelect: (book: Book) => void;
}

export function BooksList({
  filterQuery,
  onSelect
}: BooksListProps): React.ReactElement {
  const { appData } = React.useContext(AppDataContext);
  const bookFilter = React.useMemo<Filter<Book>>(() => {
    return new BookFilter(appData.books.values());
  }, [appData.books]);
  const filteredBooks = React.useMemo<Array<Book>>(() => {
    return Array.from(bookFilter.filter(filterQuery));
  }, [bookFilter, filterQuery]);

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
