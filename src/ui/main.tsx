import * as React from "react";
import { SideMenu } from "./side_menu";
import { AppData } from "../persistence/app_data";
import { ContentViewProps } from "./content_view";
import { BooksView } from "./books_view";
import { UsersView } from "./users_view";
import { QueryView } from "./query_view";

/**
 * Interface for view type array elements.
 */
interface ContentViewElementInterface {
  name: string;
  viewType: React.ComponentType<ContentViewProps>;
}

/**
 * List of Available View Types.
 */
const contentViews: ContentViewElementInterface[] = [
  {
    name: "Books",
    viewType: BooksView
  },
  {
    name: "Users",
    viewType: UsersView
  },
  {
    name: "Query",
    viewType: QueryView
  }
];

export interface State {
  appData?: AppData;
  contentViewIndex: number;
  currentFilePath?: string;
}

export class Main extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      contentViewIndex: 0
    };
  }

  render(): React.ReactNode {
    if (this.state.appData === undefined) {
      return <p>Welcome Screen</p>;
    } else {
      const contentViewElementProps: ContentViewProps = {
        appData: this.state.appData,
        setAppData: (appData): void => this.setState({ appData: appData })
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
  }

  onMenuClick(index: number): void {
    this.setState({
      contentViewIndex: index
    });
  }
}
