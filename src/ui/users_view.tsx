import * as React from "react";
import { ContentViewProps } from "./content_view";
import {
  showModifiedDialogSync,
  ModifiedDialogOption
} from "./modified_dialog";
import { showFormValidityErrorMessage } from "./form_validity_error_message";
import * as Fuse from "fuse.js";
import { User } from "../persistence/user";

export function UsersView(
  props: ContentViewProps
): React.ReactElement<ContentViewProps> {
  const [stagingUser, setStagingUser] = React.useState<User>();
  const [firstNameValue, setFirstNameValue] = React.useState<string>("");
  const [lastNameValue, setLastNameValue] = React.useState<string>("");
  const [noteValue, setNoteValue] = React.useState<string>("");
  const [filterValue, setFilterValue] = React.useState<string>("");

  const formRef = React.useRef<HTMLFormElement>();

  /**
   * Override user edit form fields by given user.
   * @param targetUser override target.
   */
  function overrideUserEditForm(targetUser: User): void {
    setFirstNameValue(targetUser.firstName);
    setLastNameValue(targetUser.lastName);
    setNoteValue(targetUser.note ? targetUser.note : "");
  }

  // Synchronize staging user to the user edit form.
  React.useEffect(
    () => {
      if (stagingUser) {
        overrideUserEditForm(stagingUser);
      }
    },
    [stagingUser] // When staging user is changed.
  );

  /**
   * Filtered array of users by search term.
   * When there is no search term input by user, no filter is applied.
   */
  const filteredUsers = React.useMemo<ReadonlyArray<User>>((): ReadonlyArray<
    User
  > => {
    if (filterValue.length === 0) {
      return Array.from(props.appData.users.values());
    }
    const fuseOptions: Fuse.FuseOptions<User> = {
      shouldSort: true,
      includeMatches: false,
      includeScore: false,
      keys: ["lastName", "firstName", "note"]
    };
    const filterFuse: Fuse<User, Fuse.FuseOptions<User>> = new Fuse(
      Array.from(props.appData.users.values()),
      fuseOptions
    );
    return filterFuse.search(filterValue) as User[];
  }, [filterValue, props.appData]);

  /**
   * Apply data from the user edit form to the app data.
   * Display an error message if the form is invalid.
   */
  function commitChanges(): boolean {
    if (!formRef.current.checkValidity()) {
      showFormValidityErrorMessage();
      return false;
    }
    const nextUser = stagingUser
      .setFirstName(firstNameValue)
      .setLastName(lastNameValue)
      .setNote(noteValue === "" ? undefined : noteValue);
    setStagingUser(nextUser);
    props.setAppData(props.appData.setUser(nextUser));
    return true;
  }

  /**
   * @returns true if the form can be discarded without worrying about user modifications. False otherwise.
   */
  function safeToOverrideUserEditForm(): boolean {
    if (!stagingUser) {
      return true;
    }
    const original = props.appData.users.get(stagingUser.id);
    const needToAsk =
      !original ||
      firstNameValue !== stagingUser.firstName ||
      lastNameValue !== stagingUser.lastName ||
      noteValue !== (stagingUser.note ? stagingUser.note : "");

    if (needToAsk) {
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
    return true;
  }

  /**
   * Handle user list element click event.
   * @param user Clicked user.
   */
  function handleUserClick(user: User): void {
    if (safeToOverrideUserEditForm()) {
      setStagingUser(user);
    }
  }

  /**
   * Handle new user button click event.
   */
  function handleNewUserButtonClick(): void {
    if (safeToOverrideUserEditForm()) {
      const generatedUser = props.appData.generateUser();
      setStagingUser(generatedUser);
    }
  }

  /**
   * Handle delete user button click event.
   */
  function handleDeleteUserButtonClick(): void {
    props.setAppData(props.appData.deleteUser(stagingUser)[0]);
    setStagingUser(null);
  }

  return (
    <div className="js-users-view">
      Users View
      {/* Search Bar */}
      <form role="search" onSubmit={(event): void => event.preventDefault()}>
        <label>
          Search
          <input
            type="text"
            value={filterValue}
            onChange={(event): void => {
              setFilterValue(event.target.value);
            }}
          />
        </label>
        <button onClick={handleNewUserButtonClick}>New User</button>
        {/* Users List */}
        <ul role="listbox" data-testid="suggestions-list">
          {filteredUsers.map(user => (
            <li role="presentation" key={user.id.toString()}>
              <a
                href="#"
                onClick={handleUserClick.bind(null, user)}
                role="option"
              >
                {user.lastName}, {user.firstName}: {user.note}
              </a>
            </li>
          ))}
        </ul>
      </form>
      {/* User Edit Form */}
      {stagingUser && (
        <form
          ref={formRef}
          data-testid="user-edit-form"
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
          <button
            onClick={handleDeleteUserButtonClick}
            data-testid="delete-button"
          >
            Delete User
          </button>
          <button onClick={overrideUserEditForm.bind(null, stagingUser)}>
            Reset
          </button>
          <button type="submit">Apply</button>
        </form>
      )}
    </div>
  );
}
