import { FunctionalIterable } from "./functional_iterable";
import { generatePermutation } from "./generate_permutation";

/**
 * Remove whitespaces and make all characters upper-case.
 */
function normalize(s: string): string {
  return s.replace(/\s/g, "").toUpperCase();
}

/**
 * Check if the pattern matches the target.
 */
function matchString(pattern: string, target: string): boolean {
  if (pattern.length === 0) {
    return true;
  }
  const i = target.indexOf(pattern[0]);
  if (i === -1) {
    // Pattern not found.
    return false;
  }
  // Found the first character.
  // Find the rest of the pattern from the remaining substring.
  return matchString(pattern.slice(1), target.slice(i + 1));
}

/**
 * Check if the target object matches the given string pattern.
 * @param pattern string pattern to be matched against target.
 * @param keys collection of keys in target to be used in pattern matching.
 * @param target target object to be tested.
 * @returns `true` if match. `false` otherwise.
 */
export function matchPattern<
  K extends string,
  T extends { [key in K]?: string }
>(pattern: string, keys: Iterable<K>, target: T): boolean {
  const normalizedPattern = normalize(pattern);
  const values: Iterable<string> = new FunctionalIterable(keys)
    .map(key => target[key])
    .filter((value): value is T[K] & string => value !== undefined)
    .map(value => normalize(value));

  // Order of values should not determine the match result.
  // Get permutation of values and try to find
  // if there is a matching case.
  for (const orderedValues of generatePermutation(values)) {
    const reducedString = new FunctionalIterable(orderedValues).reduce(
      (a, b) => a + b,
      ""
    );
    if (matchString(normalizedPattern, reducedString)) {
      // Match found.
      return true;
    }
  }
  // No match found.
  return false;
}
