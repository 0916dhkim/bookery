import { describe, it } from "mocha";
import * as assert from "assert";
import { User, UserSerializer } from "../../src/persistence/user";
import { assertQuery } from "./queryable";

export function assertUserProperties(
  user: User,
  id: number,
  lastName: string,
  firstName: string,
  note?: string
): void {
  assert.strictEqual(user.id, id);
  assert.strictEqual(user.lastName, lastName);
  assert.strictEqual(user.firstName, firstName);
  assert.strictEqual(user.note, note);
}

describe("User", function() {
  describe("UserSerializer", function() {
    it("Single User Serialization and Deserialization", function() {
      const user = new User(8, "Peterson", "Eight", "10 yrs old.");
      const userSerializer = new UserSerializer();
      const str = userSerializer.serialize(user);
      const deserialized = userSerializer.deserialize(str);
      assertUserProperties(
        deserialized,
        user.id,
        user.lastName,
        user.firstName,
        user.note
      );
    });

    it("Serialize a User Without Note", function() {
      const user = new User(7, "Pena", "Jose");
      const userSerializer = new UserSerializer();
      const str = userSerializer.serialize(user);
      const deserialized = userSerializer.deserialize(str);
      assertUserProperties(
        deserialized,
        user.id,
        user.lastName,
        user.firstName
      );
    });
  });
  describe("Queryable", function() {
    it("Query Mismatch", function() {
      const user = new User(11, "Doe", "John", "Young");
      const queryString = "XYZ";
      assertQuery(user, queryString, 0);
    });
    it("Match With No Contiguous Letter", function() {
      const user = new User(12, "Doe", "John", "Young");
      const queryString = "YDJ";
      assertQuery(user, queryString, 1);
    });
    it("Match With Three Contiguous Letters", function() {
      const user = new User(13, "Doe", "John", "Young");
      const queryString = "oeohnoun";
      assertQuery(user, queryString, 3);
    });
    it("Unicode", function() {
      const user = new User(14, "제갈", "공명", "노트");
      const queryString = "노제공";
      assertQuery(user, queryString, 1);
    });
  });
});
