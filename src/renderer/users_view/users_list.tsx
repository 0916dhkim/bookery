import * as React from "react";
import { User } from "../../common/persistence/user";
import { AppDataContext } from "../app_data_context";
import { Menu } from "semantic-ui-react";
import { Filter } from "../../common/persistence/filter";
import { UserFilter } from "../../common/persistence/user_filter";

export interface UserListProps {
  filterQuery: string;
  onSelect: (user: User) => void;
}

export function UsersList({
  filterQuery,
  onSelect
}: UserListProps): React.ReactElement<UserListProps> {
  const { appData } = React.useContext(AppDataContext);
  const userFilter = React.useMemo<Filter<User>>(() => {
    return new UserFilter(appData.users.values());
  }, [appData.users]);
  const filteredUsers = React.useMemo<Array<User>>(() => {
    return Array.from(userFilter.filter(filterQuery));
  }, [userFilter, filterQuery]);

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
