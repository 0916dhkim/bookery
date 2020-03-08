import { app, BrowserWindow, dialog } from "electron";
import { initializeApplicationMenu } from "./application_menu";
import { createEventEmitter, registerRequestHandler } from "./communication";
import {
  Response,
  WarningMessageOption,
  RequestOptions,
  OverrideWarningOption
} from "../request";

async function showOpenDialogRequestHandler(): Promise<
  Response<"SHOW-OPEN-DIALOG">
> {
  try {
    const ret = await dialog.showOpenDialog({ properties: ["openFile"] });
    if (ret.canceled || ret.filePaths.length === 0) {
      throw "Path not selected.";
    } else {
      return ret.filePaths[0];
    }
  } catch {
    return null;
  }
}

async function showSaveDialogRequestHandler(): Promise<
  Response<"SHOW-SAVE-DIALOG">
> {
  try {
    const ret = await dialog.showSaveDialog({
      properties: ["createDirectory", "showOverwriteConfirmation"]
    });
    if (ret.canceled || ret.filePath === undefined) {
      throw "Path not selected.";
    } else {
      return ret.filePath;
    }
  } catch {
    return null;
  }
}

async function showOverrideWarningRequestHandler(
  options: RequestOptions<"SHOW-OVERRIDE-WARNING">
): Promise<Response<"SHOW-OVERRIDE-WARNING">> {
  const buttons: Array<OverrideWarningOption> = [
    "Cancel",
    "Don't Save",
    "Save"
  ];
  try {
    const ret = await dialog.showMessageBox({
      type: "warning",
      buttons: buttons,
      defaultId: 0,
      message: options.message,
      cancelId: 0,
      noLink: true
    });
    return buttons[ret.response];
  } catch {
    throw "Failed to show override warning.";
  }
}

async function showWarningMessageRequestHandler(
  options: RequestOptions<"SHOW-WARNING-MESSAGE">
): Promise<Response<"SHOW-WARNING-MESSAGE">> {
  const buttons: Array<WarningMessageOption> = ["Cancel", "OK"];
  try {
    const ret = await dialog.showMessageBox({
      type: "warning",
      buttons: buttons,
      defaultId: 0,
      message: options.message,
      cancelId: 0,
      noLink: true
    });
    return buttons[ret.response];
  } catch {
    throw "Failed to show delete warning.";
  }
}

async function showErrorMessageRequestHandler(
  options: RequestOptions<"SHOW-ERROR-MESSAGE">
): Promise<Response<"SHOW-ERROR-MESSAGE">> {
  await dialog.showErrorBox(options.title, options.message);
  return null;
}

function onAppReady(): void {
  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  });

  const emit = createEventEmitter(win);

  // Create application menu bar.
  initializeApplicationMenu(emit);

  // Pass window close event to renderer.
  win.on("close", () => emit({ type: "ON-CLOSE" }));

  registerRequestHandler("SHOW-OPEN-DIALOG", showOpenDialogRequestHandler);
  registerRequestHandler("SHOW-SAVE-DIALOG", showSaveDialogRequestHandler);
  registerRequestHandler(
    "SHOW-OVERRIDE-WARNING",
    showOverrideWarningRequestHandler
  );
  registerRequestHandler(
    "SHOW-WARNING-MESSAGE",
    showWarningMessageRequestHandler
  );
  registerRequestHandler("SHOW-ERROR-MESSAGE", showErrorMessageRequestHandler);
  win.loadFile("index.html");
}

app.on("ready", onAppReady);
