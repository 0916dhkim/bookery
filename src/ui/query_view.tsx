import * as React from "react";
import { ContentViewProps } from "./content_view";
import { Book } from "../persistence/book";
import { User } from "../persistence/user";
import * as Fuse from "fuse.js";

interface State {
  bookSuggestions: Book[];
  userSuggestions: User[];
}

export class QueryView extends React.Component<ContentViewProps, State> {
  private bookFuse: Fuse<Book, Fuse.FuseOptions<Book>>;
  private userFuse: Fuse<User, Fuse.FuseOptions<User>>;

  constructor(props: ContentViewProps) {
    super(props);

    const bookFuseOptions: Fuse.FuseOptions<Book> = {
      keys: ["title", "author", "isbn"]
    };
    const userFuseOptions: Fuse.FuseOptions<User> = {
      keys: ["lastName", "firstName", "note"]
    };
    this.bookFuse = new Fuse(this.props.appData.books, bookFuseOptions);
    this.userFuse = new Fuse(this.props.appData.users, userFuseOptions);

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
              <input
                type="text"
                onInput={this.provideUserSuggestions.bind(this)}
              />
              <ul>
                {this.state.userSuggestions.map(user => (
                  <li key={user.id.toString()}>
                    {user.lastName}, {user.firstName}: {user.note}
                  </li>
                ))}
              </ul>
            </label>
          </div>
          <div>
            <label>
              Book
              <input
                type="text"
                onInput={this.provideBookSuggestions.bind(this)}
              />
              <ul>
                {this.state.bookSuggestions.map(book => (
                  <li key={book.id.toString()}>
                    [{book.title}] by {book.author}
                  </li>
                ))}
              </ul>
            </label>
          </div>
        </form>
      </div>
    );
  }

  provideBookSuggestions(event: React.FormEvent<HTMLInputElement>): void {
    this.setState({
      bookSuggestions: this.bookFuse.search(event.currentTarget.value) as Book[]
    });
  }
  provideUserSuggestions(event: React.FormEvent<HTMLInputElement>): void {
    this.setState({
      userSuggestions: this.userFuse.search(event.currentTarget.value) as User[]
    });
  }
}
