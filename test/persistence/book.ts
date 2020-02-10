import { describe, it } from "mocha";
import * as assert from "assert";
import { Book, BookSerializer } from "../../src/persistence/book";
import { assertQuery } from "./queryable";

export function assertBookProperties(
  book: Book,
  id: number,
  title: string,
  author: string,
  isbn?: string
): void {
  assert.strictEqual(book.id, id);
  assert.strictEqual(book.title, title);
  assert.strictEqual(book.author, author);
  assert.strictEqual(book.isbn, isbn);
}

describe("Book", function() {
  describe("BookSerializer", function() {
    it("Single Book Serialization and Deserialization", function() {
      const book = new Book(13, "Thirteen", "John Doe", "2382394");
      const bookSerializer = new BookSerializer();
      const str = bookSerializer.serialize(book);
      const deserialized = bookSerializer.deserialize(str);
      assertBookProperties(
        deserialized,
        book.id,
        book.title,
        book.author,
        book.isbn
      );
    });

    it("Serialize a Book Without ISBN", function() {
      const book = new Book(22, "Twenty Two", "Chris Johnson");
      const bookSerializer = new BookSerializer();
      const str = bookSerializer.serialize(book);
      const deserialized = bookSerializer.deserialize(str);
      assertBookProperties(deserialized, book.id, book.title, book.author);
    });
  });
  describe("Queryable", function() {
    it("Query Mismatch", function() {
      const book = new Book(13, "Good Title", "John Doe", "9922342");
      const queryString = "ATX";
      assertQuery(book, queryString, 0);
    });
    it("Match With No Contiguous Letter", function() {
      const book = new Book(14, "Bad Title", "John Doe", "2934883294");
      const queryString = "btjd";
      assertQuery(book, queryString, 1);
    });
    it("Match With Three Contiguous Letters", function() {
      const book = new Book(15, "One Two Three", "Dave Lee", "23948474");
      const queryString = "neworee";
      assertQuery(book, queryString, 3);
    });
    it("Unicode", function() {
      const book = new Book(16, "책 제목", "홍길동", "238497239");
      const queryString = "홍책제";
      assertQuery(book, queryString, 1);
    });
  });
});
