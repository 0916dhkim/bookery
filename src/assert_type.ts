import * as assert from "assert";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assertNumber(val: any): asserts val is number {
  assert.strictEqual(typeof val, "number");
}
