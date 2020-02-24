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

const emptyAppData = new AppData();
const userJenny = emptyAppData.generateUser("Doe", "Jenny", "Dummy");
const singleUserAppData = emptyAppData.setUser(userJenny);
const userJohn = singleUserAppData.generateUser(
  "Doe",
  "John",
  "The greatest name in the world!"
);
const doubleUserAppData = singleUserAppData.setUser(userJohn);

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
      setAppData(singleUserAppData);
      const suggestionsList = renderResult.getByTestId("suggestions-list");
      within(suggestionsList).getAllByRole("option")[0];
    });
  });

  describe("Delete Button", function() {
    it("Exists", function() {
      setAppData(doubleUserAppData);
      const firstSuggestion = within(
        renderResult.getByTestId("suggestions-list")
      ).getAllByRole("option")[0];
      userEvent.click(firstSuggestion);
      renderResult.getByTestId("delete-button");
    });

    it("Warns When Deleting A User", function() {
      setAppData(doubleUserAppData);

      let count = 0;
      setShowDeleteUserDialogSync(() => {
        count++;
        return DeleteUserDialogOption.CANCEL;
      });

      const firstSuggestion = within(
        renderResult.getByTestId("suggestions-list")
      ).getAllByRole("option")[0];
      userEvent.click(firstSuggestion);
      const deleteButton = renderResult.getByTestId("delete-button");
      userEvent.click(deleteButton);

      assert.strictEqual(count, 1);
    });

    it("Abort Deleting When Requested", function() {
      setAppData(doubleUserAppData);

      // Represent pressing cancel option.
      setShowDeleteUserDialogSync(() => DeleteUserDialogOption.CANCEL);

      const firstSuggestion = within(
        renderResult.getByTestId("suggestions-list")
      ).getAllByRole("option")[0];
      userEvent.click(firstSuggestion);

      assert.strictEqual(getAppData().users.size, 2);

      const deleteButton = renderResult.getByTestId("delete-button");
      userEvent.click(deleteButton);

      // Number of users should be unchanged.
      assert.strictEqual(getAppData().users.size, 2);
    });

    it("Delete Single User", function() {
      setAppData(singleUserAppData);

      assert.strictEqual(getAppData().users.size, 1);

      const firstSuggestion = within(
        renderResult.getByTestId("suggestions-list")
      ).getAllByRole("option")[0];
      userEvent.click(firstSuggestion);

      // Click the delete button.
      const button = renderResult.getByTestId("delete-button");
      userEvent.click(button);

      assert.strictEqual(getAppData().users.size, 0);
    });

    it("Deleting A User Hides The Edit Form", function() {
      setAppData(doubleUserAppData);

      const option = within(
        renderResult.getByTestId("suggestions-list")
      ).getAllByRole("option")[0];
      userEvent.click(option);

      const deleteButton = renderResult.getByTestId("delete-button");
      userEvent.click(deleteButton);

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
          within(renderResult.getByTestId("suggestions-list")).getByRole(
            "option"
          )
        );

        assert.strictEqual(
          renderResult.queryAllByTestId("history-combobox").length,
          1
        );

        assert.strictEqual(
          renderResult.queryAllByTestId("history-add-button").length,
          1
        );

        assert.strictEqual(
          renderResult.queryAllByTestId("history-list").length,
          1
        );
      });

      it("No History View For New User", function() {
        let x = new AppData();
        x = x.setBook(x.generateBook("Pink", "Jace Tuna"));
        setAppData(x);

        userEvent.click(renderResult.getByTestId("new-user-button"));

        assert.strictEqual(
          renderResult.queryAllByTestId("history-combobox").length,
          0
        );

        assert.strictEqual(
          renderResult.queryAllByTestId("history-add-button").length,
          0
        );

        assert.strictEqual(
          renderResult.queryAllByTestId("history-list").length,
          0
        );
      });

      it("1 User 3 Books 2 Views", function() {
        let appData = new AppData();
        appData = appData.setUser(appData.generateUser("A", "K"));
        appData = appData.setBook(appData.generateBook("LSDKFK", "LSKQWE"));
        appData = appData.setBook(appData.generateBook("RIELWWL", "OQWI#KDS"));
        appData = appData.setBook(appData.generateBook("RWOIVV", "PIOPWERU"));
        const user = Array.from(appData.users.values())[0];
        const twoBooks = Array.from(appData.books.values()).slice(0, 2);
        twoBooks.forEach(book => {
          appData = appData.setView(
            appData.generateView(user.id, book.id, 1318781875826)
          );
        });
        setAppData(appData);

        // Select user.
        const userOption = within(
          renderResult.getByTestId("suggestions-list")
        ).getByRole("option");
        userEvent.click(userOption);

        const historyCount = within(
          renderResult.getByTestId("history-list")
        ).queryAllByRole("listitem").length;
        assert.strictEqual(historyCount, 2);
      });

      it("2 Users 2 Books 1 View Each (2 Total)", function() {
        let appData = new AppData();
        appData = appData.setUser(
          appData.generateUser("SDL", "SLKD", "QWLELL")
        );
        appData = appData.setUser(appData.generateUser("WQks", "QLklwe"));
        appData = appData.setBook(appData.generateBook("QWOIewr", "CLK"));
        appData = appData.setBook(appData.generateBook("VLKD", "EWL"));
        const users = Array.from(appData.users.values());
        const books = Array.from(appData.books.values());
        users.forEach((user, i) => {
          appData = appData.setView(
            appData.generateView(user.id, books[i].id, 1318781875426)
          );
        });
        setAppData(appData);

        // Select user.
        const firstUserOption = within(
          renderResult.getByTestId("suggestions-list")
        ).getAllByRole("option")[0];
        userEvent.click(firstUserOption);

        const historyCount = within(
          renderResult.getByTestId("history-list")
        ).queryAllByRole("listitem").length;
        assert.strictEqual(historyCount, 1);
      });

      it("1 User 0 Book 0 View", function() {
        let appData = new AppData();
        appData = appData.setUser(
          appData.generateUser(
            "The Great",
            "Alexander",
            "I don't know his last name."
          )
        );
        setAppData(appData);

        // Select Alexander the Great.
        const alexanderOption = within(
          renderResult.getByTestId("suggestions-list")
        ).getByRole("option");
        userEvent.click(alexanderOption);

        const historyCount = within(
          renderResult.getByTestId("history-list")
        ).queryAllByRole("listitem").length;

        assert.strictEqual(historyCount, 0);
      });
    });

    describe("Adding Views", function() {
      it("1 User 1 Book 0 View", async function() {
        let x = new AppData();
        x = x.setBook(x.generateBook("Diary", "You Know Who"));
        x = x.setUser(x.generateUser("Last", "First", "Nothing in particular"));
        setAppData(x);

        // Select user.
        const userOption = within(
          renderResult.getByTestId("suggestions-list")
        ).getByRole("option");
        userEvent.click(userOption);

        renderResult.getByTestId("history-search-input").focus();
        assertWrapper(!!document.activeElement);
        await userEvent.type(document.activeElement, "Diary");

        const firstSuggestion = within(
          renderResult.getByTestId("history-combobox")
        ).getByRole("option");
        userEvent.click(firstSuggestion);

        userEvent.click(renderResult.getByTestId("history-add-button"));

        assert.strictEqual(getAppData().views.size, 1);
        const historyCount = within(
          renderResult.getByTestId("history-list")
        ).queryAllByRole("listitem").length;
        assert.strictEqual(historyCount, 1);
      });

      it("History Add Button Should Be Disabled Before Selecting A Book", async function() {
        let x = new AppData();
        x = x.setUser(x.generateUser("Host", "Jack"));
        setAppData(x);

        // Select user.
        const userOption = within(
          renderResult.getByTestId("suggestions-list")
        ).getByRole("option");
        userEvent.click(userOption);

        assert(
          renderResult
            .getByTestId("history-add-button")
            .closest("button")
            ?.hasAttribute("disabled")
        );
      });
    });
  });
});
