import { Serializer } from "./serializable";
import { Book, BookSerializer } from "./book";
import { User, UserSerializer } from "./user";
import { View, ViewSerializer } from "./view";
import produce, { immerable } from "immer";

export class AppData {
  [immerable] = true;

  readonly books: ReadonlyMap<number, Book>;
  readonly users: ReadonlyMap<number, User>;
  readonly views: ReadonlyMap<number, View>;

  constructor() {
    this.books = new Map();
    this.users = new Map();
    this.views = new Map();
  }
}

export class AppDataSerializer implements Serializer<AppData> {
  public serialize(target: AppData): string {
    const bookSerializer = new BookSerializer();
    const userSerializer = new UserSerializer();
    const viewSerializer = new ViewSerializer();

    const books = Array.from(target.books.values()).map(book =>
      JSON.parse(bookSerializer.serialize(book))
    );
    const users = Array.from(target.users.values()).map(user =>
      JSON.parse(userSerializer.serialize(user))
    );
    const views = Array.from(target.views.values()).map(view =>
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

    const parsedJson = JSON.parse(serializedString);

    const parsedBooks = parsedJson.books as {}[];
    const parsedUsers = parsedJson.users as {}[];
    const parsedViews = parsedJson.views as {}[];

    let ret = new AppData();
    ret = produce(ret, draft => {
      parsedBooks.forEach(x => {
        const book = bookSerializer.deserialize(JSON.stringify(x));
        draft.books.set(book.id, book);
      });
      parsedUsers.forEach(x => {
        const user = userSerializer.deserialize(JSON.stringify(x));
        draft.users.set(user.id, user);
      });
      parsedViews.forEach(x => {
        const view = viewSerializer.deserialize(JSON.stringify(x));
        draft.views.set(view.id, view);
      });
    });

    return ret;
  }
}
