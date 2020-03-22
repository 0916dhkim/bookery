import { Filter } from "./filter";
import { Tag } from "./tag";
import { FunctionalIterable } from "./functional_iterable";

export class TagFilter implements Filter<Tag> {
  private tags: Set<{ sections: Array<string>; tag: Tag }>;
  constructor(data: Iterable<Tag>) {
    this.tags = new Set();
    for (const tag of data) {
      const tagSections = tag.name
        .split("/")
        .map(section => section.toUpperCase());
      this.tags.add({
        sections: tagSections,
        tag: tag
      });
    }
  }

  filter(query: string): Iterable<Tag> {
    const querySections = query
      .split("/")
      .map(section => section.toUpperCase());
    return new FunctionalIterable(this.tags)
      .filter(({ sections }) => {
        for (let i = 0; i < querySections.length; i++) {
          if (i >= sections.length || querySections[i] !== sections[i]) {
            return false;
          }
        }
        return true;
      })
      .map(({ tag }) => tag);
  }
}
