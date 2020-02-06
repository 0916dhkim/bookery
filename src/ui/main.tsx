import * as React from "react";
import { SideMenu } from "./side_menu";
import { AppData } from "../persistence/app_data";
import { ContentViewProps } from "./content_view";
import { BooksView } from "./books_view";
import { UsersView } from "./users_view";

interface ContentViewElementInterface {
  name: string;
  viewType: new (props: ContentViewProps) => React.Component<
    ContentViewProps,
    {}
  >;
}

const contentViews: ContentViewElementInterface[] = [
  {
    name: "Books",
    viewType: BooksView
  },
  {
    name: "Users",
    viewType: UsersView
  }
];

export interface State {
  appData: AppData;
  contentViewIndex: number;
}

export class Main extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      appData: new AppData(),
      contentViewIndex: 0
    };
  }

  render(): React.ReactNode {
    const contentViewElementProps: ContentViewProps = {
      appData: this.state.appData
    };
    const contentViewElement = React.createElement(
      contentViews[this.state.contentViewIndex].viewType,
      contentViewElementProps
    );
    return (
      <div className="js-main">
        <SideMenu
          contentViewNames={contentViews.map(contentView => contentView.name)}
          onMenuClick={this.onMenuClick.bind(this)}
        />
        {contentViewElement}
      </div>
    );
  }

  onMenuClick(index: number): void {
    this.setState({
      contentViewIndex: index
    });
  }
}
