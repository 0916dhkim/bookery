import { describe, it } from "mocha";
import { act, render } from "@testing-library/react";
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

describe("UsersView", function() {
  describe("Suggestions List", function() {
    it("Exists", function() {
      const [getAppData, setAppData] = mockAppDataState();
      const user = getAppData()
        .generateUser()
        .setFirstName("X")
        .setLastName("Y");
      setAppData(getAppData().setUser(user));
      const { container } = render(
        <UsersView appData={getAppData()} setAppData={setAppData} />
      );
      const firstSuggestion = container.querySelector(
        "[data-testid=suggestions-list] li"
      );
      assert.notStrictEqual(firstSuggestion, null);
    });
  });
  describe("Delete Button", function() {
    it("Exists", function() {
      const [getAppData, setAppData] = mockAppDataState();
      const user = getAppData()
        .generateUser()
        .setFirstName("X")
        .setLastName("Y");
      setAppData(getAppData().setUser(user));
      const { container, getByTestId } = render(
        <UsersView appData={getAppData()} setAppData={setAppData} />
      );
      const firstSuggestion = container.querySelector(
        "[data-testid=suggestions-list] a"
      );
      act(() => {
        firstSuggestion.dispatchEvent(
          new MouseEvent("click", { bubbles: true })
        );
      });
      getByTestId("delete-button");
    });

    it("Delete Single User", function() {
      const [getAppData, setAppData] = mockAppDataState();
      const user = getAppData()
        .generateUser()
        .setFirstName("Jenny")
        .setLastName("Doe")
        .setNote("Dummy");
      setAppData(getAppData().setUser(user));
      const { container, getByTestId } = render(
        <UsersView appData={getAppData()} setAppData={setAppData} />
      );

      assert.strictEqual(getAppData().users.size, 1);

      // Click the first element of the suggestions list.
      const firstSuggestion = container.querySelector(
        "[data-testid=suggestions-list] a"
      );
      act(() => {
        firstSuggestion.dispatchEvent(
          new MouseEvent("click", { bubbles: true })
        );
      });

      // Click the delete button.
      const button = getByTestId("delete-button");
      act(() => {
        button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      assert.strictEqual(getAppData().users.size, 0);
    });
  });
});
