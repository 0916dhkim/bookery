import { describe, it } from "mocha";
import * as assert from "assert";
import { Book, BookSerializer } from "../../../src/common/persistence/book";

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
});
