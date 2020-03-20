import { describe, it } from "mocha";
import { expect } from "chai";
import { FunctionalIterable } from "../../../src/common/persistence/functional_iterable";

describe("FunctionalIterable", function() {
  it("Composite", function() {
    const x = ["Hello", "World", "!", "FunctionalIterable"];
    const res = new FunctionalIterable(x)
      .map(e => e.length) // [5, 5, 1, 18]
      .map(e => e * e) // [25, 25, 1, 324]
      .filter(e => e > 1) // [25, 25, 324]
      .reduce((a, b) => a + b, 25); // 399
    expect(res).equals(399);
  });

  describe("map", function() {
    function test<P, Q>(
      iterable: Iterable<P>,
      func: (e: P) => Q,
      expected: Iterable<Q>
    ): void {
      it("Generated Test", function() {
        const res = new FunctionalIterable(iterable).map(func);
        expect(Array.from(res)).deep.equals(Array.from(expected));
      });
    }

    test([1, 2, 3], e => e + 1, [2, 3, 4]);
    test([1, 2, 3], e => e * 2, [2, 4, 6]);
    test(["A", "B", "C"], e => e.concat("X"), ["AX", "BX", "CX"]);
  });

  describe("filter", function() {
    function test<P>(
      iterable: Iterable<P>,
      func: (e: P) => boolean,
      expected: Iterable<P>
    ): void {
      it("Generated Test", function() {
        const res = new FunctionalIterable(iterable).filter(func);
        expect(Array.from(res)).deep.equals(Array.from(expected));
      });
    }

    test([1, 2, 3], e => e < 2, [1]);
    test(["Apple", "Banana", "Pineapple"], e => e.startsWith("A"), ["Apple"]);
    test([true, false, true], e => !e, [false]);
  });

  describe("reduce", function() {
    function test<P, Q>(
      iterable: Iterable<P>,
      func: (acc: Q, cur: P) => Q,
      initial: Q,
      expected: Q
    ): void {
      it("Generated Test", function() {
        const res = new FunctionalIterable(iterable).reduce(func, initial);
        expect(res).deep.equals(expected);
      });
    }

    test([1, 2, 3, 4], (a, b) => a + b, 0, 10);
    test([1, 2, 3], (a, b) => a * b, 1, 6);
    test(["ab", "cd", "ef"], (a, b) => a.concat(b), "", "abcdef");
  });
});
