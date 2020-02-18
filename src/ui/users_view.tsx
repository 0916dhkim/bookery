import * as React from "react";
import { ContentViewProps } from "./content_view";
import { User } from "../persistence/user";
import {
  showModifiedDialogSync,
  ModifiedDialogOption
} from "./modified_dialog";
import { showFormValidityErrorMessage } from "./form_validity_error_message";

export function UsersView(
  props: ContentViewProps
): React.ReactElement<ContentViewProps> {
  const [activeUser, setActiveUser] = React.useState<User>();
  const [firstNameValue, setFirstNameValue] = React.useState<string>("");
  const [lastNameValue, setLastNameValue] = React.useState<string>("");
  const [noteValue, setNoteValue] = React.useState<string>("");
  const [, forceUpdate] = React.useState();

  const formRef = React.useRef<HTMLFormElement>();

  function isModified(): boolean {
    return (
      activeUser &&
      [
        activeUser.firstName !== firstNameValue,
        activeUser.lastName !== lastNameValue,
        activeUser.note ? activeUser.note !== noteValue : noteValue !== ""
      ].reduce((a, b) => a || b, false)
    );
  }

  function commitChanges(): boolean {
    if (!formRef.current.checkValidity()) {
      showFormValidityErrorMessage();
      return false;
    }
    activeUser.firstName = firstNameValue;
    activeUser.lastName = lastNameValue;
    activeUser.note = noteValue === "" ? undefined : noteValue;
    setActiveUser(activeUser);
    forceUpdate({});
    return true;
  }

  function resetForms(toUser: User): void {
    setFirstNameValue(toUser.firstName);
    setLastNameValue(toUser.lastName);
    setNoteValue(toUser.note ? toUser.note : "");
  }

  function ensureNotModified(): boolean {
    if (!isModified()) {
      return true;
    }

    const response: ModifiedDialogOption = showModifiedDialogSync();
    switch (response) {
      case ModifiedDialogOption.CANCEL:
        return false;
      case ModifiedDialogOption.SAVE:
        return commitChanges();
      case ModifiedDialogOption.DONTSAVE:
        return true;
    }
  }

  return (
    <div className="js-users-view">
      Users View
      <ul>
        {props.appData.users.map(user => (
          <li key={user.id.toString()}>
            <a
              onClick={(): void => {
                if (ensureNotModified()) {
                  setActiveUser(user);
                  resetForms(user);
                }
              }}
            >
              {user.lastName}, {user.firstName}: {user.note}
            </a>
          </li>
        ))}
      </ul>
      {activeUser && (
        <form
          ref={formRef}
          onSubmit={(event): void => {
            commitChanges();
            event.preventDefault();
          }}
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
          <button onClick={resetForms.bind(null, activeUser)}>Reset</button>
          <button type="submit">Apply</button>
        </form>
      )}
    </div>
  );
}
