import * as React from "react";
import { ContentViewProps } from "./content_view";
import { User } from "../persistence/user";
import { UserEditForm } from "./user_edit_form";

interface State {
  activeUser?: User;
}

export class UsersView extends React.Component<ContentViewProps, State> {
  static readonly title: string = "Users";

  private userEditFormRef: React.RefObject<UserEditForm>;

  constructor(props: ContentViewProps) {
    super(props);
    this.state = {};

    this.userEditFormRef = React.createRef();
  }

  render(): React.ReactNode {
    return (
      <div className="js-users-view">
        Users View
        <ul>
          {this.props.appData.users.map(user => (
            <li key={user.id.toString()}>
              <a onClick={this.setActiveUser.bind(this, user)}>
                {user.lastName}, {user.firstName}: {user.note}
              </a>
            </li>
          ))}
        </ul>
        {this.state.activeUser && (
          <UserEditForm
            user={this.state.activeUser}
            ref={this.userEditFormRef}
          />
        )}
      </div>
    );
  }

  setActiveUser(user: User): void {
    this.setState({ activeUser: user }, (): void =>
      this.userEditFormRef.current.resetForm()
    );
  }
}
