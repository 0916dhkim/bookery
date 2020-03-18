import { describe, it } from "mocha";
import { BookFilter } from "../../../src/common/persistence/book_filter";
import { expect } from "chai";
import { Book } from "../../../src/common/persistence/book";

describe("BookFilter", function() {
  it("Empty Query", function() {
    const book = new Book(1, "ABC", "DEF");
    const filter = new BookFilter([book]);
    const result = Array.from(filter.filter(""));
    expect(result).to.have.lengthOf(1);
    expect(book.equals(result[0])).to.be.true;
  });
  it("Match Title", function() {
    const bookA = new Book(1, "ABC", "DEF", "GHI");
    const bookB = new Book(2, "JKL", "MNO", "PQR");
    const filter = new BookFilter([bookA, bookB]);
    const result = Array.from(filter.filter("ABC"));
    expect(result).to.have.lengthOf(1);
    expect(bookA.equals(result[0])).to.be.true;
  });
  it("Match Author", function() {
    const bookA = new Book(1, "ABC", "DEF", "GHI");
    const bookB = new Book(2, "JKL", "MNO", "PQR");
    const filter = new BookFilter([bookA, bookB]);
    const result = Array.from(filter.filter("DEF"));
    expect(result).to.have.lengthOf(1);
    expect(bookA.equals(result[0])).to.be.true;
  });
  it("Match ISBN", function() {
    const bookA = new Book(1, "ABC", "DEF", "GHI");
    const bookB = new Book(2, "JKL", "MNO", "PQR");
    const filter = new BookFilter([bookA, bookB]);
    const result = Array.from(filter.filter("GHI"));
    expect(result).to.have.lengthOf(1);
    expect(bookA.equals(result[0])).to.be.true;
  });
});
