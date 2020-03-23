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

  /**
   * @returns a new iterable of mapped elements.
   */
  map<R>(mapper: (v: T) => R): FunctionalIterable<R> {
    const iterable = this.iterable;
    function* mapImpl(): Generator<R> {
      for (const e of iterable) {
        yield mapper(e);
      }
    }
    return new FunctionalIterable({
      [Symbol.iterator]: mapImpl
    });
  }

  filter<S extends T>(predicate: (v: T) => v is S): FunctionalIterable<S>;
  filter(predicate: (v: T) => boolean): FunctionalIterable<T>;
  /**
   * @returns a new iterable of filtered elements.
   */
  filter(predicate: (v: T) => boolean): FunctionalIterable<T> {
    const iterable = this.iterable;
    function* filterImpl(): Generator<T> {
      for (const e of iterable) {
        if (predicate(e)) {
          yield e;
        }
      }
    }
    return new FunctionalIterable({
      [Symbol.iterator]: filterImpl
    });
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
