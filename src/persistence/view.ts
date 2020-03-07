import { Serializer } from "./serializable";
import { immerable } from "immer";

export class View {
  [immerable] = true;

  constructor(
    readonly id: number,
    readonly userId: number,
    readonly bookId: number,
    /**
     * UNIX timestamp in milliseconds.
     */
    readonly date: number
  ) {}

  equals(other: View): boolean {
    return (
      this.id === other.id &&
      this.userId === other.userId &&
      this.bookId === other.bookId &&
      this.date === other.date
    );
  }
}

export class ViewSerializer implements Serializer<View> {
  public serialize(target: View): string {
    return JSON.stringify({
      id: target.id,
      userId: target.userId,
      bookId: target.bookId,
      date: target.date
    });
  }

  public deserialize(serializedString: string): View {
    const parsedJson = JSON.parse(serializedString);
    return new View(
      parsedJson.id,
      parsedJson.userId,
      parsedJson.bookId,
      parsedJson.date
    );
  }
}
