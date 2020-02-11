import * as React from "react";
import { ContentViewProps } from "./content_view";
import { Book } from "../persistence/book";
import { User } from "../persistence/user";

interface State {
  bookSuggestions: Book[];
  userSuggestions: User[];
}

export class QueryView extends React.Component<ContentViewProps, {}> {
  private userInputRef: React.RefObject<HTMLInputElement>;
  private bookInputRef: React.RefObject<HTMLInputElement>;
  constructor(props: ContentViewProps) {
    super(props);
    this.userInputRef = React.createRef();
    this.bookInputRef = React.createRef();
    this.state = {
      bookSuggestions: [],
      userSuggestions: []
    };
  }

  render(): React.ReactNode {
    return (
      <div className="js-query-view">
        <form>
          <div>
            <label>
              Member
              <input type="text" ref={this.userInputRef} />
            </label>
          </div>
          <div>
            <label>
              Book
              <input type="text" ref={this.bookInputRef} />
            </label>
          </div>
        </form>
      </div>
    );
  }
}
