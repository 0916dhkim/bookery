import { describe, it, beforeEach, afterEach } from "mocha";
import * as React from "react";
import * as ReactDOM from "react-dom";
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

describe("UsersView", function() {
  describe("Delete Button", function() {
    it("Exists", function() {
      let appData = new AppData();
      const setAppData = (x: AppData): void => {
        appData = x;
      };
      ReactDOM.render(
        <UsersView appData={appData} setAppData={setAppData} />,
        container
      );
      assert.notStrictEqual(
        container.querySelector("button.delete-button"),
        null
      );
    });
  });
});
