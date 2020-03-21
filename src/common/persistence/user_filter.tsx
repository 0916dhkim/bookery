import { Filter } from "./filter";
import { User } from "./user";
import { FunctionalIterable } from "./functional_iterable";
import { matchPattern } from "./match_pattern";

export class UserFilter implements Filter<User> {
  private users: Array<User>;
  constructor(data: Iterable<User>) {
    this.users = Array.from(data);
    this.users.sort((a, b) => b.id - a.id);
  }

  filter(query: string): Iterable<User> {
    return new FunctionalIterable(this.users).filter(user =>
      matchPattern(query, ["firstName", "lastName", "note"], user)
    );
  }
}
