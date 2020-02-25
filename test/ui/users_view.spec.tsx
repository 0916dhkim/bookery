import { describe, it, afterEach, beforeEach } from "mocha";
import { render, within, cleanup, RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { UsersView, UsersViewProps } from "../../src/ui/users_view";
import { AppData } from "../../src/persistence/app_data";
import * as assert from "assert";
import { AppDataContext } from "../../src/ui/app_data_context";
import { act } from "react-dom/test-utils";
import { ModifiedDialogOption } from "../../src/ui/modified_dialog";
import { DeleteUserDialogOption } from "../../src/ui/delete_user_dialog";
import { assertWrapper } from "../../src/assert_wrapper";
import moment = require("moment");

interface TesterState extends UsersViewProps {
  appData: AppData;
}
class Tester extends React.Component<{}, TesterState> {
  constructor(props: { children: React.ReactElement }) {
    super(props);
    this.state = {
      appData: new AppData(),
      showModifiedDialogSync: (): ModifiedDialogOption =>
        ModifiedDialogOption.SAVE,
      showDeleteUserDialogSync: (): DeleteUserDialogOption =>
        DeleteUserDialogOption.OK
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
        <UsersView
          showModifiedDialogSync={this.state.showModifiedDialogSync}
          showDeleteUserDialogSync={this.state.showDeleteUserDialogSync}
        />
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

function setShowDeleteUserDialogSync(f: () => DeleteUserDialogOption): void {
  act(() => {
    assertWrapper(testerRef.current);
    testerRef.current.setState({
      showDeleteUserDialogSync: f
    });
  });
}

beforeEach(function() {
  renderResult = render(
    <Tester ref={testerRef}>
      <UsersView />
    </Tester>
  );
});

afterEach(function() {
  cleanup();
});

describe("UsersView", function() {
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
    it("Exists", function() {
      let x = new AppData();
      x = x.setUser(
        x.generateUser("Dwarf", "Gnome", "Not a real good name, I know.")
      );
      x = x.setUser(x.generateUser("King", "Arthur", "A great name, I know."));
      setAppData(x);
      userEvent.click(
        within(renderResult.getByTestId("suggestions-list")).getByText(/King/)
      );
      assert(renderResult.getByText(/Delete User/i));
    });

    it("Warns When Deleting A User", function() {
      let x = new AppData();
      x = x.setUser(x.generateUser("De Blasio", "Paul"));
      x = x.setUser(x.generateUser("Panza", "Sancho"));
      setAppData(x);

      let count = 0;
      setShowDeleteUserDialogSync(() => {
        count++;
        return DeleteUserDialogOption.CANCEL;
      });

      userEvent.click(
        within(renderResult.getByTestId("suggestions-list")).getByText(/Sancho/)
      );
      userEvent.click(renderResult.getByText(/Delete User/i));

      assert.strictEqual(count, 1);
    });

    it("Abort Deleting When Requested", function() {
      let x = new AppData();
      x = x.setUser(x.generateUser("Raider", "Trev"));
      x = x.setUser(x.generateUser("Parker", "Fred"));
      setAppData(x);

      // Represent pressing cancel option.
      setShowDeleteUserDialogSync(() => DeleteUserDialogOption.CANCEL);

      userEvent.click(
        within(renderResult.getByTestId("suggestions-list")).getByText(/Raider/)
      );

      assert.strictEqual(getAppData().users.size, 2);

      userEvent.click(renderResult.getByText(/Delete User/i));

      // Number of users should be unchanged.
      assert.strictEqual(getAppData().users.size, 2);
    });

    it("Delete Single User", function() {
      let x = new AppData();
      x = x.setUser(
        x.generateUser("Solo", "Han", "Totally not from Start Wars")
      );
      setAppData(x);

      assert.strictEqual(getAppData().users.size, 1);

      const firstSuggestion = within(
        renderResult.getByTestId("suggestions-list")
      ).getAllByRole("option")[0];
      userEvent.click(firstSuggestion);
      userEvent.click(
        within(renderResult.getByTestId("suggestions-list")).getByText(/Solo/)
      );

      // Click the delete button.
      userEvent.click(renderResult.getByText(/Delete User/i));

      assert.strictEqual(getAppData().users.size, 0);
    });

    it("Deleting A User Hides The Edit Form", function() {
      let x = new AppData();
      x = x.setUser(x.generateUser("Fury", "Neal"));
      x = x.setUser(x.generateUser("Jackson", "Dan"));
      setAppData(x);

      userEvent.click(
        within(renderResult.getByTestId("suggestions-list")).getByText(
          /Jackson/
        )
      );

      userEvent.click(renderResult.getByText(/Delete User/i));

      assert.strictEqual(renderResult.queryByTestId("user-edit-form"), null);
    });
  });

  describe("User History Edit Form", function() {
    describe("User History List Length", function() {
      it("Exists", function() {
        let x = new AppData();
        x = x.setBook(x.generateBook("SDFLKA", "Tom Black"));
        x = x.setUser(x.generateUser("Blue", "Gerald"));
        setAppData(x);

        userEvent.click(
          within(renderResult.getByTestId("suggestions-list")).getByText(
            /Gerald/
          )
        );

        assert(renderResult.getByTestId("history-edit-form"));
      });

      it("No History View For New User", function() {
        let x = new AppData();
        x = x.setBook(x.generateBook("Pink", "Jace Tuna"));
        setAppData(x);

        userEvent.click(renderResult.getByText(/New User/i));

        assert(!renderResult.queryByTestId("history-edit-form"));
        assert(!renderResult.queryByTestId("history-list"));
      });

      it("1 User 3 Books 2 Views", function() {
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

        assert(
          within(renderResult.getByTestId("history-list")).queryByText(/LSDKFK/)
        );
        assert(
          within(renderResult.getByTestId("history-list")).queryByText(
            /RIELWWL/
          )
        );
      });

      it("2 Users 2 Books 1 View Each (2 Total)", function() {
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

        assert(
          within(renderResult.getByTestId("history-list")).queryByText(
            /A Book For Alpha/
          )
        );

        // Select beta.
        userEvent.click(
          within(renderResult.getByTestId("suggestions-list")).getByText(/Beta/)
        );

        assert(
          within(renderResult.getByTestId("history-list")).queryByText(
            /Beta: A Memoir/
          )
        );
      });

      it("1 User 1 Book 0 View", function() {
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

        assert(
          !within(renderResult.getByTestId("history-list")).queryByText(
            /Forbidden Script/
          )
        );
      });
    });

    describe("Adding Views", function() {
      it("1 User 1 Book 0 View", async function() {
        let x = new AppData();
        x = x.setBook(x.generateBook("Diary", "You Know Who"));
        x = x.setUser(x.generateUser("Last", "First", "Nothing in particular"));
        setAppData(x);

        // Select user.
        userEvent.click(
          within(renderResult.getByTestId("suggestions-list")).getByText(/Last/)
        );

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

        assert(
          renderResult
            .getByTestId("history-edit-form")
            .textContent?.includes("Github Guide")
        );
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
