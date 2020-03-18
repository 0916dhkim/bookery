import { describe, it } from "mocha";
import { UserFilter } from "../../../src/common/persistence/user_filter";
import { expect } from "chai";
import { User } from "../../../src/common/persistence/user";

describe("UserFilter", function() {
  it("Empty Query", function() {
    const user = new User(1, "ABC", "DEF");
    const filter = new UserFilter([user]);
    const result = Array.from(filter.filter(""));
    expect(result).to.have.lengthOf(1);
    expect(user.equals(result[0]));
  });
  it("Match Last Name", function() {
    const userA = new User(1, "ABC", "DEF", "GHI");
    const userB = new User(2, "JKL", "MNO", "PQR");
    const filter = new UserFilter([userA, userB]);
    const result = Array.from(filter.filter("ABC"));
    expect(result).to.have.length(1);
    expect(userA.equals(result[0]));
  });
  it("Match First Name", function() {
    const userA = new User(1, "ABC", "DEF", "GHI");
    const userB = new User(2, "JKL", "MNO", "PQR");
    const filter = new UserFilter([userA, userB]);
    const result = Array.from(filter.filter("DEF"));
    expect(result).to.have.length(1);
    expect(userA.equals(result[0]));
  });
  it("Match Note", function() {
    const userA = new User(1, "ABC", "DEF", "GHI");
    const userB = new User(2, "JKL", "MNO", "PQR");
    const filter = new UserFilter([userA, userB]);
    const result = Array.from(filter.filter("GHI"));
    expect(result).to.have.length(1);
    expect(userA.equals(result[0]));
  });
});
