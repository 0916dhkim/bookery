/**
 * Create an iterable from another iterable
 * by prepending another element in front of the original iterable.
 * @param head element to be prepended
 * @param tail original iterable
 */
function* prependIterable<T>(head: T, tail: Iterable<T>): Generator<T> {
  yield head;
  for (const n of tail) {
    yield n;
  }
}

/**
 * Iterable that iterates an array except for
 * the array's n-th element.
 */
function* arrayExceptNth<T>(arr: Array<T>, n: number): Generator<T> {
  for (let i = 0; i < arr.length; i++) {
    if (i !== n) {
      yield arr[i];
    }
  }
}

/**
 * Iterable that iterates each permutation of the given iterable.
 * @param items iterable to be permuted
 */
export function* generatePermutation<T>(
  items: Iterable<T>
): Generator<Iterable<T>> {
  const itemArray = Array.from(items);
  if (itemArray.length === 0) {
    yield [];
  }
  for (let i = 0; i < itemArray.length; i++) {
    for (const subPermutation of generatePermutation(
      arrayExceptNth(itemArray, i)
    )) {
      yield prependIterable(itemArray[i], subPermutation);
    }
  }
}
