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
                const fileContent = fs.readFileSync(result[0], {
                  encoding: "utf8"
                });
                const appDataSerializer = new AppDataSerializer();
                main.current.setState({
                  appData: appDataSerializer.deserialize(fileContent)
                });
              }
            }
          },
          {
            label: "Save"
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
