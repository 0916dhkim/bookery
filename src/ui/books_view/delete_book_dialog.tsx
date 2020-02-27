import { remote } from "electron";

export enum DeleteBookDialogOption {
  OK = 0,
  CANCEL = 1
}

export function showDeleteBookDialogSync(): DeleteBookDialogOption {
  const buttons =[];
  buttons[DeleteBookDialogOption.OK] = "OK";
  buttons[DeleteBookDialogOption.CANCEL] = "Cancel";

  const dialogResponse = remote.dialog.showMessageBoxSync({
    type: "warning",
    buttons: buttons,
    defaultId: DeleteBookDialogOption.CANCEL,
    message: "Do you really want to delete this book?",
    cancelId: DeleteBookDialogOption.CANCEL,
    noLink: true
  });

  return dialogResponse;
}
