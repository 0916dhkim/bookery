import * as React from "react";
import { describe, it, afterEach } from "mocha";
import { expect } from "chai";
import * as sinon from "sinon";
import {
  render,
  cleanup,
  prettyDOM,
  within,
  RenderResult,
  queries
} from "@testing-library/react";
import { TagEditForm, TagEditFormProps } from "./tag_edit_form";
import { AppData, createAppData } from "../common/persistence/app_data";
import { AppDataContext } from "./app_data_context";
import { assertWrapper } from "../common/assert_wrapper";

function getTagInput(container: HTMLElement): HTMLInputElement {
  const ret = within(container)
    .getByTestId("tag-input")
    .querySelector("input");
  if (!ret) {
    throw new Error([`Missing tag input`, prettyDOM(container)].join("\n\n"));
  }
  return ret;
}

function getTagListElementByText(
  container: HTMLElement,
  text: RegExp
): HTMLElement {
  const ret = within(container)
    .queryAllByTestId("tag-list-element")
    .filter(tagListElement => tagListElement.textContent?.match(text));
  if (ret.length === 0) {
    throw new Error(
      [`No tag list element matching ${text}`, prettyDOM(container)].join(
        "\n\n"
      )
    );
  } else if (ret.length > 1) {
    throw new Error(
      [
        `${ret.length} tag list elements matching ${text}`,
        prettyDOM(container)
      ].join("\n\n")
    );
  }
  return ret[0];
}

function renderTagEditForm(
  appData: AppData,
  setAppData: (x: AppData) => void,
  props: TagEditFormProps
): RenderResult<typeof queries> {
  return render(
    <AppDataContext.Provider
      value={{
        appData: appData,
        setAppData: setAppData
      }}
    >
      <TagEditForm {...props} />
    </AppDataContext.Provider>
  );
}

describe("TagEditForm", function() {
  afterEach(function() {
    cleanup();
  });

  describe("Display", function() {
    it("Tag List", function() {
      const appData = createAppData({
        books: [
          {
            id: 33,
            title: "Tagged Book",
            author: "James"
          }
        ],
        tags: [
          {
            id: 13,
            name: "fiction"
          },
          {
            id: 15,
            name: "english"
          }
        ],
        bookTags: [[33, [13, 15]]]
      });
      assertWrapper(appData);
      const { container } = renderTagEditForm(appData, sinon.fake(), {
        type: "book",
        bookId: 33
      });
      expect(getTagListElementByText(container, /fiction/)).not.to.throw;
      expect(getTagListElementByText(container, /english/)).not.to.throw;
    });
  });
});
