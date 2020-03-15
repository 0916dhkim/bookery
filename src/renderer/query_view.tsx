import * as React from "react";
import {
  Container,
  Dropdown,
  DropdownItemProps,
  DropdownProps,
  Icon,
  Message
} from "semantic-ui-react";
import { User } from "../common/persistence/user";
import { AppDataContext } from "./app_data_context";
import * as Fuse from "fuse.js";
import { Book } from "../common/persistence/book";
import { assertWrapper } from "../common/assert_wrapper";
import { AppData } from "../common/persistence/app_data";

/**
 * Convert a book to be presented inside dropdown menu.
 */
function bookToDropDownItemProps(book: Book): DropdownItemProps {
  return {
    key: book.id.toString(),
    text: book.title,
    value: book.id
  };
}

/**
 * Convert a book to be presented inside dropdown menu.
 */
function userToDropDownItemProps(user: User): DropdownItemProps {
  return {
    key: user.id.toString(),
    text: `${user.lastName}, ${user.firstName}`,
    value: user.id
  };
}

/**
 * @returns `true` if the user has read the book before. `false` otherwise.
 */
function hasUserReadBook(
  appData: AppData,
  userId: number,
  bookId: number
): boolean {
  return (
    Array.from(appData.views.values()).filter(
      view => view.userId === userId && view.bookId === bookId
    ).length !== 0
  );
}

interface QueryResultProps {
  hasRead: boolean;
}

function QueryResult({
  hasRead
}: QueryResultProps): React.ReactElement<QueryResultProps> {
  if (hasRead) {
    return (
      <Message positive>
        Read <Icon name="check" />
      </Message>
    );
  } else {
    return (
      <Message negative>
        Not Read <Icon name="x" />
      </Message>
    );
  }
}

export function QueryView(): React.ReactElement<{}> {
  const { appData } = React.useContext(AppDataContext);
  const [userInputValue, setUserInputValue] = React.useState<number | null>(
    null
  );
  const [bookInputValue, setBookInputValue] = React.useState<number | null>(
    null
  );
  const userFuse = React.useMemo<Fuse<User, Fuse.FuseOptions<User>>>(() => {
    const fuseOptions: Fuse.FuseOptions<User> = {
      shouldSort: true,
      includeMatches: false,
      includeScore: false,
      keys: ["lastName", "firstName", "note"]
    };
    return new Fuse(Array.from(appData.users.values()), fuseOptions);
  }, [appData]);
  const bookFuse = React.useMemo<Fuse<Book, Fuse.FuseOptions<Book>>>(() => {
    const fuseOptions: Fuse.FuseOptions<Book> = {
      shouldSort: true,
      includeMatches: false,
      includeScore: false,
      keys: ["title", "author", "isbn"]
    };
    return new Fuse(Array.from(appData.books.values()), fuseOptions);
  }, [appData]);

  /**
   * Handle user change.
   */
  function handleUserInputValueChange(
    event: React.SyntheticEvent,
    data: DropdownProps
  ): void {
    if (data.value === "") {
      // When cleared.
      setUserInputValue(null);
    } else {
      assertWrapper(typeof data.value === "number");
      setUserInputValue(data.value);
    }
  }

  /**
   * Handler book change.
   */
  function handleBookInputValueChange(
    event: React.SyntheticEvent,
    data: DropdownProps
  ): void {
    if (data.value === "") {
      // When cleared.
      setBookInputValue(null);
    } else {
      assertWrapper(typeof data.value === "number");
      setBookInputValue(data.value);
    }
  }

  /**
   * Handle user dropdown search event.
   */
  function handleUserDropDownSearch(
    options: Array<DropdownItemProps>,
    query: string
  ): Array<DropdownItemProps> {
    const users = userFuse.search(query) as Array<User>;
    return users.map(userToDropDownItemProps);
  }

  /**
   * Handle book dropdown search event.
   */
  function handleBookDropDownSearch(
    options: Array<DropdownItemProps>,
    query: string
  ): Array<DropdownItemProps> {
    const books = bookFuse.search(query) as Array<Book>;
    return books.map(bookToDropDownItemProps);
  }

  return (
    <Container fluid>
      <div style={{ display: "flex", margin: "1em 0" }}>
        <Icon name="users" size="big" style={{ flexGrow: 0 }} />
        <Dropdown
          style={{ flexGrow: 1 }}
          selection
          clearable
          selectOnBlur={false}
          selectOnNavigation={false}
          value={userInputValue ?? ""}
          onChange={handleUserInputValueChange}
          options={Array.from(appData.users.values()).map(
            userToDropDownItemProps
          )}
          search={handleUserDropDownSearch}
        />
      </div>
      <div style={{ display: "flex", margin: "1em 0" }}>
        <Icon name="book" size="big" style={{ flexGrow: 0 }} />
        <Dropdown
          fluid
          selection
          clearable
          selectOnBlur={false}
          selectOnNavigation={false}
          value={bookInputValue ?? ""}
          onChange={handleBookInputValueChange}
          options={Array.from(appData.books.values()).map(
            bookToDropDownItemProps
          )}
          search={handleBookDropDownSearch}
        />
      </div>
      {bookInputValue !== null && userInputValue !== null && (
        <QueryResult
          hasRead={hasUserReadBook(appData, userInputValue, bookInputValue)}
        />
      )}
    </Container>
  );
}
