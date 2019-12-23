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
  });
});
