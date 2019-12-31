import { app, BrowserWindow } from "electron";

function onAppReady(): void {
  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile("src/ui/index.html");
}

app.on("ready", onAppReady);
