import { describe, it } from "mocha";
import { expect } from "chai";
import {
  AppData,
  serializeAppData,
  deserializeAppData,
  createAppData
} from "./app_data";
import { assertWrapper } from "../assert_wrapper";

describe("AppData", function() {
  describe("AppData Serialization", function() {
    it("Empty App Data Serialization and Deserialization", function() {
      const appData: AppData | null = createAppData();
      assertWrapper(appData);
      const str = serializeAppData(appData);
      const deserialized = deserializeAppData(str);
      expect(deserialized).deep.equals(appData);
    });

    it("Small App Data Serialization and Deserialization", function() {
      const appData: AppData | null = createAppData({
        books: [
          { id: 1, title: "First Title", author: "Willy Du" },
          { id: 33, title: "Second", author: "John Doe" },
          { id: 23232, title: "Cool Stuff", author: "Mary Jane" }
        ],
        users: [
          {
            id: 123,
            lastName: "Handsome",
            firstName: "Jack",
            note: "The Hero"
          },
          { id: 23894, lastName: "Tiny", firstName: "Tina", note: "Maniac" }
        ],
        views: [
          { id: 1, userId: 123, bookId: 1, date: 1318781875817 },
          { id: 2, userId: 23894, bookId: 1, date: 1318781876807 },
          { id: 3, userId: 123, bookId: 33, date: 1318781875811 },
          { id: 4, userId: 1, bookId: 23232, date: 131878187582 }
        ]
      });
      assertWrapper(appData);
      const str = serializeAppData(appData);
      const deserialized = deserializeAppData(str);
      expect(deserialized).deep.equals(appData);
    });
  });
});
