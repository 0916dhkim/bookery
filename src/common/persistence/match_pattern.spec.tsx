import { expect } from "chai";
import { matchPattern } from "./match_pattern";

describe("matchPattern", function() {
  function test<K extends string, T extends { [key in K]?: string }>(
    pattern: string,
    keys: Iterable<K>,
    target: T,
    expected: boolean
  ): void {
    it(`${pattern}`, function() {
      expect(matchPattern(pattern, keys, target)).equals(expected);
    });
  }

  test(
    "",
    ["a", "b"],
    {
      a: "Pass"
    },
    true
  );
  test(
    "hi",
    ["a", "b"],
    {
      a: "ha",
      b: "is"
    },
    true
  );
  test(
    "abc",
    ["first", "second", "third"],
    {
      first: "c",
      second: "abd"
    },
    true
  );
  test(
    "ABC",
    ["first", "second", "third"],
    {
      first: "c",
      second: "abd"
    },
    true
  );
  test(
    "z",
    ["first", "second", "third"],
    {
      first: "x",
      second: "y"
    },
    false
  );
  test(
    "cloz",
    ["p", "q"],
    {
      p: "close",
      q: "open"
    },
    false
  );
});
