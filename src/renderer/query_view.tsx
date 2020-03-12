import * as React from "react";
import { ContentViewProps } from "./content_view";
import { Book } from "../common/persistence/book";
import { User } from "../common/persistence/user";
import * as Fuse from "fuse.js";
import { AppData } from "../common/persistence/app_data";
import { assertWrapper } from "../common/assert_wrapper";

interface State {
  bookSuggestions: Book[];
  userSuggestions: User[];
  selectedBook?: Book;
  selectedUser?: User;
}

function ResultView(props: {
  bookId: number;
  userId: number;
  appData: AppData;
}): React.ReactElement {
  if (
    Array.from(props.appData.views.values()).filter(
      view => view.bookId === props.bookId && view.userId === props.userId
    ).length === 0
  ) {
    return <p>Not Read</p>;
  } else {
    return <p>Read</p>;
  }
}

export class QueryView extends React.Component<ContentViewProps, State> {
  private bookInputRef: React.RefObject<HTMLInputElement>;
  private userInputRef: React.RefObject<HTMLInputElement>;
  private bookFuse: Fuse<Book, Fuse.FuseOptions<Book>>;
  private userFuse: Fuse<User, Fuse.FuseOptions<User>>;

  constructor(props: ContentViewProps) {
    super(props);

    this.bookInputRef = React.createRef();
    this.userInputRef = React.createRef();

    const bookFuseOptions: Fuse.FuseOptions<Book> = {
      shouldSort: true,
      includeMatches: false,
      includeScore: false,
      keys: ["title", "author", "isbn"]
    };
    const userFuseOptions: Fuse.FuseOptions<User> = {
      shouldSort: true,
      includeMatches: false,
      includeScore: false,
      keys: ["lastName", "firstName", "note"]
    };
    this.bookFuse = new Fuse(
      Array.from(this.props.appData.books.values()),
      bookFuseOptions
    );
    this.userFuse = new Fuse(
      Array.from(this.props.appData.users.values()),
      userFuseOptions
    );

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
                ref={this.userInputRef}
                onInput={this.provideUserSuggestions.bind(this)}
              />
              <ul>
                {this.state.userSuggestions.map(user => (
                  <li key={user.id.toString()}>
                    <a href="#" onClick={this.selectUser.bind(this, user)}>
                      {user.lastName}, {user.firstName}: {user.note}
                    </a>
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
                ref={this.bookInputRef}
                onInput={this.provideBookSuggestions.bind(this)}
              />
              <ul>
                {this.state.bookSuggestions.map(book => (
                  <li key={book.id.toString()}>
                    <a href="#" onClick={this.selectBook.bind(this, book)}>
                      [{book.title}] by {book.author}
                    </a>
                  </li>
                ))}
              </ul>
            </label>
          </div>
        </form>
        {this.state.selectedBook && this.state.selectedUser && (
          <ResultView
            bookId={this.state.selectedBook.id}
            userId={this.state.selectedUser.id}
            appData={this.props.appData}
          />
        )}
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
  selectBook(book: Book): void {
    this.setState({
      bookSuggestions: [],
      selectedBook: book
    });
    assertWrapper(!!this.bookInputRef.current);
    this.bookInputRef.current.value = `[${book.title}] by ${book.author}`;
    this.bookInputRef.current.disabled = true;
  }
  selectUser(user: User): void {
    this.setState({
      userSuggestions: [],
      selectedUser: user
    });
    assertWrapper(!!this.userInputRef.current);
    this.userInputRef.current.value = `${user.lastName}, ${user.firstName}`;
    this.userInputRef.current.disabled = true;
  }
}
