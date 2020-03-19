import * as React from "react";
import { AppDataContext } from "../app_data_context";
import { User } from "../../common/persistence/user";
import * as moment from "moment";
import { assertWrapper } from "../../common/assert_wrapper";
import {
  DropdownProps,
  DropdownItemProps,
  Segment,
  Button,
  Dropdown,
  Container,
  Input,
  Icon,
  Header
} from "semantic-ui-react";
import { Book } from "../../common/persistence/book";
import { Filter } from "../../common/persistence/filter";
import { BookFilter } from "../../common/persistence/book_filter";
import { addView, deleteView } from "../../common/persistence/app_data";

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

export interface HistoryEditFormProps {
  user: User;
}

export function HistoryEditForm({
  user
}: HistoryEditFormProps): React.ReactElement<HistoryEditFormProps> {
  const { appData, setAppData } = React.useContext(AppDataContext);
  const [historyInputValue, setHistoryInputValue] = React.useState<
    number | null
  >(null);
  const bookFilter = React.useMemo<Filter<Book>>(() => {
    return new BookFilter(appData.books.values());
  }, [appData.books]);

  /**
   * Handle history add button click event.
   */
  async function handleHistoryAddButtonClick(): Promise<void> {
    assertWrapper(historyInputValue);
    const selectedBook = appData.books.get(historyInputValue);
    assertWrapper(selectedBook);
    const [nextAppData] = addView(
      appData,
      user.id,
      selectedBook.id,
      moment().valueOf()
    );
    setAppData(nextAppData);
    setHistoryInputValue(null);
  }

  /**
   * Handle history addition candidate change.
   */
  async function handleHistoryInputValueChange(
    event: React.SyntheticEvent,
    data: DropdownProps
  ): Promise<void> {
    if (data.value === "") {
      // When cleared.
      setHistoryInputValue(null);
    } else {
      assertWrapper(typeof data.value === "number");
      setHistoryInputValue(data.value);
    }
  }

  /**
   * Handle history dropdown search event.
   */
  function handelHistoryDropDownSearch(
    options: Array<DropdownItemProps>,
    query: string
  ): Array<DropdownItemProps> {
    const books = bookFilter.filter(query) as Array<Book>;
    return books.map(bookToDropDownItemProps);
  }

  return (
    <Container data-testid="history-edit-form">
      <Segment.Group>
        <Segment compact tertiary>
          <Header>History</Header>
        </Segment>
        <Segment>
          <Input
            fluid
            label={{ icon: "book", basic: true }}
            input={
              <Dropdown
                fluid
                selection
                clearable
                selectOnBlur={false}
                selectOnNavigation={false}
                value={historyInputValue ?? ""}
                onChange={handleHistoryInputValueChange}
                options={Array.from(appData.books.values()).map(
                  bookToDropDownItemProps
                )}
                search={handelHistoryDropDownSearch}
              />
            }
            action={
              <Button
                disabled={!historyInputValue}
                positive={!!historyInputValue}
                onClick={handleHistoryAddButtonClick}
              >
                Add
              </Button>
            }
          />
        </Segment>
        <Segment.Group piled data-testid="history-list" size="small">
          {Array.from(appData.views.values())
            .filter(view => view.userId === user.id)
            .map(view => {
              const book = appData.books.get(view.bookId);
              assertWrapper(!!book);
              return (
                <Segment secondary clearing key={view.id.toString()}>
                  <Icon
                    name="x"
                    link
                    color="red"
                    onClick={(): void => {
                      const [nextAppData] = deleteView(appData, view.id);
                      setAppData(nextAppData);
                    }}
                  />
                  {book.title} by {book.author}
                </Segment>
              );
            })}
        </Segment.Group>
      </Segment.Group>
    </Container>
  );
}
