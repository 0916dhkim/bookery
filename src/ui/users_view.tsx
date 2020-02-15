import * as React from "react";
import { ContentViewProps } from "./content_view";
import { User } from "../persistence/user";

interface State {
  activeUser?: User;
}

export class UsersView extends React.Component<ContentViewProps, State> {
  static readonly title: string = "Users";
  render(): React.ReactNode {
    return (
      <div className="js-users-view">
        Users View
        <ul>
          {this.props.appData.users.map(user => (
            <li key={user.id.toString()}>
              <a href="#">
                {user.lastName}, {user.firstName}: {user.note}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
