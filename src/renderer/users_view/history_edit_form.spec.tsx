import * as React from "react";
import { expect } from "chai";
import { HistoryEditFormProps, HistoryEditForm } from "./history_edit_form";
import {
  render,
  RenderResult,
  queries,
  cleanup,
  within,
  prettyDOM,
  waitFor
} from "@testing-library/react";
import { AppDataContext } from "../app_data_context";
import { AppData, createAppData } from "../../common/persistence/app_data";
import { User } from "../../common/persistence/user";
import { Book } from "../../common/persistence/book";
import { assertWrapper } from "../../common/assert_wrapper";
import * as moment from "moment";
import * as sinon from "sinon";

/**
 * Find a history list element by matching regex.
 * Throw if search failed or more than one element matches.
 */
export function getHistoryListElementByText(
  container: HTMLElement,
  text: RegExp
): HTMLElement {
  const ret = within(container)
    .queryAllByTestId("history-list-element")
    .filter(historyListElement => historyListElement.textContent?.match(text));
  if (ret.length === 0) {
    throw new Error(
      [`No history list element matching ${text}`, prettyDOM(container)].join(
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
 * Find all history list elements.
 */
export function queryAllHistoryListElement(
  container: HTMLElement
): Array<HTMLElement> {
  return within(container).queryAllByTestId("history-list-element");
}

/**
 * Wrapper function for render.
 */
export function renderHistoryEditForm(
  appData: AppData,
  setAppData: (x: AppData) => void,
  props: HistoryEditFormProps
): RenderResult<typeof queries> {
  return render(
    <AppDataContext.Provider
      value={{
        appData: appData,
        setAppData: setAppData
      }}
    >
      <HistoryEditForm {...props} />
    </AppDataContext.Provider>
  );
}

describe("HistoryEditForm", function() {
  afterEach(function() {
    cleanup();
  });

  it("Display Most Recent History First", async function() {
    const user: User = {
      id: 6,
      firstName: "Natalie",
      lastName: "Nason"
    };
    const bookA: Book = {
      id: 1,
      title: "A",
      author: "A"
    };
    const bookB: Book = {
      id: 2,
      title: "B",
      author: "B"
    };
    const bookC: Book = {
      id: 3,
      title: "C",
      author: "C"
    };
    const appData = createAppData({
      users: [user],
      books: [bookA, bookB, bookC],
      views: [
        {
          id: 1000,
          userId: 6,
          bookId: 2,
          date: moment.utc("20070303").valueOf()
        },
        {
          id: 2000,
          userId: 6,
          bookId: 1,
          date: moment.utc("20080303").valueOf()
        },
        {
          id: 3000,
          userId: 6,
          bookId: 3,
          date: moment.utc("20090303").valueOf()
        }
      ]
    });
    assertWrapper(appData);
    const { container } = renderHistoryEditForm(appData, sinon.fake(), {
      user: user
    });
    return waitFor(() => {
      const actual = queryAllHistoryListElement(container).map(
        element => element.textContent
      );
      expect(actual).to.have.lengthOf(3);
      expect(actual[0]).to.match(/C/);
      expect(actual[1]).to.match(/A/);
      expect(actual[2]).to.match(/B/);
    });
  });
});
