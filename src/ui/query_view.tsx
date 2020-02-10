import * as React from "react";
import { ContentViewProps } from "./content_view";

export class QueryView extends React.Component<ContentViewProps, {}> {
  render(): React.ReactNode {
    return <div className="js-query-view"> Query View</div>;
  }
}
