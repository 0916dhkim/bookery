import { describe, it, beforeEach, afterEach } from "mocha";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { UsersView } from "../../src/ui/users_view";
import { AppData } from "../../src/persistence/app_data";
import * as assert from "assert";

let container = document.createElement("div");

beforeEach(function() {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(function() {
  ReactDOM.unmountComponentAtNode(container);
  container.remove();
});

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
      ReactDOM.render(
        <UsersView appData={getAppData()} setAppData={setAppData} />,
        container
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
      ReactDOM.render(
        <UsersView appData={getAppData()} setAppData={setAppData} />,
        container
      );
      const firstSuggestion = container.querySelector(
        "[data-testid=suggestions-list] a"
      );
      act(() => {
        firstSuggestion.dispatchEvent(
          new MouseEvent("click", { bubbles: true })
        );
      });
      const deleteButton = container.querySelector(
        "[data-testid=delete-button]"
      );
      assert.notStrictEqual(deleteButton, null);
    });

    it("Delete Single User", function() {
      const [getAppData, setAppData] = mockAppDataState();
      const user = getAppData()
        .generateUser()
        .setFirstName("Jenny")
        .setLastName("Doe")
        .setNote("Dummy");
      setAppData(getAppData().setUser(user));
      ReactDOM.render(
        <UsersView appData={getAppData()} setAppData={setAppData} />,
        container
      );

      assert.strictEqual(getAppData().users.size, 1);
      const button = container.querySelector("[data-testid=delete-button]");
      act(() => {
        button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      assert.strictEqual(getAppData().users.size, 0);
    });
  });
});
