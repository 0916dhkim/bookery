import * as React from "react";
import { ContentViewType } from "./content_view";

export interface Props {
  onMenuClick: (contentViewTypeName: ContentViewType) => void;
}

export class SideMenu extends React.Component<Props, {}> {
  render(): React.ReactNode {
    return (
      <nav className="js-side-menu">
        <a>Navigation</a>
        <ul>
          {Object.values(ContentViewType).map(v => (
            <li key={v}>
              <a
                href="#"
                onClick={(() => this.props.onMenuClick(v)) as () => void}
              >
                {v}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }
}
