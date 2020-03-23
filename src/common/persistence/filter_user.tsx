import { User } from "./user";
import { FunctionalIterable } from "./functional_iterable";
import { matchPattern } from "./match_pattern";
import { AppData } from "./app_data";

export function filterUser(appData: AppData, query: string): Iterable<User> {
  const filtered = new FunctionalIterable(appData.users.values()).filter(user =>
    matchPattern(query, ["firstName", "lastName", "note"], user)
  );
  return Array.from(filtered).reverse();
}
