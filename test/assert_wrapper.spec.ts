import { describe, it } from "mocha";
import { assertNumber } from "../src/assert_wrapper";
import * as assert from "assert";

describe("assertNumber", function() {
  it("Zero", function() {
    assertNumber(0);
  });

  it("One", function() {
    assertNumber(1);
  });

  it("Negative One", function() {
    assertNumber(-1);
  });

  it("String", function() {
    assert.throws(() => {
      assertNumber("Something Here.");
    });
  });

  it("Object", function() {
    assert.throws(() => {
      assertNumber({
        a: 1,
        b: []
      });
    });
  });

  it("Array", function() {
    assert.throws(() => {
      assertNumber([1, 2, 3]);
    });
  });

  it("Class Instance", function() {
    class X {
      private p: number;
      constructor(p: number) {
        this.p = p;
      }
    }
    assert.throws(() => {
      assertNumber(new X(3));
    });

    assert.throws(() => {
      assertNumber(new X(0));
    });
  });
});
