import { Book } from "./book";
import { User } from "./user";
import { View } from "./view";
import { produce } from "./immer-initialized";
import { Tag } from "./tag";
import { assertWrapper } from "../assert_wrapper";

export interface AppData {
  /**
   * Map book ID to a book
   */
  books: Map<number, Book>;
  /**
   * Map user ID to a user
   */
  users: Map<number, User>;
  /**
   * Map view ID to a view
   */
  views: Map<number, View>;
  /**
   * Map tag ID to a tag
   */
  tags: Map<number, Tag>;
  /**
   * Map book ID to a set of tag IDs.
   */
  bookTags: Map<number, Set<number>>;
  /**
   * Map user ID to a set of tag IDs.
   */
  userTags: Map<number, Set<number>>;
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

export function addTag(appData: AppData, name: string): [AppData, Tag] {
  const tag = {
    id: getNextId(appData.tags.values()),
    name: name
  };
  const nextAppData = produce(appData, draft => {
    draft.tags.set(tag.id, tag);
  });
  return [nextAppData, tag];
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

export function updateTag(appData: AppData, tag: Tag): AppData {
  return produce(appData, draft => {
    draft.tags.set(tag.id, tag);
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

export function deleteTag(appData: AppData, tagId: number): [AppData, boolean] {
  if (!appData.tags.has(tagId)) {
    return [appData, false];
  }
  return [
    produce(appData, draft => {
      draft.tags.delete(tagId);
      // Cascade.
      const emptyBookIds: Array<number> = [];
      for (const [bookId, tags] of draft.bookTags) {
        tags.delete(tagId);
        if (tags.size === 0) {
          emptyBookIds.push(bookId);
        }
      }
      const emptyUserIds: Array<number> = [];
      for (const [userId, tags] of draft.userTags) {
        tags.delete(tagId);
        if (tags.size === 0) {
          emptyUserIds.push(userId);
        }
      }
      // Cleanup.
      for (const bookId of emptyBookIds) {
        draft.bookTags.delete(bookId);
      }
      for (const userId of emptyUserIds) {
        draft.userTags.delete(userId);
      }
    }),
    true
  ];
}

export function applyTagToBook(
  appData: AppData,
  tagId: number,
  bookId: number
): AppData {
  return produce(appData, draft => {
    if (draft.bookTags.has(bookId)) {
      const tags = draft.bookTags.get(bookId);
      assertWrapper(tags);
      tags.add(tagId);
    } else {
      draft.bookTags.set(bookId, new Set([tagId]));
    }
  });
}

export function applyTagToUser(
  appData: AppData,
  tagId: number,
  userId: number
): AppData {
  return produce(appData, draft => {
    if (draft.userTags.has(userId)) {
      const tags = draft.userTags.get(userId);
      assertWrapper(tags);
      tags.add(tagId);
    } else {
      draft.userTags.set(userId, new Set([tagId]));
    }
  });
}

export function removeTagFromBook(
  appData: AppData,
  tagId: number,
  bookId: number
): [AppData, boolean] {
  let failed = false;
  const nextAppData = produce(appData, draft => {
    const tags = draft.bookTags.get(bookId);
    if (!tags || !tags.has(tagId)) {
      failed = true;
      return;
    }
    tags.delete(tagId);
    if (tags.size === 0) {
      draft.bookTags.delete(bookId);
    }
  });
  return [nextAppData, !failed];
}

export function removeTagFromUser(
  appData: AppData,
  tagId: number,
  userId: number
): [AppData, boolean] {
  let failed = false;
  const nextAppData = produce(appData, draft => {
    const tags = draft.userTags.get(userId);
    if (!tags || !tags.has(tagId)) {
      failed = true;
      return;
    }
    tags.delete(tagId);
    if (tags.size === 0) {
      draft.userTags.delete(userId);
    }
  });
  return [nextAppData, !failed];
}

interface PlainAppData {
  books?: Array<Book>;
  users?: Array<User>;
  views?: Array<View>;
  tags?: Array<Tag>;
  bookTags?: Array<[number, Array<number>]>;
  userTags?: Array<[number, Array<number>]>;
}

export function createAppData(): AppData;
export function createAppData(plain: PlainAppData): AppData | null;
export function createAppData(plain?: PlainAppData): AppData | null {
  if (!plain) {
    return {
      books: new Map(),
      users: new Map(),
      views: new Map(),
      tags: new Map(),
      bookTags: new Map(),
      userTags: new Map()
    };
  }

  return {
    books: new Map(plain.books?.map(book => [book.id, book])),
    users: new Map(plain.users?.map(user => [user.id, user])),
    views: new Map(plain.views?.map(view => [view.id, view])),
    tags: new Map(plain.tags?.map(tag => [tag.id, tag])),
    bookTags: new Map(
      plain.bookTags?.map(([bookId, tagIds]) => [bookId, new Set(tagIds)])
    ),
    userTags: new Map(
      plain.userTags?.map(([userId, tagIds]) => [userId, new Set(tagIds)])
    )
  };
}

export function serializeAppData(appData: AppData): string {
  const plain: PlainAppData = {
    books: Array.from(appData.books.values()),
    users: Array.from(appData.users.values()),
    views: Array.from(appData.views.values()),
    tags: Array.from(appData.tags.values()),
    bookTags: Array.from(appData.bookTags.entries()).map(([bookId, tagSet]) => [
      bookId,
      Array.from(tagSet)
    ]),
    userTags: Array.from(appData.userTags.entries()).map(([userId, tagSet]) => [
      userId,
      Array.from(tagSet)
    ])
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
