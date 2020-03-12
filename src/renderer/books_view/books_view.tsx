import * as React from "react";
import {
  Container,
  Grid,
  Input,
  Button,
  Icon,
  Segment
} from "semantic-ui-react";
import { BooksList } from "./books_list";
import { BookEditForm } from "./book_edit_form";
import { AppDataContext } from "../app_data_context";
import { Book } from "../../common/persistence/book";
import { assertWrapper } from "../../common/assert_wrapper";
import { RequestContext } from "../request_context";

export function BooksView(): React.ReactElement<{}> {
  const { appData, setAppData } = React.useContext(AppDataContext);
  const { request } = React.useContext(RequestContext);
  const [selectedBook, setSelectedBook] = React.useState<Book | null>(null);
  const [stagedBook, setStagedBook] = React.useState<Book | null>(null);
  const [filterValue, setFilterValue] = React.useState<string>("");

  /**
   * Commit staged user into app data.
   * @returns `true` if user is commited. `false` otherwise.
   */
  async function commitStagedBook(): Promise<boolean> {
    if (!stagedBook) {
      await request({
        type: "SHOW-ERROR-MESSAGE",
        title: "Forms Error",
        message: "Cannot save invalid forms."
      });
      return false;
    }

    setSelectedBook(stagedBook);
    setAppData(appData.setBook(stagedBook));
    return true;
  }

  /**
   * @returns true if the form can be discarded without worrying about book modifications. False otherwise.
   */
  async function checkIfSafeToOverrideUserEditForm(): Promise<boolean> {
    if (!selectedBook) {
      return true;
    }
    let needToAsk = false;
    if (!stagedBook) {
      needToAsk = true;
    } else {
      assertWrapper(selectedBook.id === stagedBook.id);
      if (
        selectedBook.title !== stagedBook.title ||
        selectedBook.author !== stagedBook.author ||
        selectedBook.isbn !== stagedBook.isbn
      ) {
        // Book form modified.
        needToAsk = true;
      }
    }

    if (needToAsk) {
      const warningResponse = await request({
        type: "SHOW-OVERRIDE-WARNING",
        message: "Do you want to save changes?"
      });
      return await {
        Cancel: (): boolean => false,
        "Don't Save": (): boolean => true,
        Save: async (): Promise<boolean> => {
          return await commitStagedBook();
        }
      }[warningResponse]();
    } else {
      return true;
    }
  }

  /**
   * Handle user list element click event.
   * @param user Clicked user.
   */
  async function handleBookClick(book: Book): Promise<void> {
    if (await checkIfSafeToOverrideUserEditForm()) {
      setSelectedBook(book);
    }
  }

  /**
   * Handle new book button click event.
   */
  async function handleNewBookButtonClick(): Promise<void> {
    if (await checkIfSafeToOverrideUserEditForm()) {
      const generatedBook = appData.generateBook("", "");
      setSelectedBook(generatedBook);
    }
  }

  /**
   * Handle delete book button click event.
   */
  async function handleDeleteBookButtonClick(): Promise<void> {
    const warningResponse = await request({
      type: "SHOW-WARNING-MESSAGE",
      message: "Do you really want to delete this book?"
    });
    ({
      get Cancel(): null {
        return null;
      },
      get OK(): null {
        assertWrapper(selectedBook);
        let nextAppData = appData.deleteBook(selectedBook)[0];
        Array.from(appData.views.values())
          .filter(view => view.bookId === selectedBook.id)
          .forEach(view => {
            nextAppData = nextAppData.deleteView(view)[0];
          });
        setAppData(nextAppData);
        setSelectedBook(null);
        return null;
      }
    }[warningResponse]);
  }

  return (
    <Container fluid>
      Books View
      <div style={{ display: "flex", margin: "1em 0" }}>
        {/* Search Bar */}
        <Input
          type="text"
          icon="search"
          value={filterValue}
          onChange={(event): void => {
            setFilterValue(event.target.value);
          }}
          style={{ flexGrow: 1 }}
        />
        <Button
          positive
          icon
          labelPosition="left"
          onClick={handleNewBookButtonClick}
          style={{
            marginLeft: "1em",
            flexGrow: 0
          }}
        >
          <Icon name="plus circle" />
          New Book
        </Button>
      </div>
      <Grid divided="vertically">
        <Grid.Column width={8}>
          {/* Books List */}
          <BooksList filterQuery={filterValue} onSelect={handleBookClick} />
        </Grid.Column>
        {selectedBook && (
          <Grid.Column width={8}>
            {/* Book Edit Form */}
            <BookEditForm
              book={selectedBook}
              onCommit={commitStagedBook}
              onChange={setStagedBook}
            />
            <Segment basic>
              <Button
                data-testid="book-delete-button"
                negative
                icon
                labelPosition="left"
                onClick={handleDeleteBookButtonClick}
              >
                <Icon name="exclamation triangle" />
                Delete Book
              </Button>
            </Segment>
          </Grid.Column>
        )}
      </Grid>
    </Container>
  );
}
