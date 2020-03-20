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

  private *filterImpl(predicate: (v: T) => boolean): Generator<T> {
    for (const e of this.iterable) {
      if (predicate(e)) {
        yield e;
      }
    }
  }

  /**
   * @returns a new iterable of filtered elements.
   */
  filter(predicate: (v: T) => boolean): FunctionalIterable<T> {
    return new FunctionalIterable(this.filterImpl(predicate));
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
