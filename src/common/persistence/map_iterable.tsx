/**
 * Maps each element from an iterable
 * with the given function.
 */
export function* mapIterable<P, Q>(
  iterable: Iterable<P>,
  f: (e: P) => Q
): Generator<Q> {
  for (const e of iterable) {
    yield f(e);
  }
}
