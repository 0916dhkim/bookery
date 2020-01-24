import * as React from "react";
import { SideMenu } from "./side_menu";
import { ContentPanel } from "./content_panel";
import { ContentViewType } from "./content_view";

export interface State {
  contentViewTypeName: ContentViewType;
}

export class Main extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = { contentViewTypeName: ContentViewType.BOOKS_VIEW };
  }
  render(): React.ReactNode {
    return (
      <div className="js-main">
        <SideMenu onMenuClick={this.onMenuClick.bind(this)} />
        <ContentPanel contentViewType={this.state.contentViewTypeName} />
      </div>
    );
  }

  onMenuClick(contentViewTypeName: ContentViewType): void {
    this.setState({
      contentViewTypeName: contentViewTypeName
    });
  }
}
