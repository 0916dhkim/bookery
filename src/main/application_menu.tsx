import { Menu } from "electron";
import { EventEmitter } from "../event";

export function initializeApplicationMenu(emit: EventEmitter): void {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: "File",
        submenu: [
          {
            label: "New File",
            click: emit.bind(null, { type: "ON-NEW-FILE-MENU" })
          },
          {
            label: "Open File...",
            click: emit.bind(null, { type: "ON-OPEN-FILE-MENU" })
          },
          {
            label: "Save",
            click: emit.bind(null, { type: "ON-SAVE-MENU" })
          },
          {
            label: "Save As...",
            click: emit.bind(null, { type: "ON-SAVE-AS-MENU" })
          }
        ]
      },
      { role: "editMenu" },
      { role: "viewMenu" }
    ])
  );
}
