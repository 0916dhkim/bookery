import { describe, it } from "mocha";
import { expect } from "chai";
import { mapIterable } from "../../../src/common/persistence/map_iterable";

describe("mapIterable", function() {
  function test<P, Q>(
    iterable: Iterable<P>,
    func: (e: P) => Q,
    expected: Iterable<Q>
  ): void {
    it("Generated Test", function() {
      expect(Array.from(mapIterable(iterable, func))).deep.equals(
        Array.from(expected)
      );
    });
  }

  test([1, 2, 3], e => e + 1, [2, 3, 4]);
  test([1, 2, 3], e => e * 2, [2, 4, 6]);
  test(["A", "B", "C"], e => e.concat("X"), ["AX", "BX", "CX"]);
});
