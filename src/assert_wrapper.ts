import * as assert from "assert";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assertWrapper(condition: any): asserts condition {
  assert(condition);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assertNumber(val: any): asserts val is number {
  assertWrapper(typeof val === "number");
}
