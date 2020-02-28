import { remote } from "electron";

export function showFormValidityErrorMessage(message?: string): void {
  message = message ? message : "Cannot save invalid forms.";

  return remote.dialog.showErrorBox("Forms Error", message);
}
