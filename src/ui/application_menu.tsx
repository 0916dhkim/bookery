import { remote } from "electron";

export const applicationMenu = remote.Menu.buildFromTemplate([
  {
    label: "File",
    submenu: [
      { label: "Open File..." },
      { label: "Save" },
      { label: "Save As..." },
      { type: "separator" },
      { role: "quit" }
    ]
  },
  { role: "editMenu" }
]);
