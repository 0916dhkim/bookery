import * as React from "react";
import {
  ModifiedDialogOption,
  showModifiedDialogSync as defaultShowModifiedDialogSync
} from "./modified_dialog";
import {
  DeleteUserDialogOption,
  showDeleteUserDialogSync as defaultShowDeleteUserDialogSync
} from "./delete_user_dialog";
import { showFormValidityErrorMessage } from "./form_validity_error_message";
import * as Fuse from "fuse.js";
import { Book } from "../persistence/book";
import { User } from "../persistence/user";
import { AppDataContext } from "./app_data_context";
import {
  Button,
  Dropdown,
  DropdownItemProps,
  DropdownProps,
  Container,
  Segment,
  Form
} from "semantic-ui-react";
import { assertWrapper } from "../assert_wrapper";
import moment = require("moment");

export interface UsersViewProps {
  showModifiedDialogSync?: () => ModifiedDialogOption;
  showDeleteUserDialogSync?: () => DeleteUserDialogOption;
  children?: React.ReactNode;
}

function bookToDropDownItemProps(book: Book): DropdownItemProps {
  return {
    key: book.id.toString(),
    text: book.title,
    value: book.id
  };
}

export function UsersView({
  showModifiedDialogSync = defaultShowModifiedDialogSync,
  showDeleteUserDialogSync = defaultShowDeleteUserDialogSync
}: UsersViewProps): React.ReactElement<UsersViewProps> {
  const { appData, setAppData } = React.useContext(AppDataContext);
  const [stagingUser, setStagingUser] = React.useState<User | null>(null);
  const [firstNameValue, setFirstNameValue] = React.useState<string>("");
  const [lastNameValue, setLastNameValue] = React.useState<string>("");
  const [noteValue, setNoteValue] = React.useState<string>("");
  const [filterValue, setFilterValue] = React.useState<string>("");
  const [historyInputValue, setHistoryInputValue] = React.useState<
    number | null
  >(null);

  const [formRef] = React.useState<React.RefObject<HTMLFormElement>>(
    React.createRef()
  );

  const isNewUserStaged = React.useMemo<boolean>(() => {
    return !!stagingUser && !appData.users.has(stagingUser.id);
  }, [appData, stagingUser]);

  const bookFuse = React.useMemo<Fuse<Book, Fuse.FuseOptions<Book>>>(() => {
    const fuseOptions: Fuse.FuseOptions<Book> = {
      shouldSort: true,
      includeMatches: false,
      includeScore: false,
      keys: ["title", "author", "isbn"]
    };
    return new Fuse<Book, Fuse.FuseOptions<Book>>(
      Array.from(appData.books.values()),
      fuseOptions
    );
  }, [appData]);

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
      return Array.from(appData.users.values());
    }
    const fuseOptions: Fuse.FuseOptions<User> = {
      shouldSort: true,
      includeMatches: false,
      includeScore: false,
      keys: ["lastName", "firstName", "note"]
    };
    const filterFuse: Fuse<User, Fuse.FuseOptions<User>> = new Fuse(
      Array.from(appData.users.values()),
      fuseOptions
    );
    return filterFuse.search(filterValue) as User[];
  }, [filterValue, appData]);

  /**
   * Apply data from the user edit form to the app data.
   * Display an error message if the form is invalid.
   */
  function commitChanges(): boolean {
    assertWrapper(formRef.current);
    assertWrapper(stagingUser);
    if (!formRef.current.checkValidity()) {
      showFormValidityErrorMessage();
      return false;
    }
    const nextUser = stagingUser
      .setFirstName(firstNameValue)
      .setLastName(lastNameValue)
      .setNote(noteValue === "" ? undefined : noteValue);
    setStagingUser(nextUser);
    setAppData(appData.setUser(nextUser));
    return true;
  }

  /**
   * @returns true if the form can be discarded without worrying about user modifications. False otherwise.
   */
  function safeToOverrideUserEditForm(): boolean {
    if (!stagingUser) {
      return true;
    }
    const original = appData.users.get(stagingUser.id);
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
      const generatedUser = appData.generateUser("", "");
      setStagingUser(generatedUser);
    }
  }

  /**
   * Handle delete user button click event.
   */
  function handleDeleteUserButtonClick(): void {
    assertWrapper(stagingUser);
    const response = showDeleteUserDialogSync();
    switch (response) {
      case DeleteUserDialogOption.CANCEL:
        return;
      case DeleteUserDialogOption.OK:
        setAppData(appData.deleteUser(stagingUser)[0]);
        setStagingUser(null);
        return;
    }
  }

  /**
   * Handle history add button click event.
   */
  function handleHistoryAddButtonClick(): void {
    assertWrapper(stagingUser);
    assertWrapper(historyInputValue);
    const selectedBook = appData.books.get(historyInputValue);
    assertWrapper(selectedBook);
    const view = appData.generateView(
      stagingUser.id,
      selectedBook.id,
      moment.utc().valueOf()
    );
    setAppData(appData.setView(view));
    setHistoryInputValue(null);
  }

  /**
   * Handle history addition candidate change.
   */
  function handleHistoryInputValueChange(
    event: React.SyntheticEvent,
    data: DropdownProps
  ): void {
    // When cleared.
    if (data.value === "") {
      setHistoryInputValue(null);
    } else {
      assertWrapper(typeof data.value === "number");
      setHistoryInputValue(data.value);
    }
  }

  /**
   * Handle history dropdown search event.
   */
  function handelHistoryDropDownSearch(
    options: Array<DropdownItemProps>,
    query: string
  ): Array<DropdownItemProps> {
    const books = bookFuse.search(query) as Array<Book>;
    return books.map(bookToDropDownItemProps);
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
        <button type="button" onClick={handleNewUserButtonClick}>
          New User
        </button>
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
        <div>
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
            <button type="button" onClick={handleDeleteUserButtonClick}>
              Delete User
            </button>
            <button
              type="button"
              onClick={overrideUserEditForm.bind(null, stagingUser)}
            >
              Reset
            </button>
            <button type="submit">Apply</button>
          </form>
          {!isNewUserStaged && (
            <Form data-testid="history-edit-form">
              <Form.Dropdown
                label="Book"
                placeholder="Search..."
                fluid
                selection
                clearable
                value={historyInputValue ?? ""}
                onChange={handleHistoryInputValueChange}
                options={Array.from(appData.books.values()).map(
                  bookToDropDownItemProps
                )}
                search={handelHistoryDropDownSearch}
              />
              <Button
                disabled={!historyInputValue}
                positive={!!historyInputValue}
                onClick={handleHistoryAddButtonClick}
                icon="plus"
              >
                Add
              </Button>
              <Segment.Group data-testid="history-list" size="small">
                {Array.from(appData.views.values())
                  .filter(view => view.userId === stagingUser.id)
                  .map(view => {
                    const book = appData.books.get(view.bookId);
                    assertWrapper(!!book);
                    return (
                      <Segment key={view.id.toString()}>
                        {book.title} by {book.author}
                      </Segment>
                    );
                  })}
              </Segment.Group>
            </Form>
          )}
        </div>
      )}
    </div>
  );
}
