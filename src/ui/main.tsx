import * as React from "react";
import { SideMenu } from "./side_menu";
import { ContentPanel } from "./content_panel";
import { ContentView } from "./content_view";
import { AppData } from "../persistence/app_data";
import { BooksView } from "./books_view";

export interface State {
  contentViewType: typeof ContentView;
  appData: AppData;
}

export class Main extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      contentViewType: BooksView,
      appData: new AppData()
    };
  }

  render(): React.ReactNode {
    return (
      <div className="js-main">
        <SideMenu onMenuClick={this.onMenuClick.bind(this)} />
        <ContentPanel
          contentViewType={this.state.contentViewType}
          appData={this.state.appData}
        />
      </div>
    );
  }

  onMenuClick(contentViewType: typeof ContentView): void {
    this.setState({
      contentViewType: contentViewType
    });
  }
}
