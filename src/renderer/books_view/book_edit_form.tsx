import * as React from "react";
import { Segment, Header, Form, Message } from "semantic-ui-react";

export interface BookEditFormProps {
  title: string;
  onTitleChange: (title: string) => void;
  titleError: string | null;
  author: string;
  onAuthorChange: (author: string) => void;
  authorError: string | null;
  isbn: string;
  onIsbnChange: (isbn: string) => void;
  onCommit: () => void;
  onReset: () => void;
  warnings: Array<string>;
}

export function BookEditForm({
  title,
  onTitleChange,
  titleError,
  author,
  onAuthorChange,
  authorError,
  isbn,
  onIsbnChange,
  onCommit,
  onReset,
  warnings
}: BookEditFormProps): React.ReactElement {
  return (
    <Segment.Group>
      <Segment compact tertiary>
        <Header>Book Details</Header>
      </Segment>
      <Segment>
        {warnings.map((warning, index) => (
          <Message warning key={index.toString()}>
            {warning}
          </Message>
        ))}
        <Form onSubmit={onCommit}>
          <Form.Input
            label="Title"
            type="text"
            value={title}
            onChange={(event): void => onTitleChange(event.target.value)}
            required
            error={titleError}
          />
          <Form.Input
            label="Author"
            type="text"
            value={author}
            onChange={(event): void => onAuthorChange(event.target.value)}
            required
            error={authorError}
          />
          <Form.Input
            label="ISBN"
            type="text"
            value={isbn}
            onChange={(event): void => onIsbnChange(event.target.value)}
          />
          <Form.Group>
            <Form.Button type="button" onClick={onReset}>
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
