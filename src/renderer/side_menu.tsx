import * as React from "react";

export interface Props {
  contentViewNames: string[];
  onMenuClick: (menuIndex: number) => void;
}

export class SideMenu extends React.Component<Props, {}> {
  render(): React.ReactNode {
    return (
      <nav className="js-side-menu">
        <a>Navigation</a>
        <ul>
          {this.props.contentViewNames.map((name, index) => (
            <li key={index.toString()}>
              <a
                href="#"
                onClick={(() => this.props.onMenuClick(index)) as () => void}
              >
                {name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }
}
