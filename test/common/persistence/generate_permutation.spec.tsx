import { describe, it } from "mocha";
import { expect } from "chai";
import { generatePermutation } from "../../../src/common/persistence/generate_permutation";

describe("generatePermutation", function() {
  const m: Array<{ input: Array<{}>; expected: Array<Array<{}>> }> = [
    {
      input: [],
      expected: [[]]
    },
    {
      input: [1],
      expected: [[1]]
    },
    {
      input: [1, 2],
      expected: [
        [1, 2],
        [2, 1]
      ]
    },
    {
      input: [1, 2, 3],
      expected: [
        [1, 2, 3],
        [1, 3, 2],
        [2, 1, 3],
        [2, 3, 1],
        [3, 1, 2],
        [3, 2, 1]
      ]
    },
    {
      input: ["ab", "cd"],
      expected: [
        ["ab", "cd"],
        ["cd", "ab"]
      ]
    },
    {
      input: ["A", "B", "C"],
      expected: [
        ["A", "B", "C"],
        ["A", "C", "B"],
        ["B", "A", "C"],
        ["B", "C", "A"],
        ["C", "A", "B"],
        ["C", "B", "A"]
      ]
    }
  ];
  for (const { input, expected } of m) {
    it(`${input}`, function() {
      expect(
        Array.from(generatePermutation(input)).map(x => Array.from(x))
      ).deep.equals(expected);
    });
  }
});
