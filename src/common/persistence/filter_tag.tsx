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

export function filterTag(appData: AppData, query: string): Iterable<Tag> {
  const querySections = divideIntoNormalizedSections(query);
  return new FunctionalIterable(appData.tags.values()).filter(tag => {
    const tagSections = divideIntoNormalizedSections(tag.name);
    for (let i = 0; i < querySections.length; i++) {
      if (i >= tagSections.length || querySections[i] !== tagSections[i]) {
        return false;
      }
    }
    return true;
  });
}
