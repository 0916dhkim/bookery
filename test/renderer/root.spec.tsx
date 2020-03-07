import * as React from "react";
import { describe, it, afterEach } from "mocha";
import * as sinon from "sinon";
import { render, cleanup } from "@testing-library/react";
import { Root } from "../../src/renderer/root";
import { EventType, EventHandler } from "../../src/event";
import { assertWrapper } from "../../src/assert_wrapper";
import * as assert from "assert";
import * as fs from "fs";
import { AppDataSerializer, AppData } from "../../src/persistence/app_data";

const sandbox = sinon.createSandbox();

describe("Root", function() {
  afterEach(function() {
    sandbox.restore();
    cleanup();
  });

  describe("Unsaved File", function() {
    it("Open File Over New File", async function() {
      const fakeRequest = sandbox.stub();
      fakeRequest
        .withArgs(sinon.match.has("type", "SHOW-OVERRIDE-WARNING"))
        .returns("Save");
      fakeRequest
        .withArgs(sinon.match.has("type", "SHOW-OPEN-DIALOG"))
        .returns("");
      const appDataSerializer = new AppDataSerializer();
      sandbox
        .stub(fs, "readFileSync")
        .returns(appDataSerializer.serialize(new AppData()));
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
      eventHandlers["ON-NEW-FILE-MENU"]({ type: "ON-NEW-FILE-MENU" });
      // Emit open file event.
      assertWrapper(eventHandlers["ON-OPEN-FILE-MENU"]);
      eventHandlers["ON-OPEN-FILE-MENU"]({ type: "ON-OPEN-FILE-MENU" });
      // Expect file open dialog.
      assert(
        fakeRequest.withArgs(sinon.match.has("type", "SHOW-OPEN-DIALOG"))
          .calledOnce
      );
      // Expect override warning.
      assert(
        fakeRequest.withArgs(sinon.match.has("type", "SHOW-OVERRIDE-WARNING"))
          .calledOnce
      );
    });
  });
});
