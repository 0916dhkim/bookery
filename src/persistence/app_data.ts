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

  /**
   * Set given book into books map.
   * @param book new book
   * @returns new instance of this with set book.
   */
  setBook(book: Book): AppData {
    return produce(this, (draft): void => {
      draft.books.set(book.id, book);
    });
  }

  /**
   * Set given user into users map.
   * @param user new user
   * @returns new instance of this with set user.
   */
  setUser(user: User): AppData {
    return produce(this, (draft): void => {
      draft.users.set(user.id, user);
    });
  }

  /**
   * Set given view into views map.
   * @param view new view
   * @returns new instance of this with set view.
   */
  setView(view: View): AppData {
    return produce(this, (draft): void => {
      draft.views.set(view.id, view);
    });
  }

  /**
   * Delete a book from books map.
   * @param book book to be deleted.
   * @returns a tuple.
   *
   * First element: new instance of this without deleted book.
   *
   * Second element: `true` if the given book has been removed. `false` otherwise.
   */
  deleteBook(book: Book): [AppData, boolean] {
    let ret = false;
    const nextAppData = produce(this, (draft): void => {
      ret = draft.books.delete(book.id);
    });
    return [nextAppData, ret];
  }

  /**
   * Delete a user from users map.
   * @param user user to be deleted.
   * @returns a tuple.\
   * First element: new instance of this without deleted user.\
   * Second element: `true` if the given user has been removed. `false` otherwise.
   */
  deleteUser(user: User): [AppData, boolean] {
    let ret = false;
    const nextAppData = produce(this, (draft): void => {
      ret = draft.users.delete(user.id);
    });
    return [nextAppData, ret];
  }

  /**
   * Delete a view from views map.
   * @param view view to be deleted.
   * @returns a tuple.\
   * First element: new instance of this without deleted view.\
   * Second element: `true` if the given view has been removed. `false` otherwise.
   */
  deleteView(view: View): [AppData, boolean] {
    let ret = false;
    const nextAppData = produce(this, (draft): void => {
      ret = draft.views.delete(view.id);
    });
    return [nextAppData, ret];
  }

  /**
   * @param collection Iterable collection of objects with ID number.
   * @returns next available unique ID for given collection.
   */
  private getNextId(collection: Iterable<{ id: number }>): number {
    return Math.max(0, ...Array.from(collection).map(item => item.id)) + 1;
  }

  /**
   * Generate a new user.
   * This method does NOT alter any app data.
   * @returns generated user.
   */
  generateUser(lastName: string, firstName: string, note?: string): User {
    return new User(
      this.getNextId(this.users.values()),
      lastName,
      firstName,
      note
    );
  }

  /**
   * Generate a new book.
   * This method does NOT alter any app data.
   * @returns generated book.
   */
  generateBook(title: string, author: string, isbn?: string): Book {
    return new Book(this.getNextId(this.books.values()), title, author, isbn);
  }

  /**
   * Generate a new view.
   * This method does NOT alter any app data.
   * @returns generated view.
   */
  generateView(userId: number, bookId: number, date: number): View {
    return new View(this.getNextId(this.views.values()), userId, bookId, date);
  }

  equals(other: AppData): boolean {
    // Compare dimensions.
    if (
      this.books.size !== other.books.size ||
      this.users.size !== other.users.size ||
      this.views.size !== other.views.size
    ) {
      return false;
    }
    // Compare individual books.
    for (const [bookId, book] of this.books) {
      if (!other.books.get(bookId)?.equals(book)) {
        return false;
      }
    }
    // Compare individual users.
    for (const [userId, user] of this.users) {
      if (!other.users.get(userId)?.equals(user)) {
        return false;
      }
    }
    // Compare individual views.
    for (const [viewId, view] of this.views) {
      if (!other.views.get(viewId)?.equals(view)) {
        return false;
      }
    }
    // No difference found.
    return true;
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
