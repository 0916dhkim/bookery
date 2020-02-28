import { app, BrowserWindow } from "electron";

function onAppReady(): void {
  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile("index.html");
}

app.on("ready", onAppReady);
