import * as React from "react";
import { User } from "../../persistence/user";
import { Form } from "semantic-ui-react";

export interface UserEditFormProps {
  user: User;
  onCommit: (user: User | null) => void;
  onChange: (user: User | null) => void;
}

export function UserEditForm({
  user,
  onCommit,
  onChange
}: UserEditFormProps): React.ReactElement<UserEditFormProps> {
  const [firstNameValue, setFirstNameValue] = React.useState<string>("");
  const [lastNameValue, setLastNameValue] = React.useState<string>("");
  const [noteValue, setNoteValue] = React.useState<string>("");
  const [isValid, setIsValid] = React.useState<boolean>(true);

  const formUser = React.useMemo<User | null>(() => {
    if (!isValid) {
      return null;
    }

    return new User(
      user.id,
      lastNameValue,
      firstNameValue,
      noteValue === "" ? undefined : noteValue
    );
  }, [isValid, user, lastNameValue, firstNameValue, noteValue]);

  React.useEffect(
    () => onChange(formUser),
    [onChange, formUser] // When formUser is changed.
  );

  // Validate First Name.
  const firstNameError = React.useMemo<string | null>(() => {
    if (firstNameValue.length === 0) {
      return "Please enter first name";
    }
    return null;
  }, [firstNameValue]);

  // Validate Last Name.
  const lastNameError = React.useMemo<string | null>(() => {
    if (lastNameValue.length === 0) {
      return "Please enter last name";
    }
    return null;
  }, [lastNameValue]);

  /**
   * Override user edit form fields by given user.
   * @param targetUser override target.
   */
  function overrideForm(targetUser: User): void {
    setFirstNameValue(targetUser.firstName);
    setLastNameValue(targetUser.lastName);
    setNoteValue(targetUser.note ? targetUser.note : "");
  }

  const formRef = React.useRef<HTMLFormElement>(null);
  React.useEffect(() => {
    if (formRef.current) {
      setIsValid(formRef.current.checkValidity());
    }
  }, [firstNameValue, lastNameValue, noteValue]);

  // Synchronize staging user to the user edit form.
  React.useEffect(
    () => overrideForm(user),
    [user] // When staging user is changed.
  );

  return (
    <Form
      data-testid="user-edit-form"
      onSubmit={(): void => onCommit(formUser)}
    >
      <Form.Input
        label="Last Name"
        type="text"
        value={lastNameValue}
        onChange={(event): void => {
          setLastNameValue(event.target.value);
        }}
        required
        error={lastNameError}
      />
      <Form.Input
        label="First Name"
        type="text"
        value={firstNameValue}
        onChange={(event): void => {
          setFirstNameValue(event.target.value);
        }}
        required
        error={firstNameError}
      />
      <Form.TextArea
        label="Notes"
        value={noteValue}
        onChange={(event, { value }): void => {
          const valueStr =
            typeof value === "number"
              ? value.toString()
              : value === undefined
              ? ""
              : value;
          setNoteValue(valueStr);
        }}
      />
      <Form.Group>
        <Form.Button type="button" onClick={overrideForm.bind(null, user)}>
          Reset
        </Form.Button>
        <Form.Button type="submit" primary>
          Apply
        </Form.Button>
      </Form.Group>
    </Form>
  );
}
