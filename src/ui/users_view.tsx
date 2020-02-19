import * as React from "react";
import { ContentViewProps } from "./content_view";
import {
  showModifiedDialogSync,
  ModifiedDialogOption
} from "./modified_dialog";
import { showFormValidityErrorMessage } from "./form_validity_error_message";
import produce from "immer";

export function UsersView(
  props: ContentViewProps
): React.ReactElement<ContentViewProps> {
  const [activeUserId, setActiveUserId] = React.useState<number>();
  const [firstNameValue, setFirstNameValue] = React.useState<string>("");
  const [lastNameValue, setLastNameValue] = React.useState<string>("");
  const [noteValue, setNoteValue] = React.useState<string>("");

  const formRef = React.useRef<HTMLFormElement>();

  function isModified(): boolean {
    if (activeUserId) {
      const activeUser = props.appData.users.get(activeUserId);
      return [
        activeUser.firstName !== firstNameValue,
        activeUser.lastName !== lastNameValue,
        activeUser.note ? activeUser.note !== noteValue : noteValue !== ""
      ].reduce((a, b) => a || b, false);
    }
    return false;
  }

  function commitChanges(): boolean {
    if (!formRef.current.checkValidity()) {
      showFormValidityErrorMessage();
      return false;
    }
    props.setAppData(
      produce(props.appData, draft => {
        draft.users.forEach(user => {
          if (user.id === activeUserId) {
            user.firstName = firstNameValue;
            user.lastName = lastNameValue;
            user.note = noteValue === "" ? undefined : noteValue;
          }
        });
      })
    );
    return true;
  }

  function resetForms(toUserId: number): void {
    const toUser = props.appData.users.get(toUserId);
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
        {Array.from(props.appData.users.values()).map(user => (
          <li key={user.id.toString()}>
            <a
              onClick={(): void => {
                if (ensureNotModified()) {
                  setActiveUserId(user.id);
                  resetForms(user.id);
                }
              }}
            >
              {user.lastName}, {user.firstName}: {user.note}
            </a>
          </li>
        ))}
      </ul>
      {activeUserId && (
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
          <button onClick={resetForms.bind(null, activeUserId)}>Reset</button>
          <button type="submit">Apply</button>
        </form>
      )}
    </div>
  );
}
