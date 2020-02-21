import { remote } from "electron";

export enum DeleteUserDialogOption {
  OK = 0,
  CANCEL = 1
}

export function showDeleteUserDialogSync(): DeleteUserDialogOption {
  const buttons = [];
  buttons[DeleteUserDialogOption.OK] = "OK";
  buttons[DeleteUserDialogOption.CANCEL] = "Cancel";

  const dialogResponse = remote.dialog.showMessageBoxSync({
    type: "warning",
    buttons: buttons,
    defaultId: DeleteUserDialogOption.CANCEL,
    message: "Do you really want to delete this user?",
    cancelId: DeleteUserDialogOption.CANCEL,
    noLink: true
  });

  return dialogResponse;
}