import { AppData } from "../persistence/app_data";

export interface RendererInterface {
  getAppData: () => Promise<AppData>;
  setAppData: (appData: AppData) => Promise<void>;
  isModified: () => Promise<boolean>;
}
