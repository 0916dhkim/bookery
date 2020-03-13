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
import { UsersView } from "../../src/renderer/users_view";
import { AppData } from "../../src/common/persistence/app_data";
import * as assert from "assert";
import { AppDataContext } from "../../src/renderer/app_data_context";
import { act } from "react-dom/test-utils";
import { assertWrapper } from "../../src/common/assert_wrapper";
import * as moment from "moment";
import { RequestContext } from "../../src/renderer/request_context";
import * as sinon from "sinon";

const fakeRequest = sinon.stub();

interface TesterState {
  appData: AppData;
}

class Tester extends React.Component<{}, TesterState> {
  constructor(props: { children: React.ReactElement }) {
    super(props);
    this.state = {
      appData: new AppData()
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
      let x = new AppData();
      x = x.setUser(x.generateUser("Kid", "Derek", "Invincible."));
      setAppData(x);
      assert(
        within(renderResult.getByTestId("suggestions-list")).getByText(/Kid/)
      );
    });
  });

  describe("Delete Button", function() {
    it("Exists", async function() {
      let x = new AppData();
      x = x.setUser(
        x.generateUser("Dwarf", "Gnome", "Not a real good name, I know.")
      );
      x = x.setUser(x.generateUser("King", "Arthur", "A great name, I know."));
      setAppData(x);
      userEvent.click(
        within(renderResult.getByTestId("suggestions-list")).getByText(/King/)
      );
      await waitForDomChange();

      assert(renderResult.getByText(/Delete User/i));
    });

    it("Warns When Deleting A User", async function() {
      let x = new AppData();
      x = x.setUser(x.generateUser("De Blasio", "Paul"));
      x = x.setUser(x.generateUser("Panza", "Sancho"));
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
      let x = new AppData();
      x = x.setUser(x.generateUser("Raider", "Trev"));
      x = x.setUser(x.generateUser("Parker", "Fred"));
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
      let x = new AppData();
      x = x.setUser(
        x.generateUser("Solo", "Han", "Totally not from Start Wars")
      );
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
      let x = new AppData();
      x = x.setUser(x.generateUser("Fury", "Neal"));
      x = x.setUser(x.generateUser("Jackson", "Dan"));
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
      let x = new AppData();
      const bookA = x.generateBook("ABC", "noname");
      x = x.setBook(bookA);
      const bookB = x.generateBook("DEF", "noname");
      x = x.setBook(bookB);
      const userDan = x.generateUser("Smith", "Dan");
      x = x.setUser(userDan);
      const userFrank = x.generateUser("Kennedy", "Frank");
      x = x.setUser(userFrank);
      x = x.setView(
        x.generateView(userDan.id, bookA.id, moment.utc("20100517").valueOf())
      );
      x = x.setView(
        x.generateView(userFrank.id, bookA.id, moment.utc("20111203").valueOf())
      );
      x = x.setView(
        x.generateView(userFrank.id, bookB.id, moment.utc("20120109").valueOf())
      );
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
        let x = new AppData();
        x = x.setBook(x.generateBook("SDFLKA", "Tom Black"));
        x = x.setUser(x.generateUser("Blue", "Gerald"));
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
        let x = new AppData();
        x = x.setBook(x.generateBook("Pink", "Jace Tuna"));
        setAppData(x);

        userEvent.click(renderResult.getByText(/New User/i));
        await waitForDomChange();

        assert(!renderResult.queryByTestId("history-edit-form"));
        assert(!renderResult.queryByTestId("history-list"));
      });

      it("1 User 3 Books 2 Views", async function() {
        let x = new AppData();
        const onlyUser = x.generateUser("A", "K");
        x = x.setUser(onlyUser);
        const firstBook = x.generateBook("LSDKFK", "LSKQWE");
        x = x.setBook(firstBook);
        const secondBook = x.generateBook("RIELWWL", "OQWI#KDS");
        x = x.setBook(secondBook);
        const thirdBook = x.generateBook("RWOIVV", "PIOPWERU");
        x = x.setBook(thirdBook);
        x = x.setView(x.generateView(onlyUser.id, firstBook.id, 1318781875826));
        x = x.setView(
          x.generateView(onlyUser.id, secondBook.id, 1318781875826)
        );
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
        let x = new AppData();
        const userAlpha = x.generateUser(
          "Tempest",
          "Alpha",
          "The One And Only Alpha!"
        );
        x = x.setUser(userAlpha);
        const userBeta = x.generateUser("Tempest", "Beta", "Next Gen Stuff");
        x = x.setUser(userBeta);
        const bookForAlpha = x.generateBook("A Book For Alpha", "Secret Agent");
        x = x.setBook(bookForAlpha);
        const bookForBeta = x.generateBook("Beta: A Memoir", "Dev Group Gamma");
        x = x.setBook(bookForBeta);
        x = x.setView(
          x.generateView(
            userAlpha.id,
            bookForAlpha.id,
            moment.utc("20110101").valueOf()
          )
        );
        x = x.setView(
          x.generateView(
            userBeta.id,
            bookForBeta.id,
            moment.utc("20170913").valueOf()
          )
        );
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
        let x = new AppData();
        x = x.setUser(
          x.generateUser(
            "The Great",
            "Alexander",
            "I don't know his last name."
          )
        );
        x = x.setBook(x.generateBook("A Forbidden Script", "Elder God"));
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
        let x = new AppData();
        x = x.setBook(x.generateBook("Diary", "You Know Who"));
        x = x.setUser(x.generateUser("Last", "First", "Nothing in particular"));
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
        let x = new AppData();
        x = x.setUser(x.generateUser("Host", "Jack"));
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
        let x = new AppData();
        x = x.setBook(x.generateBook("Github Guide", "Seasoned Dev"));
        x = x.setUser(x.generateUser("Newbie", "Charlie", "Wannabe Hacker"));
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
        let x = new AppData();
        x = x.setBook(x.generateBook("ABC", "No One"));
        x = x.setBook(x.generateBook("XYZ", "No One"));
        x = x.setUser(
          x.generateUser("Drake", "Timothy", "Just finished reading ABC")
        );
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
        let x = new AppData();
        x = x.setBook(x.generateBook("ABC", "DEF"));
        x = x.setUser(x.generateUser("Bloodwing", "Dennis"));
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
