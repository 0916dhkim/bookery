import * as React from "react";
import { remote } from "electron";
import * as fs from "fs";
import { Main } from "./main";
import { AppDataSerializer } from "../persistence/app_data";

export function initializeApplicationMenu(main: React.RefObject<Main>): void {
  remote.Menu.setApplicationMenu(
    remote.Menu.buildFromTemplate([
      {
        label: "File",
        submenu: [
          {
            label: "Open File...",
            click(): void {
              const result = remote.dialog.showOpenDialogSync({
                properties: ["openFile"]
              });

              if (result !== undefined && result.length === 1) {
                const filePath = result[0];
                const fileContent = fs.readFileSync(filePath, {
                  encoding: "utf8"
                });
                const appDataSerializer = new AppDataSerializer();
                main.current.setState({
                  currentFilePath: filePath,
                  appData: appDataSerializer.deserialize(fileContent)
                });
              }
            }
          },
          {
            label: "Save",
            click(): void {
              const appDataSerializer = new AppDataSerializer();
              const stringifiedAppData = appDataSerializer.serialize(
                main.current.state.appData
              );
              fs.writeFileSync(
                main.current.state.currentFilePath,
                stringifiedAppData,
                { encoding: "utf8" }
              );
            }
          },
          {
            label: "Save As..."
          }
        ]
      },
      { role: "editMenu" },
      { role: "viewMenu" }
    ])
  );
}
