import * as React from "react";
import { SideMenu } from "./side_menu";
import { ContentPanel } from "./content_panel";

export class Main extends React.Component<{}, {}> {
  render(): React.ReactNode {
    return (
      <div className="js-main">
        <SideMenu />
        <ContentPanel />
      </div>
    );
  }
}
