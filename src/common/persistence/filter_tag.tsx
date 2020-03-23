import { Tag } from "./tag";
import { FunctionalIterable } from "./functional_iterable";
import { AppData } from "./app_data";

/**
 * Divide the given string into parts using forward slash
 * as a delimiter.
 * Normalize case by make all characters uppercase.
 * @param s Original string. Assume no whitespace.
 */
function divideIntoNormalizedSections(s: string): Array<string> {
  return s.toUpperCase().split("/");
}

/**
 * @param tag target tag.
 * @param query query string.
 * @returns `true` if query matches the given tag. `false` otherwise.
 */
export function matchTag(tag: Tag, query: string): boolean {
  const tagSections = divideIntoNormalizedSections(tag.name);
  const querySections = divideIntoNormalizedSections(query);
  for (let i = 0; i < querySections.length; i++) {
    if (i >= tagSections.length || querySections[i] !== tagSections[i]) {
      return false;
    }
  }
  return true;
}

export function filterTag(appData: AppData, query: string): Iterable<Tag> {
  return new FunctionalIterable(appData.tags.values()).filter(tag =>
    matchTag(tag, query)
  );
}
