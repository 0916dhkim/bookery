import * as React from "react";
import {
  ModifiedDialogOption,
  showModifiedDialogSync as defaultShowModifiedDialogSync
} from "../modified_dialog";
import {
  DeleteUserDialogOption,
  showDeleteUserDialogSync as defaultShowDeleteUserDialogSync
} from "../delete_user_dialog";
import { showFormValidityErrorMessage } from "../form_validity_error_message";
import { User } from "../../persistence/user";
import { AppDataContext } from "../app_data_context";
import { assertWrapper } from "../../assert_wrapper";
import { UsersList } from "./users_list";
import { UserEditForm } from "./user_edit_form";
import { HistoryEditForm } from "./history_edit_form";
import {
  Container,
  Button,
  Grid,
  Segment,
  Icon,
  Input
} from "semantic-ui-react";

export interface UsersViewProps {
  showModifiedDialogSync?: () => ModifiedDialogOption;
  showDeleteUserDialogSync?: () => DeleteUserDialogOption;
  children?: React.ReactNode;
}

export function UsersView({
  showModifiedDialogSync = defaultShowModifiedDialogSync,
  showDeleteUserDialogSync = defaultShowDeleteUserDialogSync
}: UsersViewProps): React.ReactElement<UsersViewProps> {
  const { appData, setAppData } = React.useContext(AppDataContext);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [stagedUser, setStagedUser] = React.useState<User | null>(null);
  const [filterValue, setFilterValue] = React.useState<string>("");

  const isNewUser = React.useMemo<boolean>(() => {
    return !!selectedUser && !appData.users.has(selectedUser.id);
  }, [appData, selectedUser]);

  /**
   * Commit staged user into app data.
   * @returns `true` if user is commited. `false` otherwise.
   */
  function commitStagedUser(): boolean {
    if (!stagedUser) {
      showFormValidityErrorMessage();
      return false;
    }

    setSelectedUser(stagedUser);
    setAppData(appData.setUser(stagedUser));
    return true;
  }

  /**
   * @returns true if the form can be discarded without worrying about user modifications. False otherwise.
   */
  function checkIfSafeToOverrideUserEditForm(): boolean {
    if (!selectedUser) {
      return true;
    }
    let needToAsk = false;
    if (!stagedUser) {
      needToAsk = true;
    } else {
      assertWrapper(selectedUser.id === stagedUser.id);
      if (
        selectedUser.firstName !== stagedUser.firstName ||
        selectedUser.lastName !== stagedUser.lastName ||
        selectedUser.note !== stagedUser.note
      ) {
        // User form modified.
        needToAsk = true;
      }
    }

    if (needToAsk) {
      const response: ModifiedDialogOption = showModifiedDialogSync();
      switch (response) {
        case ModifiedDialogOption.CANCEL:
          return false;
        case ModifiedDialogOption.SAVE:
          return commitStagedUser();
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
    if (checkIfSafeToOverrideUserEditForm()) {
      setSelectedUser(user);
    }
  }

  /**
   * Handle new user button click event.
   */
  function handleNewUserButtonClick(): void {
    if (checkIfSafeToOverrideUserEditForm()) {
      const generatedUser = appData.generateUser("", "");
      setSelectedUser(generatedUser);
    }
  }

  /**
   * Handle delete user button click event.
   */
  function handleDeleteUserButtonClick(): void {
    assertWrapper(selectedUser);
    const response = showDeleteUserDialogSync();
    switch (response) {
      case DeleteUserDialogOption.CANCEL:
        return;
      case DeleteUserDialogOption.OK:
        setAppData(appData.deleteUser(selectedUser)[0]);
        setSelectedUser(null);
        return;
    }
  }

  return (
    <Container fluid>
      Users View
      <div style={{ display: "flex", margin: "1em 0" }}>
        {/* Search Bar */}
        <Input
          type="text"
          icon="search"
          value={filterValue}
          onChange={(event): void => {
            setFilterValue(event.target.value);
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
          <UsersList filterQuery={filterValue} onSelect={handleUserClick} />
        </Grid.Column>
        {selectedUser && (
          <Grid.Column width={8}>
            {/* User Edit Form */}
            <UserEditForm
              user={selectedUser}
              onCommit={commitStagedUser}
              onChange={setStagedUser}
            />
            {!isNewUser && <HistoryEditForm user={selectedUser} />}
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
