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
  Header,
  Label
} from "semantic-ui-react";
import { Book } from "../../common/persistence/book";
import { filterBook } from "../../common/persistence/filter_book";
import { addView, deleteView } from "../../common/persistence/app_data";
import { View } from "../../common/persistence/view";
import { FunctionalIterable } from "../../common/persistence/functional_iterable";

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
  const views = React.useMemo<Iterable<View>>(() => {
    const ret = new FunctionalIterable(appData.views.values()).filter(
      view => view.userId === user.id
    );
    return Array.from(ret).reverse();
  }, [appData.views, user]);

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
    const books = Array.from(filterBook(appData, query));
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
          {Array.from(views).map(view => {
            const book = appData.books.get(view.bookId);
            assertWrapper(!!book);
            return (
              <Segment
                data-testid="history-list-element"
                secondary
                clearing
                key={view.id.toString()}
              >
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
                <Label>{moment(view.date).format("YYYY/MM/DD")}</Label>
              </Segment>
            );
          })}
        </Segment.Group>
      </Segment.Group>
    </Container>
  );
}
