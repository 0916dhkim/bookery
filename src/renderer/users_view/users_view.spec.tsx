import { describe, it, afterEach, beforeEach } from "mocha";
import {
  render,
  within,
  cleanup,
  RenderResult,
  waitForDomChange,
  wait
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { UsersView } from ".";
import { AppData, createAppData } from "../../common/persistence/app_data";
import * as assert from "assert";
import { AppDataContext } from "../app_data_context";
import { act } from "react-dom/test-utils";
import { assertWrapper } from "../../common/assert_wrapper";
import * as moment from "moment";
import { RequestContext } from "../request_context";
import * as sinon from "sinon";

const fakeRequest = sinon.stub();

interface TesterState {
  appData: AppData;
}

class Tester extends React.Component<{}, TesterState> {
  constructor(props: { children: React.ReactElement }) {
    super(props);
    this.state = {
      appData: createAppData()
    };
  }
  render(): React.ReactNode {
    return (
      <AppDataContext.Provider
        value={{
          appData: this.state.appData,
          setAppData: (x: AppData): void => {
            this.setState({ appData: x });
          }
        }}
      >
        <RequestContext.Provider value={{ request: fakeRequest }}>
          <UsersView />
        </RequestContext.Provider>
      </AppDataContext.Provider>
    );
  }
}

const testerRef = React.createRef<Tester>();
let renderResult: RenderResult;
function getAppData(): AppData {
  assertWrapper(testerRef.current?.state.appData);
  return testerRef.current.state.appData;
}

function setAppData(x: AppData): void {
  act(() => {
    assertWrapper(testerRef.current);
    testerRef.current.setState({ appData: x });
  });
}

describe("UsersView", function() {
  beforeEach(function() {
    renderResult = render(
      <Tester ref={testerRef}>
        <UsersView />
      </Tester>
    );
    fakeRequest.reset();
    fakeRequest
      .withArgs(sinon.match.has("type", "SHOW-OVERRIDE-WARNING"))
      .returns("Save");
    fakeRequest
      .withArgs(sinon.match.has("type", "SHOW-WARNING-MESSAGE"))
      .returns("OK");
  });

  afterEach(function() {
    cleanup();
  });

  describe("Suggestions List", function() {
    it("Exists", function() {
      const x = createAppData({
        books: [],
        users: [
          { id: 1000, lastName: "Kid", firstName: "Derek", note: "Invincible." }
        ],
        views: []
      });
      assertWrapper(x);
      setAppData(x);
      assert(
        within(renderResult.getByTestId("suggestions-list")).getByText(/Kid/)
      );
    });
  });

  describe("Delete Button", function() {
    it("Exists", async function() {
      const x = createAppData({
        books: [],
        users: [
          {
            id: 120,
            lastName: "Dwarf",
            firstName: "Gnome",
            note: "Not a real good name, I know."
          },
          {
            id: 192,
            lastName: "King",
            firstName: "Arthur",
            note: "A great name, I know."
          }
        ],
        views: []
      });
      assertWrapper(x);
      setAppData(x);
      userEvent.click(
        within(renderResult.getByTestId("suggestions-list")).getByText(/King/)
      );
      await waitForDomChange();

      assert(renderResult.getByText(/Delete User/i));
    });

    it("Warns When Deleting A User", async function() {
      const x = createAppData({
        books: [],
        views: [],
        users: [
          { id: 532, lastName: "De Blasio", firstName: "Paul" },
          { id: 1124, lastName: "Panza", firstName: "Sancho" }
        ]
      });
      assertWrapper(x);
      setAppData(x);

      fakeRequest.reset();
      fakeRequest
        .withArgs(sinon.match.has("type", "SHOW-WARNING-MESSAGE"))
        .returns("Cancel");

      userEvent.click(
        within(renderResult.getByTestId("suggestions-list")).getByText(/Sancho/)
      );
      await waitForDomChange();
      userEvent.click(renderResult.getByText(/Delete User/i));
      await wait(() => {
        assert(fakeRequest.calledOnce);
      });
    });

    it("Abort Deleting When Requested", async function() {
      const x = createAppData({
        books: [],
        views: [],
        users: [
          { id: 3421, lastName: "Raider", firstName: "Trev" },
          { id: 9192, lastName: "Parker", firstName: "Fred" }
        ]
      });
      assertWrapper(x);
      setAppData(x);

      // Represent pressing cancel option.
      fakeRequest.reset();
      fakeRequest
        .withArgs(sinon.match.has("type", "SHOW-WARNING-MESSAGE"))
        .returns("Cancel");

      userEvent.click(
        within(renderResult.getByTestId("suggestions-list")).getByText(/Raider/)
      );
      await waitForDomChange();

      assert.strictEqual(getAppData().users.size, 2);

      userEvent.click(renderResult.getByText(/Delete User/i));
      await wait(() => {
        // Number of users should be unchanged.
        assert.strictEqual(getAppData().users.size, 2);
      });
    });

    it("Delete Single User", async function() {
      const x = createAppData({
        books: [],
        views: [],
        users: [
          {
            id: 582,
            lastName: "Solo",
            firstName: "Han",
            note: "Totally not from Star Wars"
          }
        ]
      });
      assertWrapper(x);
      setAppData(x);

      assert.strictEqual(getAppData().users.size, 1);

      userEvent.click(
        within(renderResult.getByTestId("suggestions-list")).getByText(/Solo/)
      );
      await waitForDomChange();

      // Click the delete button.
      userEvent.click(renderResult.getByText(/Delete User/i));
      await waitForDomChange();

      assert.strictEqual(getAppData().users.size, 0);
    });

    it("Deleting A User Hides The Edit Form", async function() {
      const x = createAppData({
        books: [],
        views: [],
        users: [
          { id: 5292, lastName: "Fury", firstName: "Neal" },
          {
            id: 1122,
            lastName: "Jackson",
            firstName: "Dan"
          }
        ]
      });
      assertWrapper(x);
      setAppData(x);

      userEvent.click(
        within(renderResult.getByTestId("suggestions-list")).getByText(
          /Jackson/
        )
      );
      await waitForDomChange();

      userEvent.click(renderResult.getByText(/Delete User/i));
      await waitForDomChange();

      assert.strictEqual(renderResult.queryByTestId("user-edit-form"), null);
    });

    it("Deleting A User Should Cascade", async function() {
      const x = createAppData({
        books: [
          { id: 522, title: "ABC", author: "noname" },
          { id: 1231, title: "DEF", author: "noname" }
        ],
        users: [
          { id: 9919, lastName: "Smith", firstName: "Dan" },
          { id: 3333, lastName: "Kennedy", firstName: "Frank" }
        ],
        views: [
          {
            id: 13,
            userId: 9919,
            bookId: 522,
            date: moment.utc("20100517").valueOf()
          },
          {
            id: 14,
            userId: 3333,
            bookId: 522,
            date: moment.utc("20111203").valueOf()
          },
          {
            id: 15,
            userId: 3333,
            bookId: 1231,
            date: moment.utc("20120109").valueOf()
          }
        ]
      });
      assertWrapper(x);
      setAppData(x);

      userEvent.click(
        within(renderResult.getByTestId("suggestions-list")).getByText(
          /Kennedy/
        )
      );
      await waitForDomChange();

      fakeRequest.reset();
      fakeRequest
        .withArgs(sinon.match.has("type", "SHOW-WARNING-MESSAGE"))
        .returns("OK");

      userEvent.click(renderResult.getByTestId("user-delete-button"));
      await waitForDomChange();

      assert.strictEqual(
        getAppData().books.size,
        2,
        "Number of books should remain the same"
      );
      assert.strictEqual(getAppData().users.size, 1, "Only Dan remains");
      assert.strictEqual(
        getAppData().views.size,
        1,
        "Frank's views should be deleted along with Frank"
      );
    });
  });

  describe("User History Edit Form", function() {
    describe("User History List Length", function() {
      it("Exists", async function() {
        const x = createAppData({
          books: [{ id: 874, title: "SDFLKA", author: "Tom Black" }],
          users: [{ id: 532, lastName: "Blue", firstName: "Gerald" }],
          views: []
        });
        assertWrapper(x);
        setAppData(x);

        userEvent.click(
          within(renderResult.getByTestId("suggestions-list")).getByText(
            /Gerald/
          )
        );
        await waitForDomChange();

        assert(renderResult.getByTestId("history-edit-form"));
      });

      it("No History View For New User", async function() {
        const x = createAppData({
          books: [{ id: 42901, title: "Pink", author: "Jace Tuna" }],
          users: [],
          views: []
        });
        assertWrapper(x);
        setAppData(x);

        userEvent.click(renderResult.getByText(/New User/i));
        await waitForDomChange();

        assert(!renderResult.queryByTestId("history-edit-form"));
        assert(!renderResult.queryByTestId("history-list"));
      });

      it("1 User 3 Books 2 Views", async function() {
        const x = createAppData({
          users: [{ id: 777, lastName: "A", firstName: "K" }],
          books: [
            { id: 1, title: "LSDKFK", author: "LSKQWE" },
            { id: 2, title: "RIELWWL", author: "OQWIKDS" },
            { id: 3, title: "RWOIVV", author: "PIOPWERU" }
          ],
          views: [
            {
              id: 1000,
              userId: 777,
              bookId: 1,
              date: moment.utc("20010101").valueOf()
            },
            {
              id: 2000,
              userId: 777,
              bookId: 2,
              date: moment.utc("20020202").valueOf()
            }
          ]
        });
        assertWrapper(x);
        setAppData(x);

        // Select user.
        userEvent.click(
          within(renderResult.getByTestId("suggestions-list")).getByText(/A/)
        );
        await waitForDomChange();

        assert(
          within(renderResult.getByTestId("history-list")).queryByText(/LSDKFK/)
        );
        assert(
          within(renderResult.getByTestId("history-list")).queryByText(
            /RIELWWL/
          )
        );
      });

      it("2 Users 2 Books 1 View Each (2 Total)", async function() {
        const x = createAppData({
          users: [
            {
              id: 401,
              lastName: "Tempest",
              firstName: "Alpha",
              note: "The One And Only Alpha!"
            },
            {
              id: 402,
              lastName: "Tempest",
              firstName: "Beta",
              note: "Next Gen Stuff"
            }
          ],
          books: [
            {
              id: 201,
              title: "A Book For Alpha",
              author: "Secret Agent"
            },
            {
              id: 202,
              title: "Beta: A Memoir",
              author: "Dev Group Gamma"
            }
          ],
          views: [
            {
              id: 1001,
              userId: 401,
              bookId: 201,
              date: moment.utc("20110101").valueOf()
            },
            {
              id: 1002,
              userId: 402,
              bookId: 202,
              date: moment.utc("20170913").valueOf()
            }
          ]
        });
        assertWrapper(x);
        setAppData(x);

        // Select alpha.
        userEvent.click(
          within(renderResult.getByTestId("suggestions-list")).getByText(
            /Alpha/
          )
        );
        await waitForDomChange();

        assert(
          within(renderResult.getByTestId("history-list")).queryByText(
            /A Book For Alpha/
          )
        );

        // Select beta.
        userEvent.click(
          within(renderResult.getByTestId("suggestions-list")).getByText(/Beta/)
        );
        await waitForDomChange();

        assert(
          within(renderResult.getByTestId("history-list")).queryByText(
            /Beta: A Memoir/
          )
        );
      });

      it("1 User 1 Book 0 View", async function() {
        const x = createAppData({
          users: [
            {
              id: 8900,
              lastName: "The Great",
              firstName: "Alexander",
              note: "I don't know his last name."
            }
          ],
          books: [{ id: 39, title: "A Forbidden Script", author: "Elder God" }],
          views: []
        });
        assertWrapper(x);
        setAppData(x);

        // Select Alexander the Great.
        userEvent.click(
          within(renderResult.getByTestId("suggestions-list")).getByText(
            /Alexander/
          )
        );
        await waitForDomChange();

        assert(
          !within(renderResult.getByTestId("history-list")).queryByText(
            /Forbidden Script/
          )
        );
      });
    });

    describe("Adding Views", async function() {
      it("1 User 1 Book 0 View", async function() {
        const x = createAppData({
          books: [{ id: 672, title: "Diary", author: "You Know Who" }],
          users: [
            {
              id: 266,
              lastName: "Last",
              firstName: "First",
              note: "Nothing in particular"
            }
          ],
          views: []
        });
        assertWrapper(x);
        setAppData(x);

        // Select user.
        userEvent.click(
          within(renderResult.getByTestId("suggestions-list")).getByText(/Last/)
        );
        await waitForDomChange();

        // Type search query.
        const historySearchInput = renderResult
          .getByTestId("history-edit-form")
          .querySelector("input");
        assertWrapper(historySearchInput);
        historySearchInput.focus();
        assertWrapper(!!document.activeElement);
        await userEvent.type(document.activeElement, "Diary");

        // Select book suggestion.
        userEvent.click(
          within(
            renderResult.getByTestId("history-edit-form")
          ).getByText(/Diary/, { selector: "[role=option] *" })
        );

        // Click history add button.
        userEvent.click(
          within(renderResult.getByTestId("history-edit-form")).getByText(
            /Add/i
          )
        );

        assert.strictEqual(getAppData().views.size, 1);
        assert(
          within(renderResult.getByTestId("history-list")).queryByText(/Diary/)
        );
      });

      it("History Add Button Should Be Disabled Before Selecting A Book", async function() {
        const x = createAppData({
          users: [{ id: 848, lastName: "Host", firstName: "Jack" }],
          books: [],
          views: []
        });
        assertWrapper(x);
        setAppData(x);

        // Select user.
        userEvent.click(
          within(renderResult.getByTestId("suggestions-list")).getByText(/Jack/)
        );
        await waitForDomChange();

        assert(
          within(renderResult.getByTestId("history-edit-form"))
            .getByText(/Add/i)
            .hasAttribute("disabled")
        );
      });

      it("Selecting A Book Should Display What Is Selected", async function() {
        const x = createAppData({
          books: [{ id: 1010, title: "Github Guide", author: "Seasoned Dev" }],
          users: [
            {
              id: 752,
              lastName: "Newbie",
              firstName: "Charlie",
              note: "Wannabe Hacker"
            }
          ],
          views: []
        });
        assertWrapper(x);
        setAppData(x);

        userEvent.click(
          within(renderResult.getByTestId("suggestions-list")).getByText(
            /Charlie/
          )
        );
        await waitForDomChange();

        const historySearchInput = renderResult
          .getByTestId("history-edit-form")
          .querySelector("input");
        assertWrapper(historySearchInput);
        await userEvent.type(historySearchInput, "github");

        userEvent.click(
          within(
            renderResult.getByTestId("history-edit-form")
          ).getByText(/Github/, { selector: "[role=option] *" })
        );

        await wait(() => {
          assert(
            renderResult
              .getByTestId("history-edit-form")
              .textContent?.includes("Github Guide")
          );
        });
      });
    });

    describe("Fuzzy Search", function() {
      it("Query A With [ABC, XYZ]", async function() {
        const x = createAppData({
          books: [
            { id: 5252, title: "ABC", author: "No One" },
            { id: 2525, title: "XYZ", author: "No One" }
          ],
          users: [
            {
              id: 907,
              lastName: "Drake",
              firstName: "Timothy",
              note: "Just finished reading ABC"
            }
          ],
          views: []
        });
        assertWrapper(x);
        setAppData(x);

        userEvent.click(
          within(renderResult.getByTestId("suggestions-list")).getByText(
            /Timothy/
          )
        );
        await waitForDomChange();

        const historySearchInput = renderResult
          .getByTestId("history-edit-form")
          .querySelector("input");
        assertWrapper(historySearchInput);
        historySearchInput.focus();
        await userEvent.type(historySearchInput, "A");

        assert(
          within(renderResult.getByTestId("history-edit-form")).getByText(
            /ABC/,
            { selector: "[role=option] *" }
          )
        );

        assert.strictEqual(
          within(renderResult.getByTestId("history-edit-form")).queryAllByText(
            /XYZ/
          ).length,
          0,
          "XYZ should not be included in suggestion."
        );
      });

      it("Query Title And Author", async function() {
        const x = createAppData({
          books: [{ id: 1375, title: "ABC", author: "DEF" }],
          users: [{ id: 4911, lastName: "Bloodwing", firstName: "Dennis" }],
          views: []
        });
        assertWrapper(x);
        setAppData(x);

        userEvent.click(
          within(renderResult.getByTestId("suggestions-list")).getByText(
            /Bloodwing/
          )
        );
        await waitForDomChange();

        const historySearchInput = renderResult
          .getByTestId("history-edit-form")
          .querySelector("input");
        assertWrapper(historySearchInput);
        historySearchInput.focus();
        await userEvent.type(historySearchInput, "AF");

        assert.strictEqual(
          within(
            renderResult.getByTestId("history-edit-form")
          ).queryAllByText(/ABC/, { selector: "[role=option] *" }).length,
          1
        );
      });
    });
  });
});
