import * as React from "react";
import { Segment, Header, Form } from "semantic-ui-react";
import { Book } from "../../persistence/book";

export interface BookEditFormProps {
  book: Book;
  onCommit: (book: Book | null) => void;
  onChange: (book: Book | null) => void;
}

export function BookEditForm({
  book,
  onCommit,
  onChange
}: BookEditFormProps): React.ReactElement {
  const [titleValue, setTitleValue] = React.useState<string>("");
  const [authorValue, setAuthorValue] = React.useState<string>("");
  const [isbnValue, setIsbnValue] = React.useState<string>("");

  // Validate title.
  const titleError = React.useMemo<string | null>(() => {
    if (titleValue.length === 0) {
      return "Please enter title";
    }
    return null;
  }, [titleValue]);

  // Validate author.
  const authorError = React.useMemo<string | null>(() => {
    if (authorValue.length === 0) {
      return "Please enter author";
    }
    return null;
  }, [authorValue]);

  const isValid = React.useMemo<boolean>(() => {
    return titleError === null && authorError === null;
  }, [titleError, authorError]);

  const formBook = React.useMemo<Book | null>(() => {
    if (!isValid) {
      return null;
    }
    return new Book(
      book.id,
      titleValue,
      authorValue,
      isbnValue === "" ? undefined : isbnValue
    );
  }, [isValid, book, titleValue, authorValue, isbnValue]);

  React.useEffect(
    () => onChange(formBook),
    [onChange, formBook] // When formBook is changed.
  );

  /**
   * Override book edit form fields by given book.
   * @param targetBook override target.
   */
  function overrideForm(targetBook: Book): void {
    setTitleValue(targetBook.title);
    setAuthorValue(targetBook.author);
    setIsbnValue(targetBook.isbn ?? "");
  }

  // Synchronize staging book to the book edit form.
  React.useEffect(
    () => overrideForm(book),
    [book] // When staging book is changed.
  );

  return (
    <Segment.Group>
      <Segment compact tertiary>
        <Header>Book Details</Header>
      </Segment>
      <Segment>
        <Form onSubmit={(): void => onCommit(formBook)}>
          <Form.Input
            label="Title"
            type="text"
            value={titleValue}
            onChange={(event): void => setTitleValue(event.target.value)}
            required
            error={titleError}
          />
          <Form.Input
            label="Author"
            type="text"
            value={authorValue}
            onChange={(event): void => setAuthorValue(event.target.value)}
            required
            error={authorError}
          />
          <Form.Input
            label="ISBN"
            type="text"
            value={isbnValue}
            onChange={(event): void => setIsbnValue(event.target.value)}
          />
          <Form.Group>
            <Form.Button type="button" onClick={overrideForm.bind(null, book)}>
              Reset
            </Form.Button>
            <Form.Button type="submit" primary>
              Apply
            </Form.Button>
          </Form.Group>
        </Form>
      </Segment>
    </Segment.Group>
  );
}
