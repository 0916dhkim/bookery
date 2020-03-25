import { expect } from "chai";
import {
  AppData,
  serializeAppData,
  deserializeAppData,
  createAppData,
  addTag,
  deleteTag,
  updateTag,
  applyTagToBook,
  applyTagToUser,
  removeTagFromBook,
  removeTagFromUser
} from "./app_data";
import { assertWrapper } from "../assert_wrapper";

describe("AppData", function() {
  describe("addTag", function() {
    it("Simple", function() {
      const appData = createAppData({
        tags: [
          {
            id: 3,
            name: "original"
          }
        ]
      });
      assertWrapper(appData);
      const [actual] = addTag(appData, "new");
      const expected = createAppData({
        tags: [
          {
            id: 3,
            name: "original"
          },
          {
            id: 4,
            name: "new"
          }
        ]
      });
      expect(actual).deep.equals(expected);
    });
  });
  describe("deleteTag", function() {
    it("Simple", function() {
      const appData = createAppData({
        tags: [
          {
            id: 3,
            name: "simple"
          }
        ]
      });
      assertWrapper(appData);
      const actual = deleteTag(appData, 3);
      const expected = [createAppData(), true];
      expect(actual).deep.equals(expected);
    });
    it("Fail", function() {
      const appData = createAppData({
        tags: [
          {
            id: 3,
            name: "noble"
          }
        ]
      });
      assertWrapper(appData);
      const actual = deleteTag(appData, 30);
      const expected = [appData, false];
      expect(actual).deep.equals(expected);
    });
    it("Cascade", function() {
      const appData = createAppData({
        books: [
          {
            id: 2938,
            title: "True Love",
            author: "Con"
          }
        ],
        users: [
          {
            id: 3452,
            firstName: "Dominic",
            lastName: "Sawyer"
          }
        ],
        tags: [
          {
            id: 192,
            name: "remaining"
          },
          {
            id: 121,
            name: "vanishing"
          }
        ],
        bookTags: [[2938, [192, 121]]],
        userTags: [[3452, [121, 192]]]
      });
      assertWrapper(appData);
      const actual = deleteTag(appData, 121);
      const expected = [
        createAppData({
          books: [
            {
              id: 2938,
              title: "True Love",
              author: "Con"
            }
          ],
          users: [
            {
              id: 3452,
              firstName: "Dominic",
              lastName: "Sawyer"
            }
          ],
          tags: [
            {
              id: 192,
              name: "remaining"
            }
          ],
          bookTags: [[2938, [192]]],
          userTags: [[3452, [192]]]
        }),
        true
      ];
      expect(actual).deep.equals(expected);
    });
    it("Cascade To The Last Tag", function() {
      const appData = createAppData({
        books: [
          {
            id: 2929,
            title: "Double Down",
            author: "Dove"
          }
        ],
        tags: [
          {
            id: 61,
            name: "tiny"
          }
        ],
        bookTags: [[2929, [61]]]
      });
      assertWrapper(appData);
      const actual = deleteTag(appData, 61);
      const expected = [
        createAppData({
          books: [
            {
              id: 2929,
              title: "Double Down",
              author: "Dove"
            }
          ]
        }),
        true
      ];
      expect(actual).deep.equals(expected);
    });
  });
  describe("updateTag", function() {
    it("Simple", function() {
      const appData = createAppData({
        tags: [
          {
            id: 50,
            name: "typoh"
          }
        ]
      });
      assertWrapper(appData);
      const actual = updateTag(appData, { id: 50, name: "typo" });
      const expected = createAppData({
        tags: [
          {
            id: 50,
            name: "typo"
          }
        ]
      });
      expect(actual).deep.equals(expected);
    });
  });
  describe("applyTagToBook", function() {
    it("Simple", function() {
      const appData = createAppData({
        books: [
          {
            id: 10,
            title: "Taylor Series",
            author: "Taylor"
          }
        ],
        tags: [
          {
            id: 100,
            name: "fun"
          }
        ]
      });
      assertWrapper(appData);
      const actual = applyTagToBook(appData, 100, 10);
      const expected = createAppData({
        books: [
          {
            id: 10,
            title: "Taylor Series",
            author: "Taylor"
          }
        ],
        tags: [
          {
            id: 100,
            name: "fun"
          }
        ],
        bookTags: [[10, [100]]]
      });
      expect(actual).deep.equals(expected);
    });
  });
  describe("applyTagToUser", function() {
    it("Simple", function() {
      const appData = createAppData({
        users: [
          {
            id: 9234,
            firstName: "Tae",
            lastName: "Lee"
          }
        ],
        tags: [
          {
            id: 1212,
            name: "striker"
          }
        ]
      });
      assertWrapper(appData);
      const actual = applyTagToUser(appData, 1212, 9234);
      const expected = createAppData({
        users: [
          {
            id: 9234,
            firstName: "Tae",
            lastName: "Lee"
          }
        ],
        tags: [
          {
            id: 1212,
            name: "striker"
          }
        ],
        userTags: [[9234, [1212]]]
      });
      expect(actual).deep.equals(expected);
    });
  });
  describe("removeTagFromBook", function() {
    it("Simple", function() {
      const appData = createAppData({
        books: [
          {
            id: 8431,
            title: "One",
            author: "Two"
          }
        ],
        tags: [
          {
            id: 6033,
            name: "number"
          },
          {
            id: 7575,
            name: "simple"
          }
        ],
        bookTags: [[8431, [6033, 7575]]]
      });
      assertWrapper(appData);
      const actual = removeTagFromBook(appData, 7575, 8431);
      const expected = [
        createAppData({
          books: [
            {
              id: 8431,
              title: "One",
              author: "Two"
            }
          ],
          tags: [
            {
              id: 6033,
              name: "number"
            },
            {
              id: 7575,
              name: "simple"
            }
          ],
          bookTags: [[8431, [6033]]]
        }),
        true
      ];
      expect(actual).deep.equals(expected);
    });
    it("Removing The Last Tag", function() {
      const appData = createAppData({
        books: [
          {
            id: 103,
            title: "Intro",
            author: "Jose"
          }
        ],
        tags: [
          {
            id: 74,
            name: "quatro"
          }
        ],
        bookTags: [[103, [74]]]
      });
      assertWrapper(appData);
      const actual = removeTagFromBook(appData, 74, 103);
      const expected = [
        createAppData({
          books: [
            {
              id: 103,
              title: "Intro",
              author: "Jose"
            }
          ],
          tags: [
            {
              id: 74,
              name: "quatro"
            }
          ]
        }),
        true
      ];
      expect(actual).deep.equals(expected);
    });
  });
  describe("removeTagFromUser", function() {
    it("Simple", function() {
      const appData = createAppData({
        users: [
          {
            id: 33,
            firstName: "Rich",
            lastName: "Herald"
          }
        ],
        tags: [
          {
            id: 221,
            name: "brave"
          },
          {
            id: 222,
            name: "shy"
          }
        ],
        userTags: [[33, [221, 222]]]
      });
      assertWrapper(appData);
      const actual = removeTagFromUser(appData, 222, 33);
      const expected = [
        createAppData({
          users: [
            {
              id: 33,
              firstName: "Rich",
              lastName: "Herald"
            }
          ],
          tags: [
            {
              id: 221,
              name: "brave"
            },
            {
              id: 222,
              name: "shy"
            }
          ],
          userTags: [[33, [221]]]
        }),
        true
      ];
      expect(actual).deep.equals(expected);
    });
    it("Removing The Last Tag", function() {
      const appData = createAppData({
        users: [
          {
            id: 855,
            firstName: "Alice",
            lastName: "Blue"
          }
        ],
        tags: [
          {
            id: 7,
            name: "bright"
          }
        ],
        userTags: [[855, [7]]]
      });
      assertWrapper(appData);
      const actual = removeTagFromUser(appData, 7, 855);
      const expected = [
        createAppData({
          users: [
            {
              id: 855,
              firstName: "Alice",
              lastName: "Blue"
            }
          ],
          tags: [
            {
              id: 7,
              name: "bright"
            }
          ]
        }),
        true
      ];
      expect(actual).deep.equals(expected);
    });
  });
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
