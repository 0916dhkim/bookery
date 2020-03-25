import { render, cleanup, within, waitFor } from "@testing-library/react";
import { BooksView } from ".";
import * as React from "react";
import { AppDataContext } from "../app_data_context";
import { AppData, createAppData } from "../../common/persistence/app_data";
import * as moment from "moment";
import userEvent from "@testing-library/user-event";
import * as sinon from "sinon";
import * as assert from "assert";
import { RequestContext } from "../request_context";
import { assertWrapper } from "../../common/assert_wrapper";

const sandbox = sinon.createSandbox();

describe("BooksView", function() {
  afterEach(function() {
    sandbox.restore();
    cleanup();
  });

  describe("Delete Button", function() {
    it("Deleting A Book Should Cascade", async function() {
      const x: AppData | null = createAppData({
        books: [
          { id: 1, title: "ABC", author: "noname" },
          { id: 2, title: "DEF", author: "noname" }
        ],
        users: [
          { id: 3, lastName: "Smith", firstName: "Dan" },
          { id: 4, lastName: "Kennedy", firstName: "Frank" }
        ],
        views: [
          {
            id: 5,
            userId: 3,
            bookId: 1,
            date: moment.utc("20100517").valueOf()
          },
          {
            id: 6,
            userId: 4,
            bookId: 1,
            date: moment.utc("20111203").valueOf()
          },
          {
            id: 7,
            userId: 4,
            bookId: 2,
            date: moment.utc("20120109").valueOf()
          }
        ]
      });
      assertWrapper(x);

      const fakeSetAppData = sandbox.stub<[AppData], void>();
      const fakeRequest = sandbox.stub();
      fakeRequest
        .withArgs(sinon.match.has("type", "SHOW-OVERRIDE-WARNING"))
        .returns("Save");
      fakeRequest
        .withArgs(sinon.match.has("type", "SHOW-WARNING-MESSAGE"))
        .returns("OK");
      const { getByTestId } = render(
        <AppDataContext.Provider
          value={{
            appData: x,
            setAppData: fakeSetAppData
          }}
        >
          <RequestContext.Provider
            value={{
              request: fakeRequest
            }}
          >
            <BooksView />
          </RequestContext.Provider>
        </AppDataContext.Provider>
      );

      userEvent.click(
        await waitFor(() => {
          return within(getByTestId("suggestions-list")).getByText(/DEF/);
        })
      );
      userEvent.click(
        await waitFor(() => {
          return getByTestId("book-delete-button");
        })
      );

      return waitFor(() => {
        assert(fakeSetAppData.calledOnce);
        const nextAppData = fakeSetAppData.firstCall.args[0];
        assert.strictEqual(nextAppData.books.size, 1, "One book deleted.");
        assert.strictEqual(nextAppData.users.size, 2, "No user deleted.");
        assert.strictEqual(
          nextAppData.views.size,
          2,
          "One out of three views is deleted."
        );
      });
    });
  });
});
