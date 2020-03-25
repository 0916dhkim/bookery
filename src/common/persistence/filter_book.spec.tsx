import { filterBook } from "./filter_book";
import { expect } from "chai";
import { Book } from "./book";
import { createAppData } from "./app_data";
import { assertWrapper } from "../assert_wrapper";

describe("BookFilter", function() {
  it("Empty Query", function() {
    const appData = createAppData({
      books: [
        {
          id: 1,
          title: "ABC",
          author: "DEF"
        }
      ]
    });
    assertWrapper(appData);
    const actual = Array.from(filterBook(appData, ""));
    const expected = [
      {
        id: 1,
        title: "ABC",
        author: "DEF"
      }
    ];
    expect(actual).deep.equals(expected);
  });
  it("Match Title", function() {
    const appData = createAppData({
      books: [
        { id: 1, title: "ABC", author: "DEF", isbn: "GHI" },
        { id: 2, title: "JKL", author: "MNO", isbn: "PQR" }
      ]
    });
    assertWrapper(appData);
    const actual = Array.from(filterBook(appData, "ABC"));
    const expected = [{ id: 1, title: "ABC", author: "DEF", isbn: "GHI" }];
    expect(actual).deep.equals(expected);
  });
  it("Match Author", function() {
    const bookA: Book = { id: 1, title: "ABC", author: "DEF", isbn: "GHI" };
    const bookB: Book = { id: 2, title: "JKL", author: "MNO", isbn: "PQR" };
    const appData = createAppData({
      books: [bookA, bookB]
    });
    assertWrapper(appData);
    const actual = Array.from(filterBook(appData, "DEF"));
    const expected = [bookA];
    expect(actual).deep.equals(expected);
  });
  it("Match ISBN", function() {
    const bookA: Book = { id: 1, title: "ABC", author: "DEF", isbn: "GHI" };
    const bookB: Book = { id: 2, title: "JKL", author: "MNO", isbn: "PQR" };
    const appData = createAppData({
      books: [bookA, bookB]
    });
    assertWrapper(appData);
    const actual = Array.from(filterBook(appData, "GHI"));
    const expected = [bookA];
    expect(actual).deep.equals(expected);
  });

  describe("Queries", function() {
    const book: Book = {
      id: 544212,
      title: "Good",
      author: "James",
      isbn: "978-3-16-148410-0"
    };
    const appData = createAppData({
      books: [book]
    });
    assertWrapper(appData);
    describe("Matching", function() {
      const queries = ["Good", "James", "978", "GoJam", "97jamesgood"];
      for (const query of queries) {
        it(`${query}`, function() {
          const actual = Array.from(filterBook(appData, query));
          const expected = [book];
          expect(actual).deep.equals(expected);
        });
      }
    });

    describe("Not Matching", function() {
      const queries = ["k", "Hames", "77", "000"];
      for (const query of queries) {
        it(`${query}`, function() {
          const actual = Array.from(filterBook(appData, query));
          expect(actual).deep.equals([]);
        });
      }
    });
  });

  describe("Tagged Queries", function() {
    const bookA: Book = {
      id: 899,
      title: "A",
      author: "Tom"
    };
    const bookB: Book = {
      id: 900,
      title: "B",
      author: "Bill"
    };
    const bookC: Book = {
      id: 901,
      title: "C",
      author: "Ken"
    };
    const appData = createAppData({
      books: [bookA, bookB, bookC],
      tags: [
        {
          id: 11,
          name: "common"
        },
        {
          id: 12,
          name: "base/leaf-1"
        },
        {
          id: 13,
          name: "base/leaf-2"
        }
      ],
      bookTags: [
        [899, [11]],
        [900, [11, 12]],
        [901, [11, 13]]
      ]
    });
    assertWrapper(appData);
    const testCases: Map<string, Array<Book>> = new Map([
      ["#common", [bookC, bookB, bookA]],
      ["common", []],
      ["A", [bookA]],
      ["#base", [bookC, bookB]],
      ["#base/leaf", []],
      ["#base/leaf-1", [bookB]],
      ["#common #base/leaf-2", [bookC]],
      ["B #base", [bookB]]
    ]);
    for (const [query, expected] of testCases) {
      it(`${query}`, function() {
        const actual = filterBook(appData, query);
        expect(actual).deep.equals(expected);
      });
    }
  });
});
