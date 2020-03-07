import { describe, it } from "mocha";
import * as assert from "assert";
import * as moment from "moment";
import { View, ViewSerializer } from "../../src/persistence/view";

describe("View", function() {
  describe("equals", function() {
    it("Simple Equality", async function() {
      const a = new View(10823, 35, 707, moment.utc("20200103").valueOf());
      const b = new View(10823, 35, 707, moment.utc("20200103").valueOf());
      assert(a.equals(b));
      assert(b.equals(a));
    });
    it("Simple Inequality", async function() {
      const a = new View(10823, 35, 707, moment.utc("20200103").valueOf());
      const b = new View(20391, 45, 808, moment.utc("20181230").valueOf());
      assert(!a.equals(b));
      assert(!b.equals(a));
    });
  });
  describe("ViewSerializer", function() {
    it("Single View Serialization and Deserialization", function() {
      const view = new View(1, 2, 3, 1318781875806);
      const viewSerializer = new ViewSerializer();
      const str = viewSerializer.serialize(view);
      const deserialized = viewSerializer.deserialize(str);
      assert(deserialized.equals(view));
    });

    it("Date Serialization", function() {
      const view = new View(4, 5, 6, 1318781875807);
      const viewSerializer = new ViewSerializer();
      const str = viewSerializer.serialize(view);
      const deserialized = viewSerializer.deserialize(str);

      const viewDate = moment.utc(view.date);
      const deserializedDate = moment.utc(deserialized.date);

      const year = viewDate.utc().year();
      const month = viewDate.utc().month();
      const date = viewDate.utc().date();
      const hour = viewDate.utc().hour();
      const minute = viewDate.utc().minute();
      const second = viewDate.utc().second();
      const millisecond = viewDate.utc().millisecond();

      assert.strictEqual(year, deserializedDate.utc().year());
      assert.strictEqual(month, deserializedDate.utc().month());
      assert.strictEqual(date, deserializedDate.utc().date());
      assert.strictEqual(hour, deserializedDate.utc().hour());
      assert.strictEqual(minute, deserializedDate.utc().minute());
      assert.strictEqual(second, deserializedDate.utc().second());
      assert.strictEqual(millisecond, deserializedDate.utc().millisecond());
    });
  });
});
