import { remote } from "electron";

export const applicationMenu = new remote.Menu();

export const fileMenu = new remote.MenuItem({
  label: "File",
  submenu: []
});
applicationMenu.append(fileMenu);

export const openFileMenuItem = new remote.MenuItem({ label: "Open File..." });
fileMenu.submenu.append(openFileMenuItem);

export const saveMenuItem = new remote.MenuItem({ label: "Save" });
fileMenu.submenu.append(saveMenuItem);

export const saveAsMenuItem = new remote.MenuItem({ label: "Save As..." });
fileMenu.submenu.append(saveAsMenuItem);

applicationMenu.append(new remote.MenuItem({ role: "editMenu" }));
applicationMenu.append(new remote.MenuItem({ role: "viewMenu" }));
