import * as React from "react";
import { ContentViewProps } from "./content_view";

export class UsersView extends React.Component<ContentViewProps, {}> {
  static readonly title: string = "Users";
  render(): React.ReactNode {
    return <div className="js-users-view">Users View</div>;
  }
}
