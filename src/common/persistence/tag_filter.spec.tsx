import { describe, it } from "mocha";
import { expect } from "chai";
import { TagFilter } from "./tag_filter";
import { Tag } from "./tag";

describe("TagFilter", function() {
  describe("Simple", function() {
    const tag: Tag = {
      id: 3,
      name: "Example"
    };
    const filter: TagFilter = new TagFilter([tag]);
    it("Match", function() {
      const res = Array.from(filter.filter("Example"));
      expect(res).deep.equals([tag]);
    });
    it("Case-Insensitive", function() {
      const res = Array.from(filter.filter("example"));
      expect(res).deep.equals([tag]);
    });
    it("Simple Mismatch", function() {
      const res = Array.from(filter.filter("Tutorial"));
      expect(res).to.have.lengthOf(0);
    });
    it("Substring Mismatch", function() {
      const res = Array.from(filter.filter("xam"));
      expect(res).to.have.lengthOf(0);
    });
  });
  describe("Hierarchical Tag", function() {
    const themeTag: Tag = {
      id: 49,
      name: "theme"
    };
    const darkTag: Tag = {
      id: 999,
      name: "theme/dark"
    };
    const lightTag: Tag = {
      id: 888,
      name: "theme/light"
    };
    const filter = new TagFilter([themeTag, darkTag, lightTag]);
    it("Base Match", function() {
      const res = Array.from(filter.filter("theme"));
      expect(res).to.deep.equals([themeTag, darkTag, lightTag]);
    });
    it("Full Match", function() {
      const res = Array.from(filter.filter("theme/dark"));
      expect(res).deep.equals([darkTag]);
    });
    it("Leaf Match", function() {
      // A hierarchical tag should not match by the leaf itself.
      const res = Array.from(filter.filter("light"));
      expect(res).to.have.lengthOf(0);
    });
  });
});
