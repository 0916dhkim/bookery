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
  Input
} from "semantic-ui-react";
import { RequestContext } from "../request_context";

export function UsersView(): React.ReactElement<{}> {
  const { appData, setAppData } = React.useContext(AppDataContext);
  const { request } = React.useContext(RequestContext);
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
  async function commitStagedUser(): Promise<boolean> {
    if (!stagedUser) {
      await request({
        type: "SHOW-ERROR-MESSAGE",
        title: "Forms Error",
        message: "Cannot save invalid forms."
      });
      return false;
    }

    setSelectedUser(stagedUser);
    setAppData(appData.setUser(stagedUser));
    return true;
  }

  /**
   * @returns true if the form can be discarded without worrying about user modifications. False otherwise.
   */
  async function checkIfSafeToOverrideUserEditForm(): Promise<boolean> {
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
      setSelectedUser(user);
    }
  }

  /**
   * Handle new user button click event.
   */
  async function handleNewUserButtonClick(): Promise<void> {
    if (await checkIfSafeToOverrideUserEditForm()) {
      const generatedUser = appData.generateUser("", "");
      setSelectedUser(generatedUser);
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
        assertWrapper(selectedUser);
        let nextAppData = appData.deleteUser(selectedUser)[0];
        Array.from(appData.views.values())
          .filter(view => view.userId === selectedUser.id)
          .forEach(view => {
            nextAppData = nextAppData.deleteView(view)[0];
          });
        setAppData(nextAppData);
        setSelectedUser(null);
        return null;
      }
    }[warningResponse]);
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