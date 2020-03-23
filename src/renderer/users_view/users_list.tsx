import * as React from "react";
import { User } from "../../common/persistence/user";
import { AppDataContext } from "../app_data_context";
import { Menu } from "semantic-ui-react";
import { filterUser } from "../../common/persistence/filter_user";

export interface UserListProps {
  filterQuery: string;
  onSelect: (user: User) => void;
}

export function UsersList({
  filterQuery,
  onSelect
}: UserListProps): React.ReactElement<UserListProps> {
  const { appData } = React.useContext(AppDataContext);
  const filteredUsers = React.useMemo<Array<User>>(() => {
    return Array.from(filterUser(appData, filterQuery));
  }, [appData, filterQuery]);

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
