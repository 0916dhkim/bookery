import * as React from "react";
import { ContentView, Props as ContentViewProps } from "./content_view";
import { AppData } from "../persistence/app_data";

export interface Props {
  contentViewType: typeof ContentView;
  appData: AppData;
}

export class ContentPanel extends React.Component<Props, {}> {
  render(): React.ReactNode {
    const contentPanelProps: ContentViewProps = {
      appData: this.props.appData
    };
    const contentPanel = React.createElement(
      this.props.contentViewType,
      contentPanelProps
    );
    return <div className="js-content-panel">Content Panel{contentPanel}</div>;
  }
}
