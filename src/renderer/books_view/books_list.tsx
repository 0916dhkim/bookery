import * as React from "react";
import { AppDataContext } from "../app_data_context";
import { Menu } from "semantic-ui-react";
import { Book } from "../../common/persistence/book";
import { filterBook } from "../../common/persistence/filter_book";

export interface BooksListProps {
  filterQuery: string;
  onSelect: (book: Book) => void;
}

export function BooksList({
  filterQuery,
  onSelect
}: BooksListProps): React.ReactElement {
  const { appData } = React.useContext(AppDataContext);
  const filteredBooks = React.useMemo<Array<Book>>(() => {
    return Array.from(filterBook(appData, filterQuery));
  }, [appData, filterQuery]);

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
