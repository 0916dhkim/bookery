import { describe, it } from "mocha";
import * as assert from "assert";
import * as moment from "moment";
import { View, ViewSerializer } from "../../src/persistence/view";

function assertViewProperties(
  view: View,
  id: number,
  userId: number,
  bookId: number,
  date: moment.Moment
): void {
  assert.strictEqual(view.id, id);
  assert.strictEqual(view.userId, userId);
  assert.strictEqual(view.bookId, bookId);
  assert.strictEqual(view.date.valueOf(), date.valueOf());
}

describe("View", function() {
  describe("ViewSerializer", function() {
    it("Single View Serialization and Deserialization", function() {
      const view = new View(1, 2, 3, moment.utc(1318781875806));
      const viewSerializer = new ViewSerializer();
      const str = viewSerializer.serialize(view);
      const deserialized = viewSerializer.deserialize(str);
      assertViewProperties(
        deserialized,
        view.id,
        view.userId,
        view.bookId,
        view.date
      );
    });

    it("Date Serialization", function() {
      const view = new View(4, 5, 6, moment.utc(1318781875807));
      const viewSerializer = new ViewSerializer();
      const str = viewSerializer.serialize(view);
      const deserialized = viewSerializer.deserialize(str);

      const year = view.date.utc().year();
      const month = view.date.utc().month();
      const date = view.date.utc().date();
      const hour = view.date.utc().hour();
      const minute = view.date.utc().minute();
      const second = view.date.utc().second();
      const millisecond = view.date.utc().millisecond();

      assert.strictEqual(year, deserialized.date.utc().year());
      assert.strictEqual(month, deserialized.date.utc().month());
      assert.strictEqual(date, deserialized.date.utc().date());
      assert.strictEqual(hour, deserialized.date.utc().hour());
      assert.strictEqual(minute, deserialized.date.utc().minute());
      assert.strictEqual(second, deserialized.date.utc().second());
      assert.strictEqual(millisecond, deserialized.date.utc().millisecond());
    });
  });
});
