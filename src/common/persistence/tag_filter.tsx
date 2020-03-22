import { Filter } from "./filter";
import { Tag } from "./tag";

export class TagFilter implements Filter<Tag> {
  constructor(data: Iterable<Tag>) {
    // TODO: Implement.
  }

  filter(query: string): Iterable<Tag> {
    // TODO: Implement.
    return [];
  }
}
