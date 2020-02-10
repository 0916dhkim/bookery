import * as assert from "assert";
import { Queryable } from "../../src/persistence/queryable";

export function assertQuery(
  instance: Queryable,
  queryString: string,
  expected: number
): void {
  assert.strictEqual(instance.query(queryString), expected);
}
