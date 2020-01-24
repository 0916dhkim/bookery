import * as React from "react";
import { ContentViewType, nameToType } from "./content_view";

export interface Props {
  contentViewType: ContentViewType;
}

export class ContentPanel extends React.Component<Props, {}> {
  render(): React.ReactNode {
    const content = React.createElement(nameToType(this.props.contentViewType));
    return <div className="js-content-panel">Content Panel{content}</div>;
  }
}
