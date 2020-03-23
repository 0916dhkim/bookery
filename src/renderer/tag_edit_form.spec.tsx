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
  queries,
  waitFor
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TagEditForm, TagEditFormProps } from "./tag_edit_form";
import { AppData, createAppData } from "../common/persistence/app_data";
import { AppDataContext } from "./app_data_context";
import { assertWrapper } from "../common/assert_wrapper";

/**
 * Find the tag input element in the container element.
 * Throw if search failed.
 */
export function getTagInput(container: HTMLElement): HTMLElement {
  let ret: HTMLElement | null = within(container).getByTestId("tag-input");
  if (!ret.matches("input")) {
    ret = ret.querySelector("input");
  }
  if (!ret) {
    throw new Error([`Missing tag input`, prettyDOM(container)].join("\n\n"));
  }
  return ret;
}

/**
 * Find the add tag button in the container element.
 * Throw if search failed.
 */
export function getAddTagButton(container: HTMLElement): HTMLElement {
  let ret: HTMLElement | null = within(container).getByTestId("add-tag-button");
  if (!ret.matches("button")) {
    ret = ret.querySelector("button");
  }
  if (!ret) {
    throw new Error(
      ["Missing add tag button", prettyDOM(container)].join("\n\n")
    );
  }
  return ret;
}

/**
 * Find a tag list element by matching regex.
 * Throw if search failed or more than one element matches.
 */
export function getTagListElementByText(
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

/**
 * Wrapper function for render.
 */
export function renderTagEditForm(
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

  it("Display Book Tag List", async function() {
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
    return waitFor(() => {
      getTagListElementByText(container, /fiction/);
      getTagListElementByText(container, /english/);
    });
  });

  it("Display User Tag List", async function() {
    const appData = createAppData({
      users: [
        {
          id: 606,
          firstName: "George",
          lastName: "Xi",
          note: "-"
        }
      ],
      tags: [
        {
          id: 13,
          name: "1999"
        },
        {
          id: 15,
          name: "mandarin-speaker"
        }
      ],
      userTags: [[606, [13, 15]]]
    });
    assertWrapper(appData);
    const { container } = renderTagEditForm(appData, sinon.fake(), {
      type: "user",
      userId: 606
    });
    return waitFor(() => {
      getTagListElementByText(container, /1999/);
      getTagListElementByText(container, /mandarin-speaker/);
    });
  });

  it("Add A New Tag", async function() {
    const appData = createAppData({
      books: [
        {
          id: 4444,
          title: "Into the Darkness",
          author: "Doctor Evil"
        }
      ],
      tags: [
        {
          id: 50,
          name: "fiction"
        },
        {
          id: 60,
          name: "nonfiction"
        },
        {
          id: 70,
          name: "bestseller"
        },
        {
          id: 80,
          name: "sci-fi"
        }
      ],
      bookTags: [[4444, [50, 70]]]
    });
    assertWrapper(appData);
    const fakeSetAppData = sinon.fake();
    const { container } = renderTagEditForm(appData, fakeSetAppData, {
      type: "book",
      bookId: 4444
    });
    // Type "sci-fi" in the input element.
    const input = await waitFor(getTagInput.bind(null, container));
    await userEvent.type(input, "sci-fi");
    // Click the add tag button.
    const addTagButton = await waitFor(getAddTagButton.bind(null, container));
    userEvent.click(addTagButton);
    const expected = createAppData({
      books: [
        {
          id: 4444,
          title: "Into the Darkness",
          author: "Doctor Evil"
        }
      ],
      tags: [
        {
          id: 50,
          name: "fiction"
        },
        {
          id: 60,
          name: "nonfiction"
        },
        {
          id: 70,
          name: "bestseller"
        },
        {
          id: 80,
          name: "sci-fi"
        }
      ],
      bookTags: [[4444, [50, 70, 80]]]
    });
    return waitFor(() => {
      expect(fakeSetAppData.calledOnce).to.be.true;
      expect(fakeSetAppData.firstCall.args[0]).deep.equals(expected);
    });
  });
});
