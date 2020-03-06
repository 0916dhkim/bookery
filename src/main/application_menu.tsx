import * as React from "react";
import { Menu } from "electron";
import * as fs from "fs";
import { Root } from "../renderer/root";
import { AppData, AppDataSerializer } from "../persistence/app_data";

function newFile(root: React.RefObject<Root>): void {
  root?.current?.setState({
    appData: new AppData()
  });
}

function openFile(root: React.RefObject<Root>): void {
  const result = remote.dialog.showOpenDialogSync({
    properties: ["openFile"]
  });

  if (result !== undefined && result.length === 1) {
    const filePath = result[0];
    const fileContent = fs.readFileSync(filePath, {
      encoding: "utf8"
    });
    const appDataSerializer = new AppDataSerializer();
    root?.current?.setState({
      currentFilePath: filePath,
      appData: appDataSerializer.deserialize(fileContent)
    });
  }
}

function saveAsFile(root: React.RefObject<Root>): void {
  const result = remote.dialog.showSaveDialogSync({
    properties: ["createDirectory", "showOverwriteConfirmation"]
  });
  if (result !== undefined && root?.current?.state.appData) {
    const appDataSerializer = new AppDataSerializer();
    const serializedAppData = appDataSerializer.serialize(
      root.current.state.appData
    );
    fs.writeFileSync(result, serializedAppData, {
      encoding: "utf8"
    });
    root.current.setState({
      currentFilePath: result
    });
  }
}

function saveFile(root: React.RefObject<Root>): void {
  if (root?.current?.state.appData) {
    const appDataSerializer = new AppDataSerializer();
    const stringifiedAppData = appDataSerializer.serialize(
      root.current.state.appData
    );

    const targetPath = root.current.state.currentFilePath;
    if (targetPath) {
      fs.writeFileSync(targetPath, stringifiedAppData, {
        encoding: "utf8"
      });
    } else {
      saveAsFile(root);
    }
  }
}

export function initializeApplicationMenu(root: React.RefObject<Root>): void {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: "File",
        submenu: [
          {
            label: "New File",
            click: newFile.bind(null, root)
          },
          {
            label: "Open File...",
            click: openFile.bind(null, root)
          },
          {
            label: "Save",
            click: saveFile.bind(null, root)
          },
          {
            label: "Save As...",
            click: saveAsFile.bind(null, root)
          }
        ]
      },
      { role: "editMenu" },
      { role: "viewMenu" }
    ])
  );
}
