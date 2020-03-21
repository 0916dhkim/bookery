import { describe, it } from "mocha";
import { UserFilter } from "./user_filter";
import { expect } from "chai";
import { User } from "./user";

describe("UserFilter", function() {
  it("Empty Query", function() {
    const user: User = { id: 1, lastName: "ABC", firstName: "DEF" };
    const filter = new UserFilter([user]);
    const result = Array.from(filter.filter(""));
    expect(result).to.have.lengthOf(1);
    expect(result[0]).equals(user);
  });
  it("Match Last Name", function() {
    const userA: User = {
      id: 1,
      lastName: "ABC",
      firstName: "DEF",
      note: "GHI"
    };
    const userB: User = {
      id: 2,
      lastName: "JKL",
      firstName: "MNO",
      note: "PQR"
    };
    const filter = new UserFilter([userA, userB]);
    const result = Array.from(filter.filter("ABC"));
    expect(result).to.have.length(1);
    expect(result[0]).equals(userA);
  });
  it("Match First Name", function() {
    const userA: User = {
      id: 1,
      lastName: "ABC",
      firstName: "DEF",
      note: "GHI"
    };
    const userB: User = {
      id: 2,
      lastName: "JKL",
      firstName: "MNO",
      note: "PQR"
    };
    const filter = new UserFilter([userA, userB]);
    const result = Array.from(filter.filter("DEF"));
    expect(result).to.have.length(1);
    expect(result[0]).equals(userA);
  });
  it("Match Note", function() {
    const userA: User = {
      id: 1,
      lastName: "ABC",
      firstName: "DEF",
      note: "GHI"
    };
    const userB: User = {
      id: 2,
      lastName: "JKL",
      firstName: "MNO",
      note: "PQR"
    };
    const filter = new UserFilter([userA, userB]);
    const result = Array.from(filter.filter("GHI"));
    expect(result).to.have.length(1);
    expect(result[0]).equals(userA);
  });

  describe("Queries", function() {
    const user: User = {
      id: 123219,
      firstName: "Elizabeth",
      lastName: "Davis",
      note: "1995"
    };
    const filter = new UserFilter([user]);
    describe("Matching", function() {
      const queries = [
        "elizabeth",
        "Eli",
        "davis",
        "elida",
        "bavis",
        "ED",
        "DE",
        "95 liz",
        "1"
      ];
      for (const query of queries) {
        it(`${query}`, function() {
          const result = Array.from(filter.filter(query));
          expect(result).to.have.lengthOf(1);
          expect(result[0]).deep.equals(user);
        });
      }
    });
    describe("Not Matching", function() {
      const queries = ["c", "charles", "abigail", "Thompson", "1996", "96"];
      for (const query of queries) {
        it(`${query}`, function() {
          const result = Array.from(filter.filter(query));
          expect(result).to.have.lengthOf(0);
        });
      }
    });
  });
});
