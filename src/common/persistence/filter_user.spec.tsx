import { describe, it } from "mocha";
import { filterUser } from "./filter_user";
import { expect } from "chai";
import { User } from "./user";
import { createAppData } from "./app_data";
import { assertWrapper } from "../assert_wrapper";

describe("UserFilter", function() {
  it("Empty Query", function() {
    const user: User = { id: 1, lastName: "ABC", firstName: "DEF" };
    const appData = createAppData({
      users: [user]
    });
    assertWrapper(appData);
    const actual = Array.from(filterUser(appData, ""));
    const expected = [user];
    expect(actual).deep.equals(expected);
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
    const appData = createAppData({
      users: [userA, userB]
    });
    assertWrapper(appData);
    const actual = Array.from(filterUser(appData, "ABC"));
    const expected = [userA];
    expect(actual).deep.equals(expected);
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
    const appData = createAppData({
      users: [userA, userB]
    });
    assertWrapper(appData);
    const actual = Array.from(filterUser(appData, "DEF"));
    const expected = [userA];
    expect(actual).deep.equals(expected);
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
    const appData = createAppData({
      users: [userA, userB]
    });
    assertWrapper(appData);
    const actual = Array.from(filterUser(appData, "GHI"));
    const expected = [userA];
    expect(actual).deep.equals(expected);
  });

  describe("Queries", function() {
    const user: User = {
      id: 123219,
      firstName: "Elizabeth",
      lastName: "Davis",
      note: "1995"
    };
    const appData = createAppData({
      users: [user]
    });
    assertWrapper(appData);
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
          const actual = Array.from(filterUser(appData, query));
          const expected = [user];
          expect(actual).deep.equals(expected);
        });
      }
    });
    describe("Not Matching", function() {
      const queries = ["c", "charles", "abigail", "Thompson", "1996", "96"];
      for (const query of queries) {
        it(`${query}`, function() {
          const actual = Array.from(filterUser(appData, query));
          expect(actual).deep.equals([]);
        });
      }
    });
  });
});
