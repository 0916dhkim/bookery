import { describe, it } from "mocha";
import * as assert from "assert";
import * as moment from "moment";
import { Book } from "../../src/persistence/book";
import { User } from "../../src/persistence/user";
import { View } from "../../src/persistence/view";
import { AppData, AppDataSerializer } from "../../src/persistence/app_data";
import { assertBookProperties } from "./book";
import { assertUserProperties } from "./user";
import { assertViewProperties } from "./view";

function assertAppDataProperties(
  appData: AppData,
  books: Book[],
  users: User[],
  views: View[]
): void {
  assert.strictEqual(appData.books.length, books.length);
  assert.strictEqual(appData.users.length, users.length);
  assert.strictEqual(appData.views.length, views.length);

  for (let i = 0; i < books.length; i++) {
    assertBookProperties(
      appData.books[i],
      books[i].id,
      books[i].title,
      books[i].author,
      books[i].isbn
    );
  }

  for (let i = 0; i < users.length; i++) {
    assertUserProperties(
      appData.users[i],
      users[i].id,
      users[i].lastName,
      users[i].firstName,
      users[i].note
    );
  }

  for (let i = 0; i < views.length; i++) {
    assertViewProperties(
      appData.views[i],
      views[i].id,
      views[i].userId,
      views[i].bookId,
      views[i].date
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
      const appData = new AppData();
      // Add books.
      appData.books.push(
        new Book(1, "First Title", "Willy Du"),
        new Book(33, "Second", "John Doe"),
        new Book(23232, "Cool Stuff", "Mary Jane")
      );
      // Add Users.
      appData.users.push(
        new User(123, "Handsome", "Jack", "The Hero"),
        new User(23894, "Tiny", "Tina", "Maniac")
      );
      // Add Views.
      appData.views.push(
        new View(1, 123, 1, moment.utc(1318781875817)),
        new View(2, 23894, 1, moment.utc(1318781876807)),
        new View(3, 123, 33, moment.utc(1318781875811)),
        new View(4, 1, 23232, moment.utc(1318781875822))
      );
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
