import { Serializer } from "./serializable";
import { Book, BookSerializer } from "./book";
import { User, UserSerializer } from "./user";
import { View, ViewSerializer } from "./view";

export class AppData {
  private _books: Book[];
  get books(): Book[] {
    return this._books;
  }

  private _users: User[];
  get users(): User[] {
    return this._users;
  }

  private _views: View[];
  get views(): View[] {
    return this._views;
  }

  constructor() {
    this._books = [];
    this._users = [];
    this._views = [];
  }
}

export class AppDataSerializer implements Serializer<AppData> {
  public serialize(target: AppData): string {
    const bookSerializer = new BookSerializer();
    const userSerializer = new UserSerializer();
    const viewSerializer = new ViewSerializer();

    const books = target.books.map(book =>
      JSON.parse(bookSerializer.serialize(book))
    );
    const users = target.users.map(user =>
      JSON.parse(userSerializer.serialize(user))
    );
    const views = target.views.map(view =>
      JSON.parse(viewSerializer.serialize(view))
    );

    return JSON.stringify({
      books: books,
      users: users,
      views: views
    });
  }

  public deserialize(serializedString: string): AppData {
    const bookSerializer = new BookSerializer();
    const userSerializer = new UserSerializer();
    const viewSerializer = new ViewSerializer();

    const ret = new AppData();

    const parsedJson = JSON.parse(serializedString);

    const parsedBooks = parsedJson.books as {}[];
    const parsedUsers = parsedJson.users as {}[];
    const parsedViews = parsedJson.views as {}[];

    ret.books.push(
      ...parsedBooks.map(x => bookSerializer.deserialize(JSON.stringify(x)))
    );
    ret.users.push(
      ...parsedUsers.map(x => userSerializer.deserialize(JSON.stringify(x)))
    );
    ret.views.push(
      ...parsedViews.map(x => viewSerializer.deserialize(JSON.stringify(x)))
    );

    return ret;
  }
}
