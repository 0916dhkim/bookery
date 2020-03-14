import { app, BrowserWindow, dialog } from "electron";
import { autoUpdater } from "electron-updater";
import { initializeApplicationMenu } from "./application_menu";
import { createEventEmitter, registerRequestHandler } from "./communication";
import {
  Response,
  WarningMessageOption,
  RequestOptions,
  OverrideWarningOption
} from "../common/request";
import * as path from "path";
import { format as formatUrl } from "url";

const isDevelopment = process.env.NODE_ENV !== "production";

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow | null = null;
let closeRequestReceived = false;

async function closeRequestHandler(): Promise<Response<"CLOSE-WINDOW">> {
  closeRequestReceived = true;
  mainWindow?.close();
}

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

function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  });

  const emit = createEventEmitter(window);

  if (isDevelopment) {
    window.webContents.openDevTools();
  }

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  } else {
    window.loadURL(
      formatUrl({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file",
        slashes: true
      })
    );
  }

  // Create application menu bar.
  initializeApplicationMenu(emit);

  // Pass window close event to renderer.
  window.on("close", e => {
    if (closeRequestReceived) {
      closeRequestReceived = false;
    } else {
      e.preventDefault();
      emit({ type: "ON-CLOSE" });
    }
  });

  window.on("closed", () => {
    mainWindow = null;
  });

  window.webContents.on("devtools-opened", () => {
    window.focus();
    setImmediate(() => {
      window.focus();
    });
  });

  registerRequestHandler("CLOSE-WINDOW", closeRequestHandler);
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

  return window;
}

// quit application when all windows are closed
app.on("window-all-closed", () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});

// Auto-update then create main window.
app.on("ready", () => {
  autoUpdater.checkForUpdatesAndNotify();
  mainWindow = createMainWindow();
});
