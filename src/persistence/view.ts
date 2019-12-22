import { Serializer } from "./serializable";
import * as moment from "moment";
export class View {
  private userId: number;
  private bookId: number;
  private date: moment.Moment;
}

export class ViewSerializer implements Serializer<View> {
  public serialize(target: View): string {
    // TODO: Implement.
    return "";
  }

  public deserialize(serializedString: string): View {
    // TODO: Implement.
    return undefined;
  }
}
