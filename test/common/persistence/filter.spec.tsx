import { describe, it } from "mocha";
import { expect } from "chai";
import {
  filterBooks,
  filterUsers
} from "../../../src/common/persistence/filter";
import { Book } from "../../../src/common/persistence/book";
import { User } from "../../../src/common/persistence/user";

describe("filter", function() {
  describe("filterBooks", function() {
    it("Empty Query", function() {
      const book = new Book(1, "ABC", "DEF");
      const result = filterBooks([book], "");
      expect(result).to.have.lengthOf(1);
      expect(book.equals(result[0])).to.be.true;
    });
  });

  describe("filterUsers", function() {
    it("Empty Query", function() {
      const user = new User(1, "ABC", "DEF");
      const result = filterUsers([user], "");
      expect(result).to.have.lengthOf(1);
      expect(user.equals(result[0])).to.be.true;
    });
  });
});
