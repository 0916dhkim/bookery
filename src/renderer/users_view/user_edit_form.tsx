import * as React from "react";
import { Form, Segment, Header } from "semantic-ui-react";

export interface UserEditFormProps {
  lastName: string;
  onLastNameChange: (lastName: string) => void;
  lastNameError: string | null;
  firstName: string;
  onFirstNameChange: (firstName: string) => void;
  firstNameError: string | null;
  note: string;
  onNoteChange: (note: string) => void;
  onCommit: () => void;
  onReset: () => void;
}

export function UserEditForm({
  lastName,
  onLastNameChange,
  lastNameError,
  firstName,
  onFirstNameChange,
  firstNameError,
  note,
  onNoteChange,
  onCommit,
  onReset
}: UserEditFormProps): React.ReactElement<UserEditFormProps> {
  return (
    <Segment.Group>
      <Segment compact tertiary>
        <Header>Profile</Header>
      </Segment>
      <Segment>
        <Form data-testid="user-edit-form" onSubmit={onCommit}>
          <Form.Input
            label="Last Name"
            type="text"
            value={lastName}
            onChange={(event): void => {
              onLastNameChange(event.target.value);
            }}
            required
            error={lastNameError}
          />
          <Form.Input
            label="First Name"
            type="text"
            value={firstName}
            onChange={(event): void => {
              onFirstNameChange(event.target.value);
            }}
            required
            error={firstNameError}
          />
          <Form.TextArea
            label="Notes"
            value={note}
            onChange={(event, { value }): void => {
              const valueStr =
                typeof value === "number"
                  ? value.toString()
                  : value === undefined
                  ? ""
                  : value;
              onNoteChange(valueStr);
            }}
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
