import { remote } from "electron";

export enum ModifiedDialogOption {
  SAVE = 0,
  DONTSAVE = 1,
  CANCEL = 2
}

export function showModifiedDialogSync(message?: string): ModifiedDialogOption {
  message = message ? message : "Do you want to save changes?";

  const buttons = [];
  buttons[ModifiedDialogOption.SAVE] = "Save";
  buttons[ModifiedDialogOption.DONTSAVE] = "Don't Save";
  buttons[ModifiedDialogOption.CANCEL] = "Cancel";

  const dialogResponse = remote.dialog.showMessageBoxSync({
    type: "warning",
    buttons: buttons,
    defaultId: ModifiedDialogOption.CANCEL,
    message: message,
    cancelId: ModifiedDialogOption.CANCEL,
    noLink: true
  });

  return dialogResponse;
}
