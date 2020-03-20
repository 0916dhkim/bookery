/**
 * Wrapper class for iterable interface.
 * Provides basic data manipulation methods for iterables.
 */
export class FunctionalIterable<T> implements Iterable<T> {
  private iterable: Iterable<T>;
  constructor(iterable: Iterable<T>) {
    this.iterable = iterable;
  }

  *[Symbol.iterator](): Generator<T> {
    for (const v of this.iterable) {
      yield v;
    }
  }

  private *mapImpl<R>(mapper: (v: T) => R): Generator<R> {
    for (const e of this.iterable) {
      yield mapper(e);
    }
  }

  /**
   * @returns a new iterable of mapped elements.
   */
  map<R>(mapper: (v: T) => R): FunctionalIterable<R> {
    return new FunctionalIterable(this.mapImpl(mapper));
  }

  filter<S extends T>(predicate: (v: T) => v is S): FunctionalIterable<S>;
  filter(predicate: (v: T) => boolean): FunctionalIterable<T>;
  /**
   * @returns a new iterable of filtered elements.
   */
  filter(predicate: (v: T) => boolean): FunctionalIterable<T> {
    return new FunctionalIterable(
      (function*(it: Iterable<T>): Generator<T> {
        for (const e of it) {
          if (predicate(e)) {
            yield e;
          }
        }
      })(this.iterable)
    );
  }

  /**
   * @returns the reduced value.
   */
  reduce<R>(reducer: (accumulator: R, current: T) => R, initial: R): R {
    let ret = initial;
    for (const e of this.iterable) {
      ret = reducer(ret, e);
    }
    return ret;
  }
}
