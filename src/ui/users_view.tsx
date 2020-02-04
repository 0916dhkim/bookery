import * as React from "react";
import { ContentView } from "./content_view";

export class UsersView extends ContentView {
  static readonly title: string = "Users";
  render(): React.ReactNode {
    return <div className="js-users-view">Users View</div>;
  }
}

ContentView.sideMenuEntries.add(UsersView);
