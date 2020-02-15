import * as React from "react";
import { ContentViewProps } from "./content_view";
import { Book } from "../persistence/book";
import { User } from "../persistence/user";
import * as Fuse from "fuse.js";
import { AppData } from "../persistence/app_data";

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
    props.appData.views.filter(
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
    this.bookInputRef.current.value = `[${book.title}] by ${book.author}`;
    this.bookInputRef.current.disabled = true;
  }
  selectUser(user: User): void {
    this.setState({
      userSuggestions: [],
      selectedUser: user
    });
    this.userInputRef.current.value = `${user.lastName}, ${user.firstName}`;
    this.userInputRef.current.disabled = true;
  }
}