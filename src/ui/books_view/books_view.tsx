import * as React from "react";
import { Container, Grid, Input } from "semantic-ui-react";
import { BooksList } from "./books_list";
import { BookEditForm } from "./book_edit_form";
import { showFormValidityErrorMessage } from "../form_validity_error_message";
import { AppDataContext } from "../app_data_context";
import { Book } from "../../persistence/book";
import { assertWrapper } from "../../assert_wrapper";
import {
  ModifiedDialogOption,
  showModifiedDialogSync
} from "../modified_dialog";

export interface BooksViewProps {
  children?: React.ReactNode;
}

export function BooksView(): React.ReactElement<BooksViewProps> {
  const { appData, setAppData } = React.useContext(AppDataContext);
  const [selectedBook, setSelectedBook] = React.useState<Book | null>(null);
  const [stagedBook, setStagedBook] = React.useState<Book | null>(null);
  const [filterValue, setFilterValue] = React.useState<string>("");

  /**
   * Commit staged user into app data.
   * @returns `true` if user is commited. `false` otherwise.
   */
  function commitStagedBook(): boolean {
    if (!stagedBook) {
      showFormValidityErrorMessage();
      return false;
    }

    setSelectedBook(stagedBook);
    setAppData(appData.setBook(stagedBook));
    return true;
  }

  /**
   * @returns true if the form can be discarded without worrying about book modifications. False otherwise.
   */
  function checkIfSafeToOverrideUserEditForm(): boolean {
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
      const response: ModifiedDialogOption = showModifiedDialogSync();
      switch (response) {
        case ModifiedDialogOption.CANCEL:
          return false;
        case ModifiedDialogOption.SAVE:
          return commitStagedBook();
        case ModifiedDialogOption.DONTSAVE:
          return true;
      }
    }
    return true;
  }

  /**
   * Handle user list element click event.
   * @param user Clicked user.
   */
  function handleBookClick(book: Book): void {
    if (checkIfSafeToOverrideUserEditForm()) {
      setSelectedBook(book);
    }
  }

  return (
    <Container fluid>
      Books View
      <Input
        type="text"
        icon="search"
        value={filterValue}
        onChange={(event): void => {
          setFilterValue(event.target.value);
        }}
        style={{ flexGrow: 1 }}
      />
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
          </Grid.Column>
        )}
      </Grid>
    </Container>
  );
}
