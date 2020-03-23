import { describe, it } from "mocha";
import { expect } from "chai";
import { filterTag } from "./filter_tag";
import { Tag } from "./tag";
import { createAppData } from "./app_data";
import { assertWrapper } from "../assert_wrapper";

describe("TagFilter", function() {
  describe("Simple", function() {
    const tag: Tag = {
      id: 3,
      name: "Example"
    };
    const appData = createAppData({
      tags: [tag]
    });
    assertWrapper(appData);
    it("Match", function() {
      const actual = Array.from(filterTag(appData, "Example"));
      const expected = [tag];
      expect(actual).deep.equals(expected);
    });
    it("Case-Insensitive", function() {
      const actual = Array.from(filterTag(appData, "example"));
      const expected = [tag];
      expect(actual).deep.equals(expected);
    });
    it("Simple Mismatch", function() {
      const actual = Array.from(filterTag(appData, "Tutorial"));
      expect(actual).deep.equals([]);
    });
    it("Substring Mismatch", function() {
      const actual = Array.from(filterTag(appData, "xam"));
      expect(actual).deep.equals([]);
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
    const appData = createAppData({
      tags: [themeTag, darkTag, lightTag]
    });
    assertWrapper(appData);
    it("Base Match", function() {
      const actual = Array.from(filterTag(appData, "theme"));
      const expected = [themeTag, darkTag, lightTag];
      expect(actual).to.have.deep.members(expected);
    });
    it("Full Match", function() {
      const actual = Array.from(filterTag(appData, "theme/dark"));
      const expected = [darkTag];
      expect(actual).to.have.deep.members(expected);
    });
    it("Leaf Match", function() {
      // A hierarchical tag should not match by the leaf itself.
      const actual = Array.from(filterTag(appData, "light"));
      expect(actual).to.have.deep.members([]);
    });
  });
});
