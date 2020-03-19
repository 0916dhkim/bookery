import * as React from "react";
import { User } from "../../common/persistence/user";
import { AppDataContext } from "../app_data_context";
import { assertWrapper } from "../../common/assert_wrapper";
import { UsersList } from "./users_list";
import { UserEditForm } from "./user_edit_form";
import { HistoryEditForm } from "./history_edit_form";
import {
  Container,
  Button,
  Grid,
  Segment,
  Icon,
  Input,
  Message
} from "semantic-ui-react";
import { RequestContext } from "../request_context";
import {
  addUser,
  updateUser,
  deleteUser
} from "../../common/persistence/app_data";
import { produce } from "../../common/persistence/immer-initialized";

export interface UsersViewState {
  selectedUser: User | null;
  editingNewUser: boolean;
  firstNameField: string;
  lastNameField: string;
  noteField: string;
  filterValue: string;
}

type UsersViewAction =
  | { type: "New User" }
  | { type: "Close User Editor" }
  | { type: "Select User"; user: User }
  | { type: "Change First Name"; firstName: string }
  | { type: "Change Last Name"; lastName: string }
  | { type: "Change Note"; note: string }
  | { type: "Change Filter"; filter: string };

function reducer(
  state: UsersViewState,
  action: UsersViewAction
): UsersViewState {
  switch (action.type) {
    case "New User":
      return produce(state, draft => {
        draft.selectedUser = null;
        draft.editingNewUser = true;
        draft.firstNameField = "";
        draft.lastNameField = "";
        draft.noteField = "";
      });
    case "Close User Editor":
      return produce(state, draft => {
        draft.selectedUser = null;
        draft.editingNewUser = false;
      });
    case "Select User":
      return produce(state, draft => {
        draft.selectedUser = action.user;
        draft.editingNewUser = false;
        draft.firstNameField = action.user.firstName;
        draft.lastNameField = action.user.lastName;
        draft.noteField = action.user.note ?? "";
      });
    case "Change First Name":
      return produce(state, draft => {
        draft.firstNameField = action.firstName;
      });
    case "Change Last Name":
      return produce(state, draft => {
        draft.lastNameField = action.lastName;
      });
    case "Change Note":
      return produce(state, draft => {
        draft.noteField = action.note;
      });
    case "Change Filter":
      return produce(state, draft => {
        draft.filterValue = action.filter;
      });
  }
}

export function UsersView(): React.ReactElement<{}> {
  const { appData, setAppData } = React.useContext(AppDataContext);
  const { request } = React.useContext(RequestContext);
  const [state, dispatch] = React.useReducer(reducer, {
    selectedUser: null,
    editingNewUser: false,
    firstNameField: "",
    lastNameField: "",
    noteField: "",
    filterValue: ""
  });

  // Validate First Name.
  const firstNameError = React.useMemo<string | null>(() => {
    if (state.firstNameField.length === 0) {
      return "Please enter first name";
    }
    return null;
  }, [state.firstNameField]);

  // Validate Last Name.
  const lastNameError = React.useMemo<string | null>(() => {
    if (state.lastNameField.length === 0) {
      return "Please enter last name";
    }
    return null;
  }, [state.lastNameField]);

  const isValid = React.useMemo<boolean>(() => {
    return firstNameError === null && lastNameError === null;
  }, [firstNameError, lastNameError]);

  /**
   * `true` if form fields are modified.
   * `false` otherwise.
   */
  const isModified = React.useMemo<boolean>(() => {
    if (!state.selectedUser) {
      return state.editingNewUser;
    }

    if (
      state.firstNameField !== state.selectedUser.firstName ||
      state.lastNameField !== state.selectedUser.lastName ||
      state.noteField !== (state.selectedUser.note ?? "")
    ) {
      return true;
    }
    return false;
  }, [
    state.selectedUser,
    state.editingNewUser,
    state.firstNameField,
    state.lastNameField,
    state.noteField
  ]);

  /**
   * `true` if there is any existing user in app data that has
   * the same name as the user being edited.
   * `false` otherwise.
   */
  const hasExistingUserWithSameName = React.useMemo<boolean>(() => {
    for (const u of appData.users.values()) {
      if (
        state.firstNameField === u.firstName &&
        state.lastNameField === u.lastName &&
        (state.editingNewUser || state.selectedUser?.id !== u.id)
      ) {
        return true;
      }
    }
    return false;
  }, [
    appData.users,
    state.firstNameField,
    state.lastNameField,
    state.editingNewUser,
    state.selectedUser
  ]);

  /**
   * Commit staged user into app data.
   * @returns `true` if user is commited. `false` otherwise.
   */
  async function commitStagedUser(): Promise<boolean> {
    if (!isValid) {
      await request({
        type: "SHOW-ERROR-MESSAGE",
        title: "Forms Error",
        message: "Cannot save invalid forms."
      });
      return false;
    }

    const formValues = {
      firstName: state.firstNameField,
      lastName: state.lastNameField,
      note: state.noteField
    };

    if (state.selectedUser) {
      // Committing an existing user.
      const nextSelectedUser: User = {
        id: state.selectedUser?.id,
        ...formValues
      };
      setAppData(updateUser(appData, nextSelectedUser));
      dispatch({ type: "Select User", user: nextSelectedUser });
    } else {
      // Committing a new user.
      const [nextAppData, nextSelectedUser] = addUser(
        appData,
        formValues.lastName,
        formValues.firstName,
        formValues.note === "" ? undefined : formValues.note
      );
      setAppData(nextAppData);
      dispatch({ type: "Select User", user: nextSelectedUser });
    }
    return true;
  }

  /**
   * @returns true if the form can be discarded without worrying about user modifications. False otherwise.
   */
  async function checkIfSafeToOverrideUserEditForm(): Promise<boolean> {
    if (isModified) {
      // User form modified.
      // Ask for user permission.
      const warningResponse = await request({
        type: "SHOW-OVERRIDE-WARNING",
        message: "Do you want to save changes?"
      });
      return await {
        Cancel: (): boolean => false,
        "Don't Save": (): boolean => true,
        Save: async (): Promise<boolean> => {
          return commitStagedUser();
        }
      }[warningResponse]();
    } else {
      return true;
    }
  }

  /**
   * Handle user list element click event.
   * @param user Clicked user.
   */
  async function handleUserClick(user: User): Promise<void> {
    if (await checkIfSafeToOverrideUserEditForm()) {
      dispatch({ type: "Select User", user: user });
    }
  }

  /**
   * Handle new user button click event.
   */
  async function handleNewUserButtonClick(): Promise<void> {
    if (await checkIfSafeToOverrideUserEditForm()) {
      dispatch({ type: "New User" });
    }
  }

  /**
   * Handle delete user button click event.
   */
  async function handleDeleteUserButtonClick(): Promise<void> {
    const warningResponse = await request({
      type: "SHOW-WARNING-MESSAGE",
      message: "Do you really want to delete this user?"
    });
    ({
      get Cancel(): null {
        return null;
      },
      get OK(): null {
        if (state.selectedUser) {
          const [nextAppData] = deleteUser(appData, state.selectedUser.id);
          setAppData(nextAppData);
        }
        dispatch({ type: "Close User Editor" });
        return null;
      }
    }[warningResponse]);
  }

  /**
   * Handle reset button click event.
   */
  function handleResetButtonClick(): void {
    if (state.editingNewUser) {
      dispatch({ type: "New User" });
    } else {
      assertWrapper(state.selectedUser);
      dispatch({ type: "Select User", user: state.selectedUser });
    }
  }

  return (
    <Container fluid>
      <div style={{ display: "flex", margin: "1em 0" }}>
        {/* Search Bar */}
        <Input
          type="text"
          icon="search"
          value={state.filterValue}
          onChange={(event): void => {
            dispatch({ type: "Change Filter", filter: event.target.value });
          }}
          style={{
            flexGrow: 1
          }}
        />
        <Button
          positive
          icon
          labelPosition="left"
          onClick={handleNewUserButtonClick}
          style={{
            marginLeft: "1em",
            flexGrow: 0
          }}
        >
          <Icon name="plus circle" />
          New User
        </Button>
      </div>
      <Grid divided="vertically">
        <Grid.Column width={8}>
          {/* Users List */}
          <UsersList
            filterQuery={state.filterValue}
            onSelect={handleUserClick}
          />
        </Grid.Column>
        {(state.selectedUser || state.editingNewUser) && (
          <Grid.Column width={8}>
            {/* Existing User Warning */}
            {hasExistingUserWithSameName && (
              <Message>
                There is a user with the same name as the user that is being
                edited.
              </Message>
            )}
            {/* User Edit Form */}
            <UserEditForm
              lastName={state.lastNameField}
              onLastNameChange={(lastName): void =>
                dispatch({ type: "Change Last Name", lastName: lastName })
              }
              lastNameError={lastNameError}
              firstName={state.firstNameField}
              onFirstNameChange={(firstName): void =>
                dispatch({ type: "Change First Name", firstName: firstName })
              }
              firstNameError={firstNameError}
              note={state.noteField}
              onNoteChange={(note): void =>
                dispatch({ type: "Change Note", note: note })
              }
              onCommit={commitStagedUser}
              onReset={handleResetButtonClick}
            />
            {!state.editingNewUser && state.selectedUser && (
              <HistoryEditForm user={state.selectedUser} />
            )}
            <Segment basic>
              <Button
                data-testid="user-delete-button"
                negative
                icon
                labelPosition="left"
                onClick={handleDeleteUserButtonClick}
              >
                <Icon name="exclamation triangle" />
                Delete User
              </Button>
            </Segment>
          </Grid.Column>
        )}
      </Grid>
    </Container>
  );
}
