import { describe, it } from "mocha";
import * as assert from "assert";
import { User, UserSerializer } from "../../src/persistence/user";

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
  describe("equals", function() {
    it("Simple Equality", async function() {
      const a = new User(1010, "Drake", "Suzie", "DOB 20010327");
      const b = new User(1010, "Drake", "Suzie", "DOB 20010327");
      assert(a.equals(b));
      assert(b.equals(a));
    });
    it("Simple Inequality", async function() {
      const a = new User(1010, "Drake", "Suzie", "DOB 20010327");
      const b = new User(2020, "Drako", "Joy", "DOB 20031115");
      assert(!a.equals(b));
      assert(!b.equals(a));
    });
  });
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
});
