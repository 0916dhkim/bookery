import * as React from "react";
import { remote } from "electron";
import * as fs from "fs";
import { Main } from "./main";
import { AppData, AppDataSerializer } from "../persistence/app_data";

function newFile(main: React.RefObject<Main>): void {
  main?.current?.setState({
    appData: new AppData()
  });
}

function openFile(main: React.RefObject<Main>): void {
  const result = remote.dialog.showOpenDialogSync({
    properties: ["openFile"]
  });

  if (result !== undefined && result.length === 1) {
    const filePath = result[0];
    const fileContent = fs.readFileSync(filePath, {
      encoding: "utf8"
    });
    const appDataSerializer = new AppDataSerializer();
    main?.current?.setState({
      currentFilePath: filePath,
      appData: appDataSerializer.deserialize(fileContent)
    });
  }
}

function saveAsFile(main: React.RefObject<Main>): void {
  const result = remote.dialog.showSaveDialogSync({
    properties: ["createDirectory", "showOverwriteConfirmation"]
  });
  if (result !== undefined && main?.current?.state.appData) {
    const appDataSerializer = new AppDataSerializer();
    const serializedAppData = appDataSerializer.serialize(
      main.current.state.appData
    );
    fs.writeFileSync(result, serializedAppData, {
      encoding: "utf8"
    });
    main.current.setState({
      currentFilePath: result
    });
  }
}

function saveFile(main: React.RefObject<Main>): void {
  if (main?.current?.state.appData) {
    const appDataSerializer = new AppDataSerializer();
    const stringifiedAppData = appDataSerializer.serialize(
      main.current.state.appData
    );

    const targetPath = main.current.state.currentFilePath;
    if (targetPath) {
      fs.writeFileSync(targetPath, stringifiedAppData, {
        encoding: "utf8"
      });
    } else {
      saveAsFile(main);
    }
  }
}

export function initializeApplicationMenu(main: React.RefObject<Main>): void {
  remote.Menu.setApplicationMenu(
    remote.Menu.buildFromTemplate([
      {
        label: "File",
        submenu: [
          {
            label: "New File",
            click: newFile.bind(null, main)
          },
          {
            label: "Open File...",
            click: openFile.bind(null, main)
          },
          {
            label: "Save",
            click: saveFile.bind(null, main)
          },
          {
            label: "Save As...",
            click: saveAsFile.bind(null, main)
          }
        ]
      },
      { role: "editMenu" },
      { role: "viewMenu" }
    ])
  );
}
