import { describe, it, afterEach, beforeEach } from "mocha";
import {
  fireEvent,
  render,
  within,
  cleanup,
  RenderResult
} from "@testing-library/react";
import * as React from "react";
import { UsersView, UsersViewProps } from "../../src/ui/users_view";
import { AppData } from "../../src/persistence/app_data";
import * as assert from "assert";
import { AppDataContext } from "../../src/ui/app_data_context";
import { act } from "react-dom/test-utils";
import { ModifiedDialogOption } from "../../src/ui/modified_dialog";
import { DeleteUserDialogOption } from "../../src/ui/delete_user_dialog";

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
const userJenny = emptyAppData
  .generateUser()
  .setFirstName("Jenny")
  .setLastName("Doe")
  .setNote("Dummy");
const singleUserAppData = emptyAppData.setUser(userJenny);
const userJohn = singleUserAppData
  .generateUser()
  .setFirstName("John")
  .setLastName("Doe")
  .setNote("The greatest name in the world!");
const doubleUserAppData = singleUserAppData.setUser(userJohn);

const testerRef = React.createRef<Tester>();
let renderResult: RenderResult;
function getAppData(): AppData {
  return testerRef.current.state.appData;
}

function setAppData(x: AppData): void {
  act(() => {
    testerRef.current.setState({ appData: x });
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
      fireEvent.click(firstSuggestion);
      renderResult.getByTestId("delete-button");
    });

    it("Warns When Deleting A User", function() {
      setAppData(doubleUserAppData);

      let count = 0;
      act(() => {
        testerRef.current.setState({
          showDeleteUserDialogSync: () => {
            count++;
            return DeleteUserDialogOption.CANCEL;
          }
        });
      });

      const firstSuggestion = within(
        renderResult.getByTestId("suggestions-list")
      ).getAllByRole("option")[0];
      fireEvent.click(firstSuggestion);
      const deleteButton = renderResult.getByTestId("delete-button");
      fireEvent.click(deleteButton);

      assert.strictEqual(count, 1);
    });

    it("Abort Deleting When Requested", function() {
      setAppData(doubleUserAppData);

      // Represent pressing cancel option.
      act(() => {
        testerRef.current.setState({
          showDeleteUserDialogSync: () => DeleteUserDialogOption.CANCEL
        });
      });

      const firstSuggestion = within(
        renderResult.getByTestId("suggestions-list")
      ).getAllByRole("option")[0];
      fireEvent.click(firstSuggestion);

      assert.strictEqual(getAppData().users.size, 2);

      const deleteButton = renderResult.getByTestId("delete-button");
      fireEvent.click(deleteButton);

      // Number of users should be unchanged.
      assert.strictEqual(getAppData().users.size, 2);
    });

    it("Delete Single User", function() {
      setAppData(singleUserAppData);

      assert.strictEqual(getAppData().users.size, 1);

      const firstSuggestion = within(
        renderResult.getByTestId("suggestions-list")
      ).getAllByRole("option")[0];
      fireEvent.click(firstSuggestion);

      // Click the delete button.
      const button = renderResult.getByTestId("delete-button");
      fireEvent.click(button);

      assert.strictEqual(getAppData().users.size, 0);
    });

    it("Deleting A User Hides The Edit Form", function() {
      setAppData(doubleUserAppData);

      const option = within(
        renderResult.getByTestId("suggestions-list")
      ).getAllByRole("option")[0];
      fireEvent.click(option);

      const deleteButton = renderResult.getByTestId("delete-button");
      fireEvent.click(deleteButton);

      assert.strictEqual(renderResult.queryByTestId("user-edit-form"), null);
    });
  });
});
