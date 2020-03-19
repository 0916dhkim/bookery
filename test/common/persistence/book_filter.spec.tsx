import { describe, it } from "mocha";
import { BookFilter } from "../../../src/common/persistence/book_filter";
import { expect } from "chai";
import { Book } from "../../../src/common/persistence/book";

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
});
