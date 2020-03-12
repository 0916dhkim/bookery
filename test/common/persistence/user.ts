import { describe, it } from "mocha";
import * as assert from "assert";
import { User, UserSerializer } from "../../../src/common/persistence/user";

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
      assert(deserialized.equals(user));
    });

    it("Serialize a User Without Note", function() {
      const user = new User(7, "Pena", "Jose");
      const userSerializer = new UserSerializer();
      const str = userSerializer.serialize(user);
      const deserialized = userSerializer.deserialize(str);
      assert(deserialized.equals(user));
    });
  });
});
