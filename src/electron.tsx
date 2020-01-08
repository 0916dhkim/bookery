import { app, BrowserWindow } from "electron";

function onAppReady(): void {
  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile("static/index.html");
}

app.on("ready", onAppReady);
