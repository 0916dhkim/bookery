import { describe, it } from "mocha";
import { fireEvent, render, within } from "@testing-library/react";
import * as React from "react";
import { UsersView } from "../../src/ui/users_view";
import { AppData } from "../../src/persistence/app_data";
import * as assert from "assert";

function mockAppDataState(): [() => AppData, (x: AppData) => void] {
  let appData = new AppData();
  return [
    (): AppData => appData,
    (x: AppData): void => {
      appData = x;
    }
  ];
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

describe("UsersView", function() {
  describe("Suggestions List", function() {
    it("Exists", function() {
      const [getAppData, setAppData] = mockAppDataState();
      setAppData(singleUserAppData);
      const { getByTestId } = render(
        <UsersView appData={getAppData()} setAppData={setAppData} />
      );
      const suggestionsList = getByTestId("suggestions-list");
      within(suggestionsList).getByRole("option");
    });
  });
  describe("Delete Button", function() {
    it("Exists", function() {
      const [getAppData, setAppData] = mockAppDataState();
      setAppData(doubleUserAppData);
      const { getByTestId } = render(
        <UsersView appData={getAppData()} setAppData={setAppData} />
      );
      const firstSuggestion = within(getByTestId("suggestions-list")).getByRole(
        "option"
      );
      fireEvent.click(firstSuggestion);
      getByTestId("delete-button");
    });

    it("Delete Single User", function() {
      const [getAppData, setAppData] = mockAppDataState();
      setAppData(singleUserAppData);
      const { getByTestId } = render(
        <UsersView appData={getAppData()} setAppData={setAppData} />
      );

      assert.strictEqual(getAppData().users.size, 1);

      const firstSuggestion = within(getByTestId("suggestions-list")).getByRole(
        "option"
      );
      fireEvent.click(firstSuggestion);

      // Click the delete button.
      const button = getByTestId("delete-button");
      fireEvent.click(button);

      assert.strictEqual(getAppData().users.size, 0);
    });
  });
});
