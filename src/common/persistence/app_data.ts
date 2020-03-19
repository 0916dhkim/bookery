import { Book } from "./book";
import { User } from "./user";
import { View } from "./view";
import { produce } from "./immer-initialized";

export interface AppData {
  books: Map<number, Book>;
  users: Map<number, User>;
  views: Map<number, View>;
}

function getNextId(collection: Iterable<{ id: number }>): number {
  return Math.max(0, ...Array.from(collection).map(e => e.id)) + 1;
}

export function addBook(
  appData: AppData,
  title: string,
  author: string,
  isbn?: string
): [AppData, Book] {
  const book = {
    id: getNextId(appData.books.values()),
    title: title,
    author: author,
    isbn: isbn
  };
  const nextAppData = produce(appData, draft => {
    draft.books.set(book.id, book);
  });
  return [nextAppData, book];
}

export function addUser(
  appData: AppData,
  lastName: string,
  firstName: string,
  note?: string
): [AppData, User] {
  const user = {
    id: getNextId(appData.users.values()),
    lastName: lastName,
    firstName: firstName,
    note: note
  };
  const nextAppData = produce(appData, draft => {
    draft.users.set(user.id, user);
  });
  return [nextAppData, user];
}

export function addView(
  appData: AppData,
  userId: number,
  bookId: number,
  date: number
): [AppData, View] {
  const view = {
    id: getNextId(appData.views.values()),
    userId: userId,
    bookId: bookId,
    date: date
  };
  const nextAppData = produce(appData, draft => {
    draft.views.set(view.id, view);
  });
  return [nextAppData, view];
}

export function updateBook(appData: AppData, book: Book): AppData {
  return produce(appData, draft => {
    draft.books.set(book.id, book);
  });
}

export function updateUser(appData: AppData, user: User): AppData {
  return produce(appData, draft => {
    draft.users.set(user.id, user);
  });
}

export function updateView(appData: AppData, view: View): AppData {
  return produce(appData, draft => {
    draft.views.set(view.id, view);
  });
}

export function deleteBook(
  appData: AppData,
  bookId: number
): [AppData, boolean] {
  if (!appData.books.has(bookId)) {
    return [appData, false];
  }
  return [
    produce(appData, draft => {
      draft.books.delete(bookId);
      // Cascade views.
      Array.from(draft.views.values())
        .filter(view => view.bookId === bookId)
        .forEach(view => draft.views.delete(view.id));
    }),
    true
  ];
}

export function deleteUser(
  appData: AppData,
  userId: number
): [AppData, boolean] {
  if (!appData.users.has(userId)) {
    return [appData, false];
  }
  return [
    produce(appData, draft => {
      draft.users.delete(userId);
      // Cascade views.
      Array.from(draft.views.values())
        .filter(view => view.userId === userId)
        .forEach(view => draft.views.delete(view.id));
    }),
    true
  ];
}

export function deleteView(
  appData: AppData,
  viewId: number
): [AppData, boolean] {
  if (!appData.views.has(viewId)) {
    return [appData, false];
  }
  return [
    produce(appData, draft => {
      draft.views.delete(viewId);
    }),
    true
  ];
}

interface PlainAppData {
  books: Array<Book>;
  users: Array<User>;
  views: Array<View>;
}

export function createAppData(): AppData;
export function createAppData(plain: PlainAppData): AppData | null;
export function createAppData(plain?: PlainAppData): AppData | null {
  if (!plain) {
    return {
      books: new Map(),
      users: new Map(),
      views: new Map()
    };
  }

  return {
    books: new Map(plain.books.map(book => [book.id, book])),
    users: new Map(plain.users.map(user => [user.id, user])),
    views: new Map(plain.views.map(view => [view.id, view]))
  };
}

export function serializeAppData(appData: AppData): string {
  const plain: PlainAppData = {
    books: Array.from(appData.books.values()),
    users: Array.from(appData.users.values()),
    views: Array.from(appData.views.values())
  };

  return JSON.stringify(plain);
}

export function deserializeAppData(s: string): AppData | null {
  try {
    const plain = JSON.parse(s) as PlainAppData;
    return createAppData(plain);
  } catch {
    return null;
  }
}
