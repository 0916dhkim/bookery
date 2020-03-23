import * as React from "react";
import { describe, it, afterEach } from "mocha";
import * as sinon from "sinon";
import { render, cleanup } from "@testing-library/react";
import { Root } from "./root";
import { EventType, EventHandler } from "../common/event";
import { assertWrapper } from "../common/assert_wrapper";
import * as assert from "assert";
import * as fs from "fs";
import {
  serializeAppData,
  createAppData
} from "../common/persistence/app_data";

const sandbox = sinon.createSandbox();

describe("Root", function() {
  afterEach(function() {
    sandbox.restore();
    cleanup();
  });

  describe("Unsaved File", function() {
    it("Open File Over New File", async function() {
      const fakeRequest = sandbox.stub();
      const fakeOverrideRequest = fakeRequest.withArgs(
        sinon.match.has("type", "SHOW-OVERRIDE-WARNING")
      );
      fakeOverrideRequest.resolves("Don't Save");
      const fakeOpenRequest = fakeRequest.withArgs(
        sinon.match.has("type", "SHOW-OPEN-DIALOG")
      );
      fakeOpenRequest.resolves("");
      sandbox
        .stub(fs, "readFileSync")
        .returns(serializeAppData(createAppData()));
      let eventHandlers: { [T in EventType]?: EventHandler<T> } = {};
      function useEventHandlerStub<T extends EventType>(
        eventType: T,
        handler: EventHandler<T>
      ): void {
        const entry = { [eventType]: handler };
        eventHandlers = { ...eventHandlers, ...entry };
      }
      render(
        <Root request={fakeRequest} useEventHandler={useEventHandlerStub} />
      );

      // Create new file.
      assertWrapper(eventHandlers["ON-NEW-FILE-MENU"]);
      await eventHandlers["ON-NEW-FILE-MENU"]({ type: "ON-NEW-FILE-MENU" });
      // Emit open file event.
      assertWrapper(eventHandlers["ON-OPEN-FILE-MENU"]);
      await eventHandlers["ON-OPEN-FILE-MENU"]({ type: "ON-OPEN-FILE-MENU" });

      // Expect file open dialog.
      assert.strictEqual(fakeOpenRequest.callCount, 1);
      // Expect override warning.
      assert.strictEqual(fakeOverrideRequest.callCount, 1);
    });
  });
});
