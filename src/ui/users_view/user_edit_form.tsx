import * as React from "react";
import { User } from "../../persistence/user";
import { Container } from "semantic-ui-react";

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
    <form
      ref={formRef}
      data-testid="user-edit-form"
      onSubmit={(): void => onCommit(formUser)}
    >
      <label>
        Last Name
        <input
          type="text"
          value={lastNameValue}
          onChange={(event): void => {
            setLastNameValue(event.target.value);
          }}
          required
        />
      </label>
      <label>
        First Name
        <input
          type="text"
          value={firstNameValue}
          onChange={(event): void => {
            setFirstNameValue(event.target.value);
          }}
          required
        />
      </label>
      <label>
        Note
        <textarea
          value={noteValue}
          onChange={(event): void => {
            setNoteValue(event.target.value);
          }}
        />
      </label>
      <button type="button" onClick={overrideForm.bind(null, user)}>
        Reset
      </button>
      <button type="submit">Apply</button>
    </form>
  );
}
