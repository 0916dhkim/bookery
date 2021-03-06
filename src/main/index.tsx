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
import { format as formatUrl } from "url";
import { EventEmitter } from "../common/event";
import * as path from "path";

const isDevelopment = process.env.NODE_ENV !== "production";

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow | null = null;
let closeRequestReceived = false;
let splashWindow: BrowserWindow | null = null;

function createSplashWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 450,
    height: 350,
    frame: false
  });

  if (isDevelopment) {
    window.loadURL(
      `http://localhost:${process.env.WEBPACK_WDS_PORT}/static/splash.html`
    );
  } else {
    window.loadURL(
      formatUrl({
        pathname: path.join(app.getAppPath(), "static/splash.html"),
        protocol: "file",
        slashes: true
      })
    );
  }

  window.on("closed", () => {
    splashWindow = null;
  });

  return window;
}

async function invokeInitializationRequestHandler(
  emit: EventEmitter
): Promise<Response<"INVOKE-INITIALIZATION">> {
  emit({
    type: "ON-INITIALIZE",
    processArgs: process.argv
  });
}

async function getVersionRequestHandler(): Promise<Response<"GET-VERSION">> {
  return app.getVersion();
}

async function closeRequestHandler(): Promise<Response<"CLOSE-WINDOW">> {
  closeRequestReceived = true;
  mainWindow?.close();
}

async function showOpenDialogRequestHandler(): Promise<
  Response<"SHOW-OPEN-DIALOG">
> {
  try {
    const ret = await dialog.showOpenDialog({
      filters: [{ name: "Bookery Data", extensions: ["bookery"] }],
      properties: ["openFile"]
    });
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
      filters: [{ name: "Bookery Data", extensions: ["bookery"] }],
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
    show: false,
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true
    }
  });

  const emit = createEventEmitter(window);

  if (isDevelopment) {
    window.webContents.openDevTools();
  }

  if (isDevelopment) {
    window.loadURL(
      `http://localhost:${process.env.WEBPACK_WDS_PORT}/dist/renderer/index.html`
    );
  } else {
    window.loadURL(
      formatUrl({
        pathname: path.join(app.getAppPath(), "dist/renderer/index.html"),
        protocol: "file",
        slashes: true
      })
    );
  }

  // Create application menu bar.
  initializeApplicationMenu(emit);

  // Only show main window when ready to show.
  window.on("ready-to-show", () => {
    splashWindow?.close();
    window.show();
  });

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

  registerRequestHandler(
    "INVOKE-INITIALIZATION",
    invokeInitializationRequestHandler.bind(null, emit)
  );
  registerRequestHandler("GET-VERSION", getVersionRequestHandler);
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
  splashWindow = createSplashWindow();
  autoUpdater.checkForUpdatesAndNotify();
  mainWindow = createMainWindow();
});
