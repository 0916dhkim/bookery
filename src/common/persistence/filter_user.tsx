import { User } from "./user";
import { FunctionalIterable } from "./functional_iterable";
import { matchPattern } from "./match_pattern";
import { AppData } from "./app_data";
import { matchTag } from "./filter_tag";

export function filterUser(appData: AppData, query: string): Iterable<User> {
  // Separate tag query from regular query.
  const queryWords = query.split(/\s+/);
  const tagQueries: Array<string> = [];
  const regularQueries: Array<string> = [];
  for (const word of queryWords) {
    if (word.startsWith("#")) {
      tagQueries.push(word.slice(1));
    } else {
      regularQueries.push(word);
    }
  }
  let filtered = new FunctionalIterable(appData.users.values());
  for (const tagQuery of tagQueries) {
    filtered = filtered.filter(user => {
      const tagSet = appData.userTags.get(user.id); // this user's tags.
      if (!tagSet) {
        // There is no tag associated with this user.
        return false;
      }
      for (const tagId of tagSet) {
        const tag = appData.tags.get(tagId);
        if (tag && matchTag(tag, tagQuery)) {
          // Found a matching tag.
          return true;
        }
      }
      // Matching tag not found.
      return false;
    });
  }
  // Filter by regular query.
  filtered = filtered.filter(user =>
    matchPattern(
      regularQueries.join(""),
      ["firstName", "lastName", "note"],
      user
    )
  );
  return Array.from(filtered).reverse();
}
