import { describe, it } from "mocha";
import { BookFilter } from "./book_filter";
import { expect } from "chai";
import { Book } from "./book";

describe("BookFilter", function() {
  it("Empty Query", function() {
    const book: Book = {
      id: 1,
      title: "ABC",
      author: "DEF"
    };
    const filter = new BookFilter([book]);
    const result = Array.from(filter.filter(""));
    expect(result).to.have.lengthOf(1);
    expect(result[0]).equals(book);
  });
  it("Match Title", function() {
    const bookA: Book = { id: 1, title: "ABC", author: "DEF", isbn: "GHI" };
    const bookB: Book = { id: 2, title: "JKL", author: "MNO", isbn: "PQR" };
    const filter = new BookFilter([bookA, bookB]);
    const result = Array.from(filter.filter("ABC"));
    expect(result).to.have.lengthOf(1);
    expect(result[0]).equals(bookA);
  });
  it("Match Author", function() {
    const bookA: Book = { id: 1, title: "ABC", author: "DEF", isbn: "GHI" };
    const bookB: Book = { id: 2, title: "JKL", author: "MNO", isbn: "PQR" };
    const filter = new BookFilter([bookA, bookB]);
    const result = Array.from(filter.filter("DEF"));
    expect(result).to.have.lengthOf(1);
    expect(result[0]).equals(bookA);
  });
  it("Match ISBN", function() {
    const bookA: Book = { id: 1, title: "ABC", author: "DEF", isbn: "GHI" };
    const bookB: Book = { id: 2, title: "JKL", author: "MNO", isbn: "PQR" };
    const filter = new BookFilter([bookA, bookB]);
    const result = Array.from(filter.filter("GHI"));
    expect(result).to.have.lengthOf(1);
    expect(result[0]).equals(bookA);
  });

  describe("Queries", function() {
    const book: Book = {
      id: 544212,
      title: "Good",
      author: "James",
      isbn: "978-3-16-148410-0"
    };
    const filter = new BookFilter([book]);
    describe("Matching", function() {
      const queries = ["Good", "James", "978", "GoJam", "97jamesgood"];
      for (const query of queries) {
        it(`${query}`, function() {
          const result = Array.from(filter.filter(query));
          expect(result).to.have.lengthOf(1);
          expect(result[0]).deep.equals(book);
        });
      }
    });

    describe("Not Matching", function() {
      const queries = ["k", "Hames", "77", "000"];
      for (const query of queries) {
        it(`${query}`, function() {
          const result = Array.from(filter.filter(query));
          expect(result).to.have.lengthOf(0);
        });
      }
    });
  });
});
