import * as React from "react";
import {
  Container,
  Grid,
  Input,
  Button,
  Icon,
  Segment,
  Message
} from "semantic-ui-react";
import { BooksList } from "./books_list";
import { BookEditForm } from "./book_edit_form";
import { AppDataContext } from "../app_data_context";
import { Book } from "../../common/persistence/book";
import { assertWrapper } from "../../common/assert_wrapper";
import { RequestContext } from "../request_context";
import {
  addBook,
  updateBook,
  deleteBook
} from "../../common/persistence/app_data";
import { produce } from "../../common/persistence/immer-initialized";

interface BooksViewState {
  /**
   * A copy of a book from app data
   * that is being edited.
   */
  selectedBook: Book | null;
  /**
   * If this editor is editing a book that is
   * not inside app data yet.
   */
  editingNewBook: boolean;
  titleField: string;
  authorField: string;
  isbnField: string;
  filterValue: string;
}

type BooksViewAction =
  | { type: "New Book" }
  | { type: "Close Book Editor" }
  | { type: "Select Book"; book: Book }
  | { type: "Change Title"; title: string }
  | { type: "Change Author"; author: string }
  | { type: "Change ISBN"; isbn: string }
  | { type: "Change Filter"; filter: string };

function reducer(
  state: BooksViewState,
  action: BooksViewAction
): BooksViewState {
  switch (action.type) {
    case "New Book":
      return produce(state, draft => {
        draft.selectedBook = null;
        draft.editingNewBook = true;
        draft.titleField = "";
        draft.authorField = "";
        draft.isbnField = "";
      });
    case "Close Book Editor":
      return produce(state, draft => {
        draft.selectedBook = null;
        draft.editingNewBook = false;
      });
    case "Select Book":
      return produce(state, draft => {
        draft.selectedBook = action.book;
        draft.editingNewBook = false;
        draft.titleField = action.book.title;
        draft.authorField = action.book.author;
        draft.isbnField = action.book.isbn ?? "";
      });
    case "Change Title":
      return produce(state, draft => {
        draft.titleField = action.title;
      });
    case "Change Author":
      return produce(state, draft => {
        draft.authorField = action.author;
      });
    case "Change ISBN":
      return produce(state, draft => {
        draft.isbnField = action.isbn;
      });
    case "Change Filter":
      return produce(state, draft => {
        draft.filterValue = action.filter;
      });
  }
}

export function BooksView(): React.ReactElement<{}> {
  const { appData, setAppData } = React.useContext(AppDataContext);
  const { request } = React.useContext(RequestContext);
  const [state, dispatch] = React.useReducer(reducer, {
    selectedBook: null,
    editingNewBook: false,
    titleField: "",
    authorField: "",
    isbnField: "",
    filterValue: ""
  });

  // Validate title.
  const titleFieldError = React.useMemo<string | null>(() => {
    if (state.titleField.length === 0) {
      return "Please enter title";
    }
    return null;
  }, [state.titleField]);

  // Validate author.
  const authorFieldError = React.useMemo<string | null>(() => {
    if (state.authorField.length === 0) {
      return "Please enter author";
    }
    return null;
  }, [state.authorField]);

  const isValid = React.useMemo<boolean>(() => {
    return titleFieldError === null && authorFieldError === null;
  }, [titleFieldError, authorFieldError]);

  /**
   * `true` if form fields are modified.
   * `false` otherwise.
   */
  const isModified = React.useMemo<boolean>(() => {
    if (!state.selectedBook) {
      return state.editingNewBook;
    }

    if (
      state.titleField !== state.selectedBook.title ||
      state.authorField !== state.selectedBook.author ||
      state.isbnField !== (state.selectedBook.isbn ?? "")
    ) {
      return true;
    }
    return false;
  }, [
    state.selectedBook,
    state.editingNewBook,
    state.titleField,
    state.authorField,
    state.isbnField
  ]);

  /**
   * `true` if there is any existing book in app data that has
   * the same title as the book being edited.
   * `false` otherwise.
   */
  const hasExistingBookWithSameTitle = React.useMemo<boolean>(() => {
    for (const b of appData.books.values()) {
      if (
        state.titleField === b.title &&
        (state.editingNewBook || state.selectedBook?.id !== b.id)
      ) {
        return true;
      }
    }
    return false;
  }, [
    appData.books,
    state.titleField,
    state.editingNewBook,
    state.selectedBook
  ]);

  /**
   * Commit staged user into app data.
   * @returns `true` if user is commited. `false` otherwise.
   */
  async function commitStagedBook(): Promise<boolean> {
    if (!isValid) {
      await request({
        type: "SHOW-ERROR-MESSAGE",
        title: "Forms Error",
        message: "Cannot save invalid forms."
      });
      return false;
    }

    const formValues = {
      title: state.titleField,
      author: state.authorField,
      isbn: state.isbnField
    };

    if (state.selectedBook) {
      // Committing an existing book.
      const nextSelectedBook: Book = {
        id: state.selectedBook.id,
        ...formValues
      };
      setAppData(updateBook(appData, nextSelectedBook));
      dispatch({ type: "Select Book", book: nextSelectedBook });
    } else {
      // Committing a new book.
      const [nextAppData, nextSelectedBook] = addBook(
        appData,
        formValues.title,
        formValues.author,
        formValues.isbn === "" ? undefined : formValues.isbn
      );
      setAppData(nextAppData);
      dispatch({ type: "Select Book", book: nextSelectedBook });
    }
    return true;
  }

  /**
   * @returns true if the form can be discarded without worrying about book modifications. False otherwise.
   */
  async function checkIfSafeToOverrideUserEditForm(): Promise<boolean> {
    if (isModified) {
      // Book form modified.
      // Ask for user permission.
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
      dispatch({ type: "Select Book", book: book });
    }
  }

  /**
   * Handle new book button click event.
   */
  async function handleNewBookButtonClick(): Promise<void> {
    if (await checkIfSafeToOverrideUserEditForm()) {
      dispatch({ type: "New Book" });
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
        if (state.selectedBook) {
          const [nextAppData] = deleteBook(appData, state.selectedBook.id);
          setAppData(nextAppData);
        }
        dispatch({ type: "Close Book Editor" });
        return null;
      }
    }[warningResponse]);
  }

  /**
   * Handle reset button click event.
   */
  function handleResetButtonClick(): void {
    if (state.editingNewBook) {
      dispatch({ type: "New Book" });
    } else {
      assertWrapper(state.selectedBook);
      dispatch({ type: "Select Book", book: state.selectedBook });
    }
  }

  return (
    <Container fluid>
      <div style={{ display: "flex", margin: "1em 0" }}>
        {/* Search Bar */}
        <Input
          type="text"
          icon="search"
          value={state.filterValue}
          onChange={(event): void => {
            dispatch({ type: "Change Filter", filter: event.target.value });
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
          <BooksList
            filterQuery={state.filterValue}
            onSelect={handleBookClick}
          />
        </Grid.Column>
        {(state.selectedBook || state.editingNewBook) && (
          <Grid.Column width={8}>
            {/* Existing Book Warning */}
            {hasExistingBookWithSameTitle && (
              <Message warning>
                There is a book with the same title as the book that is being
                edited.
              </Message>
            )}
            {/* Book Edit Form */}
            <BookEditForm
              title={state.titleField}
              onTitleChange={(title): void =>
                dispatch({ type: "Change Title", title: title })
              }
              titleError={titleFieldError}
              author={state.authorField}
              onAuthorChange={(author): void =>
                dispatch({ type: "Change Author", author: author })
              }
              authorError={authorFieldError}
              isbn={state.isbnField}
              onIsbnChange={(isbn): void =>
                dispatch({
                  type: "Change ISBN",
                  isbn: isbn
                })
              }
              onCommit={commitStagedBook}
              onReset={handleResetButtonClick}
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
