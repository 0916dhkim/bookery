import * as React from "react";
import { ContentView } from "./content_view";

export interface Props {
  onMenuClick: (contentViewType: typeof ContentView) => void;
}

export class SideMenu extends React.Component<Props, {}> {
  render(): React.ReactNode {
    return (
      <nav className="js-side-menu">
        <a>Navigation</a>
        <ul>
          {Array.from(ContentView.sideMenuEntries).map(contentViewType => (
            <li key={contentViewType.title}>
              <a
                href="#"
                onClick={
                  (() => this.props.onMenuClick(contentViewType)) as () => void
                }
              >
                {contentViewType.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }
}
