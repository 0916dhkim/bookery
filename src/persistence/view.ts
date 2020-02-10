import { Serializer } from "./serializable";
import * as moment from "moment";
import { Queryable } from "./queryable";
export class View implements Queryable {
  private _userId: number;
  get userId(): number {
    return this._userId;
  }
  set userId(newUserId: number) {
    this._userId = newUserId;
  }

  private _bookId: number;
  get bookId(): number {
    return this._bookId;
  }
  set bookId(newBookId: number) {
    this._bookId = newBookId;
  }

  private _date: moment.Moment;
  get date(): moment.Moment {
    return this._date;
  }
  set date(newDate: moment.Moment) {
    this._date = newDate;
  }

  constructor(
    readonly id: number,
    userId: number,
    bookId: number,
    date: moment.Moment
  ) {
    this.userId = userId;
    this.bookId = bookId;
    this.date = date;
  }

  query(queryString: string): number {
    // TODO: Implement.
    return -1;
  }
}

export class ViewSerializer implements Serializer<View> {
  public serialize(target: View): string {
    return JSON.stringify({
      id: target.id,
      userId: target.userId,
      bookId: target.bookId,
      date: target.date.valueOf()
    });
  }

  public deserialize(serializedString: string): View {
    const parsedJson = JSON.parse(serializedString);
    return new View(
      parsedJson.id,
      parsedJson.userId,
      parsedJson.bookId,
      moment(parsedJson.date)
    );
  }
}
