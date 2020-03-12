import { describe, it } from "mocha";
import * as assert from "assert";
import { Book } from "../../../src/common/persistence/book";
import { User } from "../../../src/common/persistence/user";
import { View } from "../../../src/common/persistence/view";
import {
  AppData,
  AppDataSerializer
} from "../../../src/common/persistence/app_data";
import { assertBookProperties } from "./book";
import { assertUserProperties } from "./user";
import { assertViewProperties } from "./view";
import produce from "immer";
import { assertWrapper } from "../../../src/common/assert_wrapper";

function assertAppDataProperties(
  appData: AppData,
  books: ReadonlyMap<number, Book>,
  users: ReadonlyMap<number, User>,
  views: ReadonlyMap<number, View>
): void {
  assert.strictEqual(appData.books.size, books.size);
  assert.strictEqual(appData.users.size, users.size);
  assert.strictEqual(appData.views.size, views.size);

  for (const [key, book] of books) {
    const appDataBook = appData.books.get(key);
    assertWrapper(!!appDataBook);
    assertBookProperties(
      appDataBook,
      book.id,
      book.title,
      book.author,
      book.isbn
    );
  }

  for (const [key, user] of users) {
    const appDataUser = appData.users.get(key);
    assertWrapper(!!appDataUser);
    assertUserProperties(
      appDataUser,
      user.id,
      user.lastName,
      user.firstName,
      user.note
    );
  }

  for (const [key, view] of views) {
    const appDataView = appData.views.get(key);
    assertWrapper(!!appDataView);
    assertViewProperties(
      appDataView,
      view.id,
      view.userId,
      view.bookId,
      view.date
    );
  }
}

describe("App Data", function() {
  describe("AppDataSerializer", function() {
    it("Empty App Data Serialization and Deserialization", function() {
      const appData = new AppData();
      const appDataSerializer = new AppDataSerializer();
      const str = appDataSerializer.serialize(appData);
      const deserialized = appDataSerializer.deserialize(str);
      assertAppDataProperties(
        deserialized,
        appData.books,
        appData.users,
        appData.views
      );
    });

    it("Small App Data Serialization and Deserialization", function() {
      const appData = produce(new AppData(), draft => {
        // Add books.
        [
          new Book(1, "First Title", "Willy Du"),
          new Book(33, "Second", "John Doe"),
          new Book(23232, "Cool Stuff", "Mary Jane")
        ].forEach(book => draft.books.set(book.id, book));
        // Add Users.
        [
          new User(123, "Handsome", "Jack", "The Hero"),
          new User(23894, "Tiny", "Tina", "Maniac")
        ].forEach(user => draft.users.set(user.id, user));
        // Add Views.
        [
          new View(1, 123, 1, 1318781875817),
          new View(2, 23894, 1, 1318781876807),
          new View(3, 123, 33, 1318781875811),
          new View(4, 1, 23232, 1318781875822)
        ].forEach(view => draft.views.set(view.id, view));
      });
      const appDataSerializer = new AppDataSerializer();
      const str = appDataSerializer.serialize(appData);
      const deserialized = appDataSerializer.deserialize(str);
      assertAppDataProperties(
        deserialized,
        appData.books,
        appData.users,
        appData.views
      );
    });
  });
});
