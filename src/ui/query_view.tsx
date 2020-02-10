import * as React from "react";
import { ContentViewProps } from "./content_view";

export class QueryView extends React.Component<ContentViewProps, {}> {
  render(): React.ReactNode {
    return (
      <div className="js-query-view">
        <form>
          <div>
            <label>
              Member
              <input type="text" />
            </label>
          </div>
          <div>
            <label>
              Book
              <input type="text" />
            </label>
          </div>
        </form>
      </div>
    );
  }
}
