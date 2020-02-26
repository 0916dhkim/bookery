import * as React from "react";
import * as Fuse from "fuse.js";
import { User } from "../../persistence/user";
import { AppDataContext } from "../app_data_context";
import { Menu } from "semantic-ui-react";

export interface UserListProps {
  filterQuery: string;
  onSelect: (user: User) => void;
}

export function UsersList({
  filterQuery,
  onSelect
}: UserListProps): React.ReactElement<UserListProps> {
  const { appData } = React.useContext(AppDataContext);
  /**
   * Filtered array of users by search term.
   * When there is no search term input by user, no filter is applied.
   */
  const filteredUsers = React.useMemo<ReadonlyArray<User>>((): ReadonlyArray<
    User
  > => {
    if (filterQuery.length === 0) {
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
    return filterFuse.search(filterQuery) as User[];
  }, [filterQuery, appData]);

  return (
    <Menu data-testid="suggestions-list" fluid vertical>
      {filteredUsers.map(user => (
        <Menu.Item key={user.id.toString()} onClick={onSelect.bind(null, user)}>
          {user.lastName}, {user.firstName}: {user.note}
        </Menu.Item>
      ))}
    </Menu>
  );
}
