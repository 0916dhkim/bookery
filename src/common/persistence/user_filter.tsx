import { Filter } from "./filter";
import { User } from "./user";
import * as Fuse from "fuse.js";

const userFuseOptions: Fuse.FuseOptions<User> = {
  shouldSort: true,
  includeMatches: false,
  includeScore: false,
  keys: ["lastName", "firstName", "note"]
};

export class UserFilter implements Filter<User> {
  private users: Array<User>;
  private fuse: Fuse<User, Fuse.FuseOptions<User>>;
  constructor(data: Iterable<User>) {
    this.users = Array.from(data);
    this.fuse = new Fuse(this.users, userFuseOptions);
  }

  filter(query: string): Iterable<User> {
    if (query === "") {
      return this.users;
    }
    return this.fuse.search(query) as Array<User>;
  }
}
