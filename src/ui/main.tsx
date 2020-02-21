import * as React from "react";
import { SideMenu } from "./side_menu";
import { AppData } from "../persistence/app_data";
import { BooksView } from "./books_view";
import { UsersView } from "./users_view";
import { QueryView } from "./query_view";
import { AppDataContext } from "./app_data_context";
import { ContentViewProps } from "./content_view";

/**
 * Interface for view type array elements.
 */
interface ContentViewElementInterface {
  name: string;
  viewType: React.ComponentType;
}

/**
 * Wrap a component type that requires app data as its props and provide app data context instead.
 * @param T Component type to be wrapped
 */
function wrap(
  T: React.ComponentType<ContentViewProps>
): React.FunctionComponent {
  return (): React.ReactElement => {
    const { appData, setAppData } = React.useContext(AppDataContext);
    const wrappedComponent = React.createElement(T, {
      appData: appData,
      setAppData: setAppData
    });
    return <div>{wrappedComponent}</div>;
  };
}

/**
 * List of Available View Types.
 */
const contentViews: ContentViewElementInterface[] = [
  {
    name: "Books",
    viewType: wrap(BooksView)
  },
  {
    name: "Users",
    viewType: UsersView
  },
  {
    name: "Query",
    viewType: wrap(QueryView)
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
      return (
        <div className="js-main">
          <SideMenu
            contentViewNames={contentViews.map(contentView => contentView.name)}
            onMenuClick={this.onMenuClick.bind(this)}
          />
          <AppDataContext.Provider
            value={{
              appData: this.state.appData,
              setAppData: (x: AppData): void => {
                this.setState({ appData: x });
              }
            }}
          >
            {React.createElement(
              contentViews[this.state.contentViewIndex].viewType
            )}
          </AppDataContext.Provider>
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
