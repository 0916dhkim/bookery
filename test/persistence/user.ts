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
